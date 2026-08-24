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
import LocationModal from '@/components/ui/LocationModal';
import Button from '@/components/ui/Button';
import { MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

/** Animated radar-finder loading state shown while searching or acquiring location */
function RadarSearchState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center select-none">
      {/* Radar rings */}
      <div className="relative w-32 h-32 flex items-center justify-center mb-6">
        {/* Outermost slow pulse */}
        <span className="absolute inset-0 rounded-full border-2 border-primary/15 animate-[ping_2s_ease-in-out_infinite]" />
        {/* Mid ring */}
        <span className="absolute inset-4 rounded-full border border-primary/30 animate-[ping_2s_ease-in-out_0.4s_infinite]" />
        {/* Inner ring */}
        <span className="absolute inset-8 rounded-full border border-primary/50 animate-[ping_2s_ease-in-out_0.8s_infinite]" />
        {/* Filled base circle */}
        <span className="absolute inset-10 rounded-full bg-primary/10" />
        {/* Rotating sweep line */}
        <span className="absolute inset-0 rounded-full overflow-hidden">
          <span className="absolute inset-0 origin-center animate-spin [animation-duration:2s]">
            <span className="absolute top-1/2 left-1/2 w-1/2 h-px bg-gradient-to-r from-primary to-transparent origin-left" />
          </span>
        </span>
        {/* Center dot */}
        <span className="relative z-10 w-4 h-4 rounded-full bg-primary shadow-lg shadow-primary/40" />
      </div>

      <p className="text-sm font-semibold text-text-main tracking-wide">{label}</p>
      <p className="text-xs text-text-muted mt-1">একটু অপেক্ষা করুন...</p>
    </div>
  );
}

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

  const isScanning = locStatus === 'requesting' || loading;
  const scanLabel = locStatus === 'requesting'
    ? 'আশেপাশের বই স্ক্যান করা হচ্ছে...'
    : filters.query
    ? `"${filters.query}" খোঁজা হচ্ছে...`
    : 'বই খোঁজা হচ্ছে...';

  return (
    <div className="max-w-6xl mx-auto px-4 pt-4 pb-6 md:py-8 page-enter">
      {/* Search Bar + Location */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1">
          <SearchBar
            value={filters.query || ''}
            onSearch={(q) => handleFilterChange({ query: q || undefined })}
          />
        </div>
        {locDistrict ? (
          <button
            onClick={() => setLocationModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-2 rounded-full bg-primary-50 text-primary-800 text-xs font-medium border border-primary-200 hover:bg-primary-100 transition-colors cursor-pointer shrink-0"
          >
            <MapPin size={14} className="text-primary" />
            <span className="hidden sm:inline">{locDistrict}</span>
          </button>
        ) : (
          <button
            onClick={requestLocation}
            className="flex items-center gap-1 px-2.5 py-2 rounded-full bg-warm-surface text-text-muted hover:text-text-main text-xs font-medium border border-border-warm transition-colors cursor-pointer shrink-0"
          >
            <MapPin size={14} />
            <span className="hidden sm:inline">{t('home.location.allow')}</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        <FilterBar
          filters={filters}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
          resultCount={total}
        />

        {isScanning ? (
          <RadarSearchState label={scanLabel} />
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
