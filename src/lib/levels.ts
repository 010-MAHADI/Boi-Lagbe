import { InstituteType } from '@/types';
import { POLYTECHNIC_SEMESTERS, SCHOOL_CLASSES, UNIVERSITY_YEARS } from '@/lib/constants';

export interface LevelOption {
  value: string;
  bn: string;
  en: string;
}

/**
 * Class / semester / year vocabulary.
 *
 * `Listing.level_label` stores the **Bangla** label (that is what the seeded data
 * uses and what the Postgres column will hold), so filtering compares labels
 * directly. `displayLevel` reverse-maps that label for the English UI.
 */
export const ALL_LEVELS: LevelOption[] = [
  ...POLYTECHNIC_SEMESTERS,
  ...UNIVERSITY_YEARS,
  ...SCHOOL_CLASSES,
];

/** The levels that make sense for a given institute type. */
export function levelsForInstituteType(type?: InstituteType): LevelOption[] {
  switch (type) {
    case 'polytechnic':
      return POLYTECHNIC_SEMESTERS;
    case 'university':
      return UNIVERSITY_YEARS;
    case 'school':
    case 'college':
    case 'madrasah':
    case 'coaching':
      return SCHOOL_CLASSES;
    default:
      return ALL_LEVELS;
  }
}

/** Bangla label → the label to show in the current language. */
export function displayLevel(label: string | undefined, language: 'bn' | 'en'): string {
  if (!label) return '';
  if (language === 'bn') return label;
  const match = ALL_LEVELS.find((l) => l.bn === label);
  return match ? match.en : label;
}
