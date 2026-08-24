'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { ShieldCheck, Mail } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-primary-900 text-primary-100 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">📚</span>
              <span className="text-xl font-bold text-white">{t('app.name')}</span>
            </div>
            <p className="text-primary-200 text-sm leading-relaxed">
              {t('footer.about')}
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-3">লিংক</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/listings" className="text-sm text-primary-200 hover:text-white transition-colors">
                  {t('nav.browse')}
                </Link>
              </li>
              <li>
                <Link href="/wanted" className="text-sm text-primary-200 hover:text-white transition-colors">
                  {t('nav.wanted')}
                </Link>
              </li>
              <li>
                <Link href="/safety" className="flex items-center gap-1.5 text-sm text-primary-200 hover:text-white transition-colors">
                  <ShieldCheck size={14} />
                  {t('footer.safety')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-3">{t('footer.contact')}</h3>
            <a
              href="mailto:hello@boilagbe.com"
              className="flex items-center gap-1.5 text-sm text-primary-200 hover:text-white transition-colors"
            >
              <Mail size={14} />
              hello@boilagbe.com
            </a>
          </div>
        </div>

        <div className="border-t border-primary-800 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-primary-300">{t('footer.copyright')}</p>
          <p className="text-xs text-primary-300">{t('footer.madeWith')}</p>
        </div>
      </div>
    </footer>
  );
}
