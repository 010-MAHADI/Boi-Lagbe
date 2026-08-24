'use client';

import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  /** Current query from the URL — the bar stays in sync when the user navigates. */
  value: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

/**
 * The forgiving-search entry point. Typing is local; the query is only pushed up
 * on submit (or when cleared), so the URL stays clean and shareable.
 */
export default function SearchBar({
  value,
  onSearch,
  placeholder,
  className,
  autoFocus,
}: SearchBarProps) {
  const { t } = useLanguage();
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(draft.trim());
      }}
      className={cn('relative w-full', className)}
    >
      <Search
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
        size={18}
      />
      <input
        type="search"
        value={draft}
        autoFocus={autoFocus}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder ?? t('browse.searchPlaceholder')}
        aria-label={t('browse.searchPlaceholder')}
        className="w-full pl-11 pr-24 py-3 rounded-[var(--radius-input)] border border-border-warm bg-white text-text-main placeholder:text-text-muted transition-all duration-200 [&::-webkit-search-cancel-button]:hidden"
      />
      {draft && (
        <button
          type="button"
          onClick={() => {
            setDraft('');
            onSearch('');
          }}
          aria-label={t('common.close')}
          className="absolute right-[5.5rem] top-1/2 -translate-y-1/2 p-1 rounded-full text-text-muted hover:bg-warm-surface transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>
      )}
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-[var(--radius-button)] text-sm font-medium transition-colors cursor-pointer"
      >
        {t('common.search')}
      </button>
    </form>
  );
}
