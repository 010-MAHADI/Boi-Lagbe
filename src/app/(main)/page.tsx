'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ArrowRight, BookOpen, FileText, BookMarked, TrendingUp, Users, Building2, Navigation } from 'lucide-react';
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

  const { listings, institutes, users } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  // Show entry modal on first visit if location status is idle
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
      {/* ===== HERO SECTION ===== */}
      <section className="gradient-hero text-white">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">
              {t('home.hero.title')}
            </h1>
            <p className="text-primary-100 text-base md:text-lg mb-8 leading-relaxed">
              {t('home.hero.subtitle')}
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('home.hero.searchPlaceholder')}
                className="w-full pl-12 pr-28 py-4 rounded-2xl text-text-main bg-white shadow-lg border-0 focus:ring-2 focus:ring-primary-light text-base"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-accent hover:bg-accent-dark text-white px-5 py-2.5 rounded-xl font-medium transition-colors cursor-pointer"
              >
                {t('common.search')}
              </button>
            </form>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 md:gap-16 mt-10">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <TrendingUp size={18} className="text-primary-200" />
                <span className="text-2xl md:text-3xl font-bold">{listings.length}+</span>
              </div>
              <span className="text-xs md:text-sm text-primary-200">{t('home.stats.listings')}</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Users size={18} className="text-primary-200" />
                <span className="text-2xl md:text-3xl font-bold">{users.length}+</span>
              </div>
              <span className="text-xs md:text-sm text-primary-200">{t('home.stats.users')}</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Building2 size={18} className="text-primary-200" />
                <span className="text-2xl md:text-3xl font-bold">{institutes.length}+</span>
              </div>
              <span className="text-xs md:text-sm text-primary-200">{t('home.stats.institutes')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== LOCATION PROMPT BANNER ===== */}
      <section className="bg-primary-50 border-b border-primary-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-primary-800">
              <MapPin size={16} />
              <span>
                {district ? `বর্তমান এলাকা: ${district}` : t('home.location.asking')}
              </span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={requestLocation}>
                {t('home.location.allow')}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setLocationModalOpen(true)}>
                {t('home.location.manual')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="max-w-6xl mx-auto px-4 py-10 md:py-14">
        <h2 className="text-xl md:text-2xl font-bold text-text-main mb-6 text-center">
          {t('home.categories.title')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Academic */}
          <Link href="/listings?category=academic_book" className="group">
            <div className="bg-white rounded-2xl border border-border-warm p-6 text-center card-hover shadow-[var(--shadow-card)]">
              <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                <BookOpen size={28} className="text-primary" />
              </div>
              <h3 className="font-semibold text-text-main mb-1">{t('home.categories.academic')}</h3>
              <p className="text-xs text-text-muted">{t('home.categories.academicDesc')}</p>
            </div>
          </Link>

          {/* General */}
          <Link href="/listings?category=general_book" className="group">
            <div className="bg-white rounded-2xl border border-border-warm p-6 text-center card-hover shadow-[var(--shadow-card)]">
              <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-accent-50 flex items-center justify-center group-hover:bg-accent-100 transition-colors">
                <BookMarked size={28} className="text-accent" />
              </div>
              <h3 className="font-semibold text-text-main mb-1">{t('home.categories.general')}</h3>
              <p className="text-xs text-text-muted">{t('home.categories.generalDesc')}</p>
            </div>
          </Link>

          {/* Notes */}
          <Link href="/listings?category=notes_suggestion" className="group">
            <div className="bg-white rounded-2xl border border-border-warm p-6 text-center card-hover shadow-[var(--shadow-card)]">
              <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-info-light flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <FileText size={28} className="text-info" />
              </div>
              <h3 className="font-semibold text-text-main mb-1">{t('home.categories.notes')}</h3>
              <p className="text-xs text-text-muted">{t('home.categories.notesDesc')}</p>
            </div>
          </Link>
        </div>
      </section>

      {/* ===== LATEST LISTINGS ===== */}
      <section className="bg-warm-surface">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-text-main">
              {t('home.latest')}
            </h2>
            <Link
              href="/listings"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              {t('common.seeAll')}
              <ArrowRight size={16} />
            </Link>
          </div>
          <ListingGrid listings={activeListings} />
        </div>
      </section>

      {/* ===== SELL CTA ===== */}
      <section className="max-w-6xl mx-auto px-4 py-10 md:py-14">
        <div className="bg-gradient-to-r from-accent to-accent-dark rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">{t('home.sellCta')}</h2>
          <p className="text-white/90 mb-6 max-w-md mx-auto">{t('home.sellCtaDesc')}</p>
          <Link href="/listings/new" onClick={handleSellClick}>
            <Button variant="outline" size="lg" className="!border-white !text-white hover:!bg-white/10">
              {t('nav.sell')} <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Entry Location Popup Modal */}
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
            আপনার কাছের পলিটেকনিক, কলেজ বা বিশ্ববিদ্যালয়ের শিক্ষার্থীদের বিক্রি করা বই সহজে খুঁজে পেতে জিপিএস লোকেশন চালু করুন।
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

      {/* Manual Location Selection Modal */}
      <LocationModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
      />
    </div>
  );
}
