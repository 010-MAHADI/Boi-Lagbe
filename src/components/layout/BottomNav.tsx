'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusCircle, MessageCircle, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const { t } = useLanguage();
  const pathname = usePathname();

  const items = [
    { href: '/', label: t('nav.home'), icon: Home },
    { href: '/listings', label: t('nav.browse'), icon: Search },
    { href: '/listings/new', label: t('nav.sell'), icon: PlusCircle, accent: true },
    { href: '/chat', label: t('nav.chat'), icon: MessageCircle },
    { href: '/profile', label: t('nav.profile'), icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-border-warm shadow-lg md:hidden pb-safe">
      <div className="flex items-center justify-around h-16">
        {items.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 min-w-[56px] transition-colors',
                item.accent
                  ? 'text-accent'
                  : isActive
                  ? 'text-primary'
                  : 'text-text-muted hover:text-text-secondary'
              )}
            >
              <div
                className={cn(
                  'p-1.5 rounded-xl transition-colors',
                  item.accent
                    ? 'bg-accent text-white shadow-sm'
                    : isActive
                    ? 'bg-primary-50'
                    : ''
                )}
              >
                <item.icon size={item.accent ? 22 : 20} />
              </div>
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
