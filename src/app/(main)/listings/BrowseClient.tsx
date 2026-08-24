'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from '@/contexts/LocationContext';
import { listingsApi } from '@/lib/api';
import { Listing, SearchFilters } from '@/types';
import SearchBar from '@/components/listings/SearchBar';
import FilterBar from '@/components/listings/FilterBar';
import ListingGrid from '@/components/listings/ListingGrid';
import RadarScanner from '@/components/ui/RadarScanner';
import LocationModal from '@/components/ui/LocationModal';
import Button from '@/components/ui/Button';
import { SlidersHorizontal, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

export default function BrowseClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLanguage();
  const { lat, lng, status: locStatus, district: locDistrict, requestLocation } = useLocation();

  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || undefined,
    category: (searchParams.get('category') as SearchFilters['category']) || undefined,
    institute_type: (searchParams.get('type') as SearchFilters['institute_type']) || undefined,
    district: searchParams.get('district') || undefined,
    level_label: searchParams.get('level') || undefined,
    condition: (searchParams.get('condition') as SearchFilters['condition']) || undefined,
    sort_by: (searchParams.get('sort') as SearchFilters['sort_by']) || 'newest',
    lat,
    lng,
  });

  const PAGE_SIZE = 20;

  const fetchListings = useCallback(async (currentFilters: SearchFilters, currentPage: number) => {
    setLoading(true);
    try {
      const result = await listingsApi.search({
        ...currentFilters,
        lat: currentFilters.lat ?? lat ?? undefined,
        lng: currentFilters.lng ?? lng ?? undefined,
        page: currentPage,
        page_size: PAGE_SIZE,
      });
      // API returns ListingOut with images as objects; cast safely
      setListings(result.items as unknown as Listing[]);
      setTotal(result.total);
    } catch (e) {
      console.warn('Search failed', e);
    } finally {
      setLoading(false);
    }
  }, [lat, lng]);

  // Fetch on filter or page change
  useEffect(() => {
    fetchListings(filters, page);
  }, [filters, page, fetchListings]);

  // Sync lat/lng into filters once location resolves
  useEffect(() => {
    if (lat && lng) {
      setFilters((prev) => ({ ...prev, lat, lng }));
    }
  }, [lat, lng]);

  const handleFilterChange = (patch: Partial<SearchFilters>) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const handleClearFilters = () => {
    setPage(1);
    setFilters({ sort_by: 'newest', lat, lng });
    router.push('/listings');
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 page-enter">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-main">
            {t('listings.title')}
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {total > 0 ? `${total} টি বই পাওয়া গেছে` : t('listings.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {locDistrict ? (
            <button
              onClick={() => setLocationModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 text-primary-800 text-xs font-medium border border-primary-200 hover:bg-primary-100 transition-colors cursor-pointer"
            >
              <MapPin size={14} className="text-primary" />
              <span>{locDistrict}</span>
            </button>
          ) : (
            <button
              onClick={requestLocation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warm-surface text-text-muted hover:text-text-main text-xs font-medium border border-border-warm transition-colors cursor-pointer"
            >
              <MapPin size={14} />
              <span>{t('home.location.allow')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar
          value={filters.query || ''}
          onSearch={(q) => handleFilterChange({ query: q || undefined })}
        />
      </div>

      <div className="space-y-6">
        <FilterBar
          filters={filters}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
          resultCount={total}
        />

        {locStatus === 'requesting' ? (
          <RadarScanner />
        ) : loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <ListingGrid
              listings={listings}
              emptyMessage={t('listings.noResults')}
              emptyHint={t('listings.noResultsDesc')}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft size={16} /> আগের পাতা
                </Button>
                <span className="text-sm text-text-muted">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  পরের পাতা <ChevronRight size={16} />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <LocationModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
      />
    </div>
  );
}
