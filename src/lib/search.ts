/**
 * Forgiving search — the client-side stand-in for the Postgres plan (§8).
 *
 * The production design blends two Postgres signals:
 *   1. `to_tsvector('simple', ...) @@ plainto_tsquery(...)`  → token / word matches
 *   2. `similarity(title, query)` from `pg_trgm`              → typo tolerance
 * and sorts by a weighted mix of the two, then by distance (PostGIS `ST_Distance`).
 *
 * This module reproduces the same scoring shape in TypeScript so the UI behaves
 * identically once the queries move server-side: swap `searchListings` for a
 * `fetch('/api/listings?...')` and nothing above it changes.
 */

import { Listing, SearchFilters } from '@/types';
import { calculateDistance } from '@/lib/utils';
import { getInstituteById } from '@/lib/mockData';

/** Strip punctuation, collapse whitespace, lowercase. Works for Bangla and Latin. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()[\]'"?|\\<>+]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Split into word tokens. */
function tokenize(text: string): string[] {
  const normalized = normalize(text);
  return normalized ? normalized.split(' ') : [];
}

/** Trigram set of a string, padded like Postgres `show_trgm` does. */
function trigrams(text: string): Set<string> {
  const padded = `  ${normalize(text)} `;
  const grams = new Set<string>();
  for (let i = 0; i < padded.length - 2; i++) {
    grams.add(padded.slice(i, i + 3));
  }
  return grams;
}

/**
 * Jaccard trigram similarity in [0, 1] — the same measure `pg_trgm.similarity()`
 * uses, so a typo like "ইলেকট্রিকাল" vs "ইলেকট্রিক্যাল" still scores highly.
 */
export function trigramSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const setA = trigrams(a);
  const setB = trigrams(b);
  let shared = 0;
  setA.forEach((g) => {
    if (setB.has(g)) shared++;
  });
  const union = setA.size + setB.size - shared;
  return union === 0 ? 0 : shared / union;
}

/**
 * Token-level score: how many query words are found in the haystack, counting a
 * prefix match ("অ্যালগো" → "অ্যালগোরিদম") as a partial hit. This is the
 * `tsvector @@ tsquery` half of the blend, softened so partial words still land.
 */
function tokenScore(queryTokens: string[], haystack: string): number {
  if (queryTokens.length === 0) return 0;
  const hayTokens = tokenize(haystack);
  if (hayTokens.length === 0) return 0;

  let total = 0;
  for (const qt of queryTokens) {
    let best = 0;
    for (const ht of hayTokens) {
      if (ht === qt) {
        best = 1;
        break;
      }
      if (ht.startsWith(qt) || qt.startsWith(ht)) {
        best = Math.max(best, 0.8);
      } else if (ht.includes(qt) && qt.length >= 3) {
        best = Math.max(best, 0.6);
      } else {
        // Typo tolerance for a single word pair.
        const sim = trigramSimilarity(qt, ht);
        if (sim > 0.45) best = Math.max(best, sim * 0.7);
      }
    }
    total += best;
  }
  return total / queryTokens.length;
}

/** Fields a listing is matched on, with the weight each carries. */
function searchableFields(listing: Listing): { text: string; weight: number }[] {
  const institute = listing.institute_id ? getInstituteById(listing.institute_id) : undefined;
  return [
    { text: listing.title, weight: 1 },
    { text: listing.author ?? '', weight: 0.7 },
    { text: listing.level_label ?? '', weight: 0.5 },
    { text: institute ? `${institute.name} ${institute.name_en}` : '', weight: 0.45 },
    { text: listing.description_bn ?? '', weight: 0.3 },
    { text: listing.description_en ?? '', weight: 0.3 },
  ];
}

/**
 * Relevance of one listing to a free-text query, in [0, 1].
 * Blends the token score (70%) with whole-string trigram similarity (30%),
 * mirroring the ranking expression in the plan.
 */
export function relevanceScore(listing: Listing, query: string): number {
  const q = normalize(query);
  if (!q) return 0;
  const queryTokens = tokenize(query);

  let best = 0;
  for (const field of searchableFields(listing)) {
    if (!field.text) continue;
    const blended =
      0.7 * tokenScore(queryTokens, field.text) + 0.3 * trigramSimilarity(query, field.text);
    best = Math.max(best, blended * field.weight);
  }
  return best;
}

/** Anything at or above this is considered a match — forgiving on purpose. */
export const MATCH_THRESHOLD = 0.18;

/** Apply the non-text filters from `SearchFilters`. */
function passesFilters(listing: Listing, filters: SearchFilters): boolean {
  if (filters.category && listing.category_slug !== filters.category) return false;
  if (filters.condition && listing.condition !== filters.condition) return false;
  if (filters.institute_id && listing.institute_id !== filters.institute_id) return false;
  if (filters.level_label && listing.level_label !== filters.level_label) return false;
  if (filters.min_price !== undefined && listing.price < filters.min_price) return false;
  if (filters.max_price !== undefined && listing.price > filters.max_price) return false;

  if (filters.institute_type || filters.division || filters.district) {
    const institute = listing.institute_id ? getInstituteById(listing.institute_id) : undefined;
    if (!institute) return false;
    if (filters.institute_type && institute.type !== filters.institute_type) return false;
    if (filters.division && institute.division !== filters.division) return false;
    if (filters.district && institute.district !== filters.district) return false;
  }

  return true;
}

export interface SearchResult {
  listing: Listing;
  score: number;
  distanceKm: number;
}

/**
 * Filter + rank listings. Sold listings sink to the bottom rather than vanishing,
 * so a buyer arriving from a stale link still sees context.
 */
export function searchListings(listings: Listing[], filters: SearchFilters): SearchResult[] {
  const hasQuery = !!filters.query && normalize(filters.query).length > 0;
  const lat = filters.lat;
  const lng = filters.lng;

  const results: SearchResult[] = [];

  for (const listing of listings) {
    if (!passesFilters(listing, filters)) continue;

    const score = hasQuery ? relevanceScore(listing, filters.query!) : 1;
    if (hasQuery && score < MATCH_THRESHOLD) continue;

    const distanceKm =
      lat !== undefined && lng !== undefined
        ? calculateDistance(lat, lng, listing.lat, listing.lng)
        : Number.POSITIVE_INFINITY;

    results.push({ listing, score, distanceKm });
  }

  const sortBy = filters.sort_by ?? (hasQuery ? undefined : 'newest');

  results.sort((a, b) => {
    // Active listings always outrank sold ones.
    const soldDiff = Number(a.listing.status === 'sold') - Number(b.listing.status === 'sold');
    if (soldDiff !== 0) return soldDiff;

    switch (sortBy) {
      case 'nearest':
        if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
        break;
      case 'price_low':
        if (a.listing.price !== b.listing.price) return a.listing.price - b.listing.price;
        break;
      case 'price_high':
        if (a.listing.price !== b.listing.price) return b.listing.price - a.listing.price;
        break;
      case 'newest':
        return (
          new Date(b.listing.created_at).getTime() - new Date(a.listing.created_at).getTime()
        );
      default:
        break;
    }

    // No explicit sort (or a tie): relevance first, then distance, then recency.
    if (Math.abs(a.score - b.score) > 0.001) return b.score - a.score;
    if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
    return new Date(b.listing.created_at).getTime() - new Date(a.listing.created_at).getTime();
  });

  return results;
}

/** Fuzzy institute lookup for the create-listing autosuggest. */
export function searchInstitutesByName<T extends { name: string; name_en: string }>(
  institutes: T[],
  query: string,
  limit = 8
): T[] {
  const q = normalize(query);
  if (!q) return institutes.slice(0, limit);

  const queryTokens = tokenize(query);

  return institutes
    .map((institute) => {
      const haystack = `${institute.name} ${institute.name_en}`;
      const score =
        0.7 * tokenScore(queryTokens, haystack) + 0.3 * trigramSimilarity(query, haystack);
      return { institute, score };
    })
    .filter((entry) => entry.score >= 0.12)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.institute);
}
