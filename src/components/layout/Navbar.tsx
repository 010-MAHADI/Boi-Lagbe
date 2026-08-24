'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, PlusCircle, User, Menu, X, MessageCircle, Heart, Shield } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import LanguageToggle from './LanguageToggle';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const { t } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdminPage = pathname.startsWith('/admin');

  const navLinks = isAdminPage
    ? []
    : [
        { href: '/listings', label: t('nav.browse'), icon: BookOpen },
        { href: '/listings/new', label: t('nav.sell'), icon: PlusCircle },
        { href: '/wanted', label: t('nav.wanted'), icon: Heart },
      ];

  const authLinks = !isAdminPage && isAuthenticated
    ? [
        { href: '/chat', label: t('nav.chat'), icon: MessageCircle },
        { href: '/favorites', label: t('nav.favorites'), icon: Heart },
        { href: '/profile', label: t('nav.profile'), icon: User },
      ]
    : [];

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border-warm shadow-[var(--shadow-nav)]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/logo.png"
              alt="বই লাগবে লোগো"
              width={36}
              height={36}
              className="rounded-md object-contain"
              priority
            />
            <span className="text-xl font-bold text-primary group-hover:text-primary-dark transition-colors">
              {t('app.name')}
            </span>
            {isAdminPage && (
              <span className="ml-2 px-2.5 py-0.5 rounded-full bg-primary-50 border border-primary-200 text-primary font-bold text-xs flex items-center gap-1">
                <Shield size={13} />
                অ্যাডমিন প্যানেল
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          {!isAdminPage && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname === link.href
                      ? 'bg-primary-50 text-primary'
                      : 'text-text-secondary hover:bg-warm-surface hover:text-text-main'
                  )}
                >
                  <link.icon size={17} />
                  {link.label}
                </Link>
              ))}
              {authLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname === link.href
                      ? 'bg-primary-50 text-primary'
                      : 'text-text-secondary hover:bg-warm-surface hover:text-text-main'
                  )}
                >
                  <link.icon size={17} />
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageToggle />
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-text-secondary">{user?.name}</span>
                <button
                  onClick={logout}
                  className="text-sm text-text-muted hover:text-error transition-colors cursor-pointer"
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary-50 rounded-lg transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
                >
                  {t('nav.signup')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageToggle />
            {!isAdminPage && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-warm-surface text-text-secondary cursor-pointer"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {!isAdminPage && mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-border-warm space-y-1 animate-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-primary-50 text-primary'
                    : 'text-text-secondary hover:bg-warm-surface'
                )}
              >
                <link.icon size={18} />
                {link.label}
              </Link>
            ))}
            {authLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-primary-50 text-primary'
                    : 'text-text-secondary hover:bg-warm-surface'
                )}
              >
                <link.icon size={18} />
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-border-warm mt-2">
              {isAuthenticated ? (
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2.5 text-sm font-medium text-error hover:bg-error-light rounded-lg transition-colors cursor-pointer"
                >
                  {t('nav.logout')}
                </button>
              ) : (
                <div className="flex gap-2 px-3">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2.5 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary-50"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
                  >
                    {t('nav.signup')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
