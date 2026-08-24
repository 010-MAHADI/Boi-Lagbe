/**
 * Utility functions for Boi Lagbe
 */

/** Merge CSS class names, filtering out falsy values */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/** Format price in Bangladeshi Taka */
export function formatPrice(price: number): string {
  return `৳${price.toLocaleString('bn-BD')}`;
}

/** Calculate relative time ago in both Bangla and English */
export function timeAgo(dateString: string): { bn: string; en: string } {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMinutes < 1) return { bn: 'এইমাত্র', en: 'just now' };
  if (diffMinutes < 60) return { bn: `${toBanglaNum(diffMinutes)} মিনিট আগে`, en: `${diffMinutes}m ago` };
  if (diffHours < 24) return { bn: `${toBanglaNum(diffHours)} ঘণ্টা আগে`, en: `${diffHours}h ago` };
  if (diffDays < 7) return { bn: `${toBanglaNum(diffDays)} দিন আগে`, en: `${diffDays}d ago` };
  if (diffWeeks < 5) return { bn: `${toBanglaNum(diffWeeks)} সপ্তাহ আগে`, en: `${diffWeeks}w ago` };
  return { bn: `${toBanglaNum(diffMonths)} মাস আগে`, en: `${diffMonths}mo ago` };
}

/** Convert a number to Bangla numerals */
export function toBanglaNum(num: number): string {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/[0-9]/g, (d) => banglaDigits[parseInt(d)]);
}

/** Calculate distance between two coordinates using Haversine formula (returns km) */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Format distance for display */
export function formatDistance(km: number): { bn: string; en: string } {
  if (km < 1) {
    const meters = Math.round(km * 1000);
    return {
      bn: `${toBanglaNum(meters)} মিটার দূরে`,
      en: `${meters}m away`,
    };
  }
  const rounded = Math.round(km * 10) / 10;
  return {
    bn: `${toBanglaNum(rounded)} কি.মি. দূরে`,
    en: `${rounded} km away`,
  };
}

/** Truncate text with ellipsis */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
}

/** Get Tailwind CSS class for condition badge */
export function getConditionColor(condition: string): string {
  const colors: Record<string, string> = {
    new: 'badge-new',
    like_new: 'badge-like-new',
    good: 'badge-good',
    fair: 'badge-fair',
  };
  return colors[condition] || 'badge-good';
}

/** Generate a simple unique ID */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/** Get initials from a name (works with Bangla and English) */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/** Debounce function */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/** Format a date for display */
export function formatDate(dateString: string, language: 'bn' | 'en'): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', options);
}

/** Validate email format */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Validate Bangladesh phone number */
export function isValidBDPhone(phone: string): boolean {
  return /^(\+?88)?01[3-9]\d{8}$/.test(phone.replace(/[\s-]/g, ''));
}
