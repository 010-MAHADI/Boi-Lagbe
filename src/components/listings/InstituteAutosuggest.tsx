'use client';

import { useMemo, useState } from 'react';
import { Check, Plus, Search } from 'lucide-react';
import { Institute, InstituteType } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from '@/contexts/LocationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/contexts/ToastContext';
import { searchInstitutesByName } from '@/lib/search';
import { DIVISIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';

interface InstituteAutosuggestProps {
  /** Narrows the suggestions and pre-fills the type of a newly added institute. */
  instituteType?: InstituteType;
  division?: string;
  district?: string;
  selected?: Institute;
  onSelect: (institute: Institute) => void;
  error?: string;
}

/**
 * Typo-tolerant institute picker.
 *
 * The list is never a hard gate: if a student's college is missing they can add it
 * from here, and it goes straight into the admin approval queue (plan §7) instead
 * of blocking the listing.
 */
export default function InstituteAutosuggest({
  instituteType,
  division,
  district,
  selected,
  onSelect,
  error,
}: InstituteAutosuggestProps) {
  const { language, t } = useLanguage();
  const { lat, lng } = useLocation();
  const { user } = useAuth();
  const { institutes, createInstitute } = useData();
  const { showToast } = useToast();

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  // New-institute form
  const [newName, setNewName] = useState('');
  const [newNameEn, setNewNameEn] = useState('');
  const [newDivision, setNewDivision] = useState(division ?? '');
  const [newDistrict, setNewDistrict] = useState(district ?? '');
  const [newError, setNewError] = useState<string>();

  const pool = useMemo(() => {
    let list = institutes;
    if (instituteType) list = list.filter((i) => i.type === instituteType);
    if (division) list = list.filter((i) => i.division === division);
    if (district) list = list.filter((i) => i.district === district);
    return list;
  }, [institutes, instituteType, division, district]);

  const suggestions = useMemo(
    () => searchInstitutesByName(pool, query, 8),
    [pool, query]
  );

  const newDistricts = newDivision ? DIVISIONS[newDivision]?.districts ?? [] : [];

  const handleAdd = () => {
    if (!newName.trim()) {
      setNewError(t('listing.create.step2.newInstituteName'));
      return;
    }
    if (!instituteType || !newDivision || !newDistrict) {
      setNewError(t('listing.create.error.institute'));
      return;
    }
    const institute = createInstitute({
      name: newName.trim(),
      name_en: newNameEn.trim() || newName.trim(),
      type: instituteType,
      division: newDivision,
      district: newDistrict,
      // The exact campus coordinates get corrected on approval; the buyer's own
      // position is a good enough anchor for distance sorting in the meantime.
      lat,
      lng,
      created_by: user?.id,
    });
    setNewError(undefined);
    setNewName('');
    setNewNameEn('');
    setAddOpen(false);
    setOpen(false);
    setQuery('');
    onSelect(institute);
    showToast(t('listing.create.step2.newInstituteAdded'), 'info');
  };

  return (
    <div>
      <label className="block text-sm font-medium text-text-main mb-1.5">
        {t('listing.create.step2.name')}
      </label>

      {selected && !open ? (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setQuery('');
          }}
          className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-[var(--radius-input)] border border-primary-200 bg-primary-50 text-left cursor-pointer"
        >
          <span className="min-w-0">
            <span className="block text-sm font-medium text-text-main truncate">
              {language === 'bn' ? selected.name : selected.name_en}
            </span>
            <span className="block text-xs text-text-muted truncate">
              {DIVISIONS[selected.division]?.[language] ?? selected.division} · {selected.district}
            </span>
          </span>
          <span className="shrink-0 flex items-center gap-1.5">
            {!selected.verified && (
              <Badge variant="warning">{t('listing.create.step2.unverified')}</Badge>
            )}
            <Check size={16} className="text-primary" />
          </span>
        </button>
      ) : (
        <div className="relative">
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            placeholder={t('listing.create.step2.namePlaceholder')}
            aria-label={t('listing.create.step2.name')}
            className={cn(
              'w-full pl-10 pr-4 py-2.5 rounded-[var(--radius-input)] border bg-white text-text-main placeholder:text-text-muted transition-all duration-200',
              error ? 'border-error' : 'border-border-warm'
            )}
          />
        </div>
      )}

      {open && (
        <div className="mt-1.5 rounded-[var(--radius-card)] border border-border-warm bg-white shadow-[var(--shadow-card)] overflow-hidden">
          <ul className="max-h-60 overflow-y-auto divide-y divide-border-warm">
            {suggestions.map((institute) => (
              <li key={institute.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(institute);
                    setOpen(false);
                    setQuery('');
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-warm-surface transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-main truncate">
                      {language === 'bn' ? institute.name : institute.name_en}
                    </span>
                    {!institute.verified && (
                      <Badge variant="warning">{t('listing.create.step2.unverified')}</Badge>
                    )}
                  </span>
                  <span className="block text-xs text-text-muted truncate">
                    {DIVISIONS[institute.division]?.[language] ?? institute.division} ·{' '}
                    {institute.district}
                  </span>
                </button>
              </li>
            ))}
            {suggestions.length === 0 && (
              <li className="px-4 py-3 text-sm text-text-muted">
                {t('listing.create.step2.instituteNotFound')}
              </li>
            )}
          </ul>
          <button
            type="button"
            onClick={() => {
              setNewName(query.trim());
              setNewDivision(division ?? '');
              setNewDistrict(district ?? '');
              setAddOpen(true);
            }}
            className="w-full flex items-center gap-1.5 px-4 py-2.5 border-t border-border-warm text-sm font-medium text-primary hover:bg-primary-50 transition-colors cursor-pointer"
          >
            <Plus size={15} />
            {t('listing.create.step2.addInstitute')}
          </button>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-error">{error}</p>}

      <Modal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title={t('listing.create.step2.newInstituteTitle')}
        size="sm"
      >
        <div className="space-y-3.5">
          <Input
            label={t('listing.create.step2.newInstituteName')}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t('listing.create.step2.namePlaceholder')}
          />
          <Input
            label={`${t('listing.create.step2.newInstituteNameEn')} (${t('common.optional')})`}
            value={newNameEn}
            onChange={(e) => setNewNameEn(e.target.value)}
            placeholder="Institute name in English"
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label={t('listing.create.step2.division')}
              value={newDivision}
              onChange={(e) => {
                setNewDivision(e.target.value);
                setNewDistrict('');
              }}
              options={[
                { value: '', label: t('listing.create.step2.levelPlaceholder') },
                ...Object.entries(DIVISIONS).map(([key, d]) => ({ value: key, label: d[language] })),
              ]}
            />
            <Select
              label={t('listing.create.step2.district')}
              value={newDistrict}
              disabled={!newDivision}
              onChange={(e) => setNewDistrict(e.target.value)}
              options={[
                { value: '', label: t('listing.create.step2.levelPlaceholder') },
                ...newDistricts.map((d) => ({ value: d.bn, label: d[language] })),
              ]}
            />
          </div>
          {newError && <p className="text-xs text-error">{newError}</p>}
          <div className="flex gap-3 pt-1">
            <Button variant="outline" fullWidth onClick={() => setAddOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button fullWidth onClick={handleAdd}>
              {t('listing.create.step2.newInstituteSubmit')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
