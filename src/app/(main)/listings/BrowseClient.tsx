'use client';

import { useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useData } from '@/contexts/DataContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from '@/contexts/LocationContext';
import { searchListings } from '@/lib/search';
import { SearchFilters } from '@/types';
import SearchBar from '@/components/listings/SearchBar';
import FilterBar from '@/components/listings/FilterBar';
import ListingGrid from '@/components/listings/ListingGrid';
import RadarScanner from '@/components/ui/RadarScanner';
import LocationModal from '@/components/ui/LocationModal';
import { SlidersHorizontal, MapPin } from 'lucide-react';

export default function BrowseClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { listings } = useData();
  const { t } = useLanguage();
  const { lat, lng, status: locStatus, district: locDistrict, requestLocation } = useLocation();

  // Read URL params
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = (searchParams.get('category') as SearchFilters['category']) || undefined;
  const initialInstituteType = (searchParams.get('type') as SearchFilters['institute_type']) || undefined;
  const initialDistrict = searchParams.get('district') || undefined;
  const initialLevel = searchParams.get('level') || undefined;
  const initialCondition = (searchParams.get('condition') as SearchFilters['condition']) || undefined;
  const initialSort = (searchParams.get('sort') as SearchFilters['sort_by']) || undefined;

  const [filters, setFilters] = useState<SearchFilters>({
    query: initialQuery || undefined,
    category: initialCategory,
    institute_type: initialInstituteType,
    district: initialDistrict,
    level_label: initialLevel,
    condition: initialCondition,
    sort_by: initialSort,
    lat,
    lng,
  });

  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const searchResults = useMemo(() => {
    return searchListings(listings, { ...filters, lat, lng });
  }, [listings, filters, lat, lng]);

  const filteredListings = useMemo(() => {
    return searchResults.map((r) => r.listing);
  }, [searchResults]);

  const handleFilterChange = (patch: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const handleClearFilters = () => {
    setFilters({
      query: undefined,
      category: undefined,
      institute_type: undefined,
      district: undefined,
      level_label: undefined,
      condition: undefined,
      sort_by: undefined,
      lat,
      lng,
    });
    router.push('/listings');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 page-enter">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-main">
            {t('listings.title')}
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {t('listings.subtitle')}
          </p>
        </div>

        {/* Location chip */}
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

          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-border-warm text-text-main text-xs font-medium shadow-xs cursor-pointer"
          >
            <SlidersHorizontal size={14} />
            <span>{t('common.filter')}</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar
          value={filters.query || ''}
          onSearch={(q) => handleFilterChange({ query: q || undefined })}
        />
      </div>

      {/* Main Filter Bar & Results Grid */}
      <div className="space-y-6">
        <FilterBar
          filters={filters}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
          resultCount={filteredListings.length}
        />

        {locStatus === 'requesting' ? (
          <RadarScanner />
        ) : (
          <ListingGrid
            listings={filteredListings}
            emptyMessage={t('listings.noResults')}
            emptyHint={t('listings.noResultsDesc')}
          />
        )}
      </div>

      {/* Manual Location Selection Modal */}
      <LocationModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
      />
    </div>
  );
}
