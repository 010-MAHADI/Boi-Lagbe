'use client';

import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { BookCondition, CategorySlug, InstituteType, SearchFilters } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { CATEGORIES, CONDITIONS, DIVISIONS, INSTITUTE_TYPES } from '@/lib/constants';
import { ALL_LEVELS, levelsForInstituteType } from '@/lib/levels';
import { cn } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';

interface FilterBarProps {
  filters: SearchFilters;
  onChange: (patch: Partial<SearchFilters>) => void;
  onClear: () => void;
  resultCount: number;
}

const SORTS: { value: NonNullable<SearchFilters['sort_by']>; key: string }[] = [
  { value: 'nearest', key: 'browse.sort.nearest' },
  { value: 'newest', key: 'browse.sort.newest' },
  { value: 'price_low', key: 'browse.sort.priceLow' },
  { value: 'price_high', key: 'browse.sort.priceHigh' },
];

/** Counts the filters that actually narrow the result set (sort does not). */
function activeFilterCount(filters: SearchFilters): number {
  const keys: (keyof SearchFilters)[] = [
    'category',
    'institute_type',
    'level_label',
    'condition',
    'min_price',
    'max_price',
    'division',
    'district',
  ];
  return keys.filter((k) => filters[k] !== undefined && filters[k] !== '').length;
}

export default function FilterBar({ filters, onChange, onClear, resultCount }: FilterBarProps) {
  const { language, t } = useLanguage();
  const [sheetOpen, setSheetOpen] = useState(false);

  const activeCount = activeFilterCount(filters);
  const levelOptions = levelsForInstituteType(filters.institute_type) ?? ALL_LEVELS;
  const districts = filters.division ? DIVISIONS[filters.division]?.districts ?? [] : [];

  return (
    <div className="space-y-3">
      {/* Category chips + sort */}
      <div className="flex items-center gap-2 overflow-x-auto scroll-hidden -mx-4 px-4 md:mx-0 md:px-0">
        <button
          type="button"
          onClick={() => onChange({ category: undefined })}
          className={cn(
            'shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer',
            !filters.category
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-text-secondary border-border-warm hover:border-primary-200'
          )}
        >
          {t('common.all')}
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange({ category: cat.slug as CategorySlug })}
            className={cn(
              'shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer',
              filters.category === cat.slug
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-text-secondary border-border-warm hover:border-primary-200'
            )}
          >
            <span className="mr-1">{cat.icon}</span>
            {language === 'bn' ? cat.name_bn : cat.name_en}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-button)] border border-border-warm bg-white text-sm font-medium text-text-main hover:border-primary-200 transition-colors cursor-pointer"
        >
          <SlidersHorizontal size={16} />
          {t('browse.filters')}
          {activeCount > 0 && (
            <span className="ml-0.5 inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-primary text-white text-[11px]">
              {activeCount}
            </span>
          )}
        </button>

        <select
          value={filters.sort_by ?? ''}
          onChange={(e) =>
            onChange({ sort_by: (e.target.value || undefined) as SearchFilters['sort_by'] })
          }
          aria-label={t('browse.sort')}
          className="px-3 py-2 rounded-[var(--radius-button)] border border-border-warm bg-white text-sm text-text-main cursor-pointer"
        >
          <option value="">{t('browse.sort')}</option>
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {t(s.key)}
            </option>
          ))}
        </select>

        <span className="ml-auto text-sm text-text-muted whitespace-nowrap">
          {resultCount} {t('browse.results')}
        </span>
      </div>

      {/* Active filter pills */}
      {activeCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {filters.institute_type && (
            <FilterPill
              label={
                INSTITUTE_TYPES.find((i) => i.value === filters.institute_type)?.[language] ?? ''
              }
              onRemove={() => onChange({ institute_type: undefined })}
            />
          )}
          {filters.level_label && (
            <FilterPill
              label={filters.level_label}
              onRemove={() => onChange({ level_label: undefined })}
            />
          )}
          {filters.condition && (
            <FilterPill
              label={CONDITIONS.find((c) => c.value === filters.condition)?.[language] ?? ''}
              onRemove={() => onChange({ condition: undefined })}
            />
          )}
          {filters.division && (
            <FilterPill
              label={DIVISIONS[filters.division]?.[language] ?? filters.division}
              onRemove={() => onChange({ division: undefined, district: undefined })}
            />
          )}
          {filters.district && (
            <FilterPill
              label={filters.district}
              onRemove={() => onChange({ district: undefined })}
            />
          )}
          {(filters.min_price !== undefined || filters.max_price !== undefined) && (
            <FilterPill
              label={`৳${filters.min_price ?? 0} – ৳${filters.max_price ?? '∞'}`}
              onRemove={() => onChange({ min_price: undefined, max_price: undefined })}
            />
          )}
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-primary hover:text-primary-dark underline cursor-pointer"
          >
            {t('browse.filters.clear')}
          </button>
        </div>
      )}

      <Modal
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={t('browse.filters.title')}
      >
        <div className="space-y-4">
          <Select
            label={t('browse.filters.instituteType')}
            value={filters.institute_type ?? ''}
            onChange={(e) =>
              onChange({
                institute_type: (e.target.value || undefined) as InstituteType | undefined,
                level_label: undefined,
              })
            }
            options={[
              { value: '', label: t('browse.filters.anyType') },
              ...INSTITUTE_TYPES.map((i) => ({ value: i.value, label: i[language] })),
            ]}
          />

          <Select
            label={t('browse.filters.semester')}
            value={filters.level_label ?? ''}
            onChange={(e) => onChange({ level_label: e.target.value || undefined })}
            options={[
              { value: '', label: t('browse.filters.anyLevel') },
              // Values are the Bangla labels because that is what listings store.
              ...levelOptions.map((l) => ({ value: l.bn, label: l[language] })),
            ]}
          />

          <Select
            label={t('browse.filters.condition')}
            value={filters.condition ?? ''}
            onChange={(e) =>
              onChange({ condition: (e.target.value || undefined) as BookCondition | undefined })
            }
            options={[
              { value: '', label: t('common.all') },
              ...CONDITIONS.map((c) => ({ value: c.value, label: c[language] })),
            ]}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label={t('browse.filters.division')}
              value={filters.division ?? ''}
              onChange={(e) =>
                onChange({ division: e.target.value || undefined, district: undefined })
              }
              options={[
                { value: '', label: t('common.all') },
                ...Object.entries(DIVISIONS).map(([key, d]) => ({
                  value: key,
                  label: d[language],
                })),
              ]}
            />
            <Select
              label={t('browse.filters.district')}
              value={filters.district ?? ''}
              disabled={!filters.division}
              onChange={(e) => onChange({ district: e.target.value || undefined })}
              options={[
                { value: '', label: t('common.all') },
                // Districts are stored on institutes as Bangla names.
                ...districts.map((d) => ({ value: d.bn, label: d[language] })),
              ]}
            />
          </div>

          <div>
            <p className="block text-sm font-medium text-text-main mb-1.5">
              {t('browse.filters.priceRange')}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                min={0}
                inputMode="numeric"
                placeholder={t('browse.filters.minPrice')}
                value={filters.min_price ?? ''}
                onChange={(e) =>
                  onChange({ min_price: e.target.value ? Number(e.target.value) : undefined })
                }
              />
              <Input
                type="number"
                min={0}
                inputMode="numeric"
                placeholder={t('browse.filters.maxPrice')}
                value={filters.max_price ?? ''}
                onChange={(e) =>
                  onChange({ max_price: e.target.value ? Number(e.target.value) : undefined })
                }
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" fullWidth onClick={onClear}>
              {t('browse.filters.clear')}
            </Button>
            <Button fullWidth onClick={() => setSheetOpen(false)}>
              {t('browse.filters.apply')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Badge variant="default" className="flex items-center gap-1">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label="remove filter"
        className="hover:text-error transition-colors cursor-pointer"
      >
        <X size={12} />
      </button>
    </Badge>
  );
}
