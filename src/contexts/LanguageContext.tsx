'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import bnDict from '../../public/locales/bn.json';
import enDict from '../../public/locales/en.json';

type Language = 'bn' | 'en';
type Dictionary = Record<string, string>;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const dictionaries: Record<Language, Dictionary> = {
  bn: bnDict as Dictionary,
  en: enDict as Dictionary,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getStoredLanguage(): Language | null {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem('boi-lagbe-lang');
  return saved === 'bn' || saved === 'en' ? saved : null;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Always start Bangla-first so the server and the first client render agree;
  // a stored English preference is applied right after mount.
  const [language, setLanguageState] = useState<Language>('bn');

  useEffect(() => {
    const saved = getStoredLanguage();
    if (saved) setLanguageState(saved);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('boi-lagbe-lang', lang);
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  }, [language, setLanguage]);

  const t = useCallback(
    (key: string, params?: Record<string, string>): string => {
      let text = dictionaries[language][key] || key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text.replace(`{${k}}`, v);
        });
      }
      return text;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export { LanguageContext };
