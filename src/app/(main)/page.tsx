'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, MapPin, ArrowRight, BookOpen, FileText, BookMarked,
  Navigation, ChevronRight, Tag,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from '@/contexts/LocationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import ListingGrid from '@/components/listings/ListingGrid';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import LocationModal from '@/components/ui/LocationModal';

export default function HomePage() {
  const { t } = useLanguage();
  const { status, district, requestLocation } = useLocation();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const { listings } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  useEffect(() => {
    if (status === 'idle') {
      const hasSeenPrompt = sessionStorage.getItem('boi-lagbe-location-prompt-seen');
      if (!hasSeenPrompt) {
        setEntryModalOpen(true);
        sessionStorage.setItem('boi-lagbe-location-prompt-seen', 'true');
      }
    }
  }, [status]);

  const activeListings = listings.filter((l) => l.status === 'active').slice(0, 8);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/listings?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSellClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      router.push('/login?redirect=/listings/new');
    }
  };

  return (
    <div className="page-enter">

      {/* ===== LOCATION BANNER ===== */}
      <section className="bg-primary-50 border-b border-primary-100">
        <div className="max-w-4xl mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-sm text-primary-800 min-w-0">
              <MapPin size={14} className="shrink-0 text-primary" />
              <span className="truncate font-medium">
                {district ? `বর্তমান এলাকা: ${district}` : t('home.location.asking')}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {district ? (
                <button
                  onClick={() => setLocationModalOpen(true)}
                  className="text-xs font-semibold text-primary hover:text-primary-dark border border-primary/30 hover:border-primary px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  লোকেশন পরিবর্তন করুন
                </button>
              ) : (
                <>
                  <Button size="sm" onClick={requestLocation}>
                    {t('home.location.allow')}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setLocationModalOpen(true)}>
                    {t('home.location.manual')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== HERO + SEARCH ===== */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(150deg, #134E4A 0%, #0F766E 55%, #0D9488 100%)' }}
      >
        {/* subtle background circle */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-[0.07] bg-white" />
        <div className="absolute -bottom-12 -left-12 w-60 h-60 rounded-full opacity-[0.06] bg-white" />

        <div className="relative max-w-4xl mx-auto px-4 pt-8 pb-10 md:pt-10 md:pb-12">
          {/* Text */}
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
              {t('home.hero.title')}
            </h1>
            <p className="mt-2 text-primary-100/90 text-sm md:text-base max-w-md mx-auto">
              {t('home.hero.subtitle')}
            </p>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative flex items-center bg-white rounded-xl shadow-xl overflow-hidden focus-within:ring-2 focus-within:ring-white/50 transition-all">
              <Search className="absolute left-4 text-text-muted shrink-0" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('home.hero.searchPlaceholder')}
                className="flex-1 pl-11 pr-2 py-3.5 bg-transparent text-text-main text-sm focus:outline-none placeholder:text-text-muted"
              />
              <button
                type="submit"
                className="m-1.5 bg-accent hover:bg-accent-dark text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors cursor-pointer shrink-0"
              >
                {t('common.search')}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg md:text-xl font-bold text-text-main">
            {t('home.categories.title')}
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {/* Academic */}
          <Link href="/listings?category=academic_book" className="group">
            <div className="bg-white rounded-2xl border border-border-warm p-4 md:p-6 text-center card-hover shadow-[var(--shadow-card)]">
              <div className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-3 rounded-xl bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                <BookOpen size={24} className="text-primary" />
              </div>
              <h3 className="font-semibold text-text-main text-xs md:text-sm mb-1 leading-snug">
                {t('home.categories.academic')}
              </h3>
              <p className="text-[11px] text-text-muted hidden md:block">
                {t('home.categories.academicDesc')}
              </p>
            </div>
          </Link>

          {/* General */}
          <Link href="/listings?category=general_book" className="group">
            <div className="bg-white rounded-2xl border border-border-warm p-4 md:p-6 text-center card-hover shadow-[var(--shadow-card)]">
              <div className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-3 rounded-xl bg-accent-50 flex items-center justify-center group-hover:bg-accent-100 transition-colors">
                <BookMarked size={24} className="text-accent" />
              </div>
              <h3 className="font-semibold text-text-main text-xs md:text-sm mb-1 leading-snug">
                {t('home.categories.general')}
              </h3>
              <p className="text-[11px] text-text-muted hidden md:block">
                {t('home.categories.generalDesc')}
              </p>
            </div>
          </Link>

          {/* Notes */}
          <Link href="/listings?category=notes_suggestion" className="group">
            <div className="bg-white rounded-2xl border border-border-warm p-4 md:p-6 text-center card-hover shadow-[var(--shadow-card)]">
              <div className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-3 rounded-xl bg-info-light flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <FileText size={24} className="text-info" />
              </div>
              <h3 className="font-semibold text-text-main text-xs md:text-sm mb-1 leading-snug">
                {t('home.categories.notes')}
              </h3>
              <p className="text-[11px] text-text-muted hidden md:block">
                {t('home.categories.notesDesc')}
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* ===== LATEST LISTINGS ===== */}
      <section className="bg-warm-surface border-t border-border-warm">
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg md:text-xl font-bold text-text-main flex items-center gap-2">
              <span className="inline-block w-1 h-5 bg-primary rounded-full" />
              {t('home.latest')}
            </h2>
            <Link
              href="/listings"
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              {t('common.seeAll')}
              <ChevronRight size={14} />
            </Link>
          </div>
          <ListingGrid listings={activeListings} />
        </div>
      </section>

      {/* ===== SELL CTA ===== */}
      <section className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div
          className="relative overflow-hidden rounded-2xl p-8 md:p-12 text-white text-center"
          style={{ background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)' }}
        >
          {/* Decorative circle */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/10" />

          <div className="relative">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-4">
              <Tag size={22} className="text-white" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-2">{t('home.sellCta')}</h2>
            <p className="text-white/85 mb-6 max-w-sm mx-auto text-sm leading-relaxed">
              {t('home.sellCtaDesc')}
            </p>
            <Link href="/listings/new" onClick={handleSellClick}>
              <button className="inline-flex items-center gap-2 bg-white text-accent-dark hover:bg-white/90 px-6 py-3 rounded-xl font-semibold text-sm transition-colors cursor-pointer shadow-lg">
                {t('nav.sell')}
                <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Entry Location Modal */}
      <Modal
        isOpen={entryModalOpen}
        onClose={() => setEntryModalOpen(false)}
        title="অবস্থান অনুমোদন"
        size="sm"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary-50 text-primary flex items-center justify-center mx-auto">
            <MapPin size={32} />
          </div>
          <h3 className="text-lg font-bold text-text-main">আপনার কাছের বই দেখাতে লোকেশন দরকার</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            আপনার কাছের পলিটেকনিক, কলেজ বা বিশ্ববিদ্যালয়ের শিক্ষার্থীদের বিক্রি করা বই সহজে খুঁজে পেতে জিপিএস লোকেশন চালু করুন।
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                requestLocation();
                setEntryModalOpen(false);
              }}
            >
              <Navigation size={16} /> অ্যালউ করুন
            </Button>
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setEntryModalOpen(false)}
            >
              পরে করব
            </Button>
          </div>
        </div>
      </Modal>

      {/* Manual Location Modal */}
      <LocationModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
      />
    </div>
  );
}
