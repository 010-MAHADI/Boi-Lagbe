'use client';

import { PriceOffer } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatPrice, timeAgo } from '@/lib/utils';
import { TrendingDown } from 'lucide-react';

interface PriceOfferFeedProps {
  offers: PriceOffer[];
}

export default function PriceOfferFeed({ offers }: PriceOfferFeedProps) {
  const { language, t } = useLanguage();

  if (offers.length === 0) {
    return (
      <p className="text-sm text-text-muted italic">{t('listing.detail.noOffers')}</p>
    );
  }

  const sorted = [...offers].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div>
      <h3 className="text-sm font-semibold text-text-main mb-2 flex items-center gap-1.5">
        <TrendingDown size={15} className="text-accent" />
        {t('listing.detail.recentOffers')}
      </h3>
      <div className="flex flex-wrap gap-2">
        {sorted.map((offer) => {
          const time = timeAgo(offer.created_at);
          return (
            <div
              key={offer.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-50 border border-accent-100 text-sm"
            >
              <span className="font-semibold text-accent-dark">
                {formatPrice(offer.offered_price)}
              </span>
              <span className="text-text-muted text-xs">
                · {language === 'bn' ? time.bn : time.en}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
