'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageToggle() {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border-warm hover:bg-warm-surface text-sm font-medium text-text-secondary hover:text-text-main transition-colors cursor-pointer"
      title={t('language.switch')}
    >
      <Globe size={15} />
      <span>{language === 'bn' ? 'EN' : 'বাং'}</span>
    </button>
  );
}
