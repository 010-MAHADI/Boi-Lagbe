'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Eye, Heart } from 'lucide-react';
import { Listing } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from '@/contexts/LocationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/contexts/ToastContext';
import { formatPrice, timeAgo, calculateDistance, formatDistance, truncateText } from '@/lib/utils';
import ConditionBadge from './ConditionBadge';
import ListingImage from './ListingImage';

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const { language, t } = useLanguage();
  const { lat, lng } = useLocation();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite, getInstitute } = useData();
  const { showToast } = useToast();
  const router = useRouter();

  const isFav = user ? isFavorite(user.id, listing.id) : false;

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push(listing.slug ? `/login?next=/product/${listing.slug}` : `/login?next=/listings/${listing.id}`);
      return;
    }
    const nowFavorite = toggleFavorite(user.id, listing.id);
    showToast(t(nowFavorite ? 'favorites.added' : 'favorites.removed'));
  };

  // Institute: prefer the API-enriched object on the listing, fall back to DataContext lookup
  const institute = (listing as any)?.institute ?? (listing.institute_id ? getInstitute(listing.institute_id) : null);
  const distance = calculateDistance(lat, lng, listing.lat, listing.lng);
  const distanceText = formatDistance(distance);
  const timeText = timeAgo(listing.created_at);
  const description = listing.description_bn || listing.description_en || '';

  return (
    <Link href={listing.slug ? `/product/${listing.slug}` : `/listings/${listing.id}`} className="block group">
      <div className="bg-white rounded-[var(--radius-card)] border border-border-warm shadow-[var(--shadow-card)] overflow-hidden card-hover">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-warm-surface overflow-hidden">
          <ListingImage src={typeof listing.images?.[0] === 'string' ? listing.images[0] : (listing.images?.[0] as any)?.url} alt={listing.title} />
          {/* Favorite button */}
          <button
            onClick={handleFavorite}
            aria-label={t(isFav ? 'listing.detail.removeFavorite' : 'listing.detail.addFavorite')}
            aria-pressed={isFav}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm transition-all cursor-pointer"
          >
            <Heart
              size={16}
              className={isFav ? 'fill-error text-error' : 'text-text-muted'}
            />
          </button>
          {/* Condition badge */}
          <div className="absolute bottom-2 left-2">
            <ConditionBadge condition={listing.condition} />
          </div>
          {/* Sold overlay */}
          {listing.status === 'sold' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold text-lg bg-error px-4 py-1 rounded-full">
                {t('listing.detail.sold')}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          {/* Title */}
          <h3 className="text-sm font-semibold text-text-main leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {listing.title}
          </h3>

          {/* Description preview */}
          {description && (
            <p className="text-xs text-text-muted mt-1 line-clamp-1">
              {truncateText(description, 60)}
            </p>
          )}

          {/* Institute & Level */}
          {institute && (
            <p className="text-xs text-text-secondary mt-1.5 truncate">
              {language === 'bn' ? institute.name : institute.name_en}
              {listing.level_label && ` · ${listing.level_label}`}
            </p>
          )}

          {/* Price Row */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-accent-dark">
                {formatPrice(listing.price)}
              </span>
              {listing.negotiable && (
                <span className="text-[10px] text-text-muted">
                  {t('listing.detail.negotiable')}
                </span>
              )}
            </div>
            {listing.quantity > 1 && (
              <span className="text-xs text-text-muted">
                {listing.quantity} {t('listing.detail.quantityUnit')}
              </span>
            )}
          </div>

          {/* Meta Row */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-warm">
            <div className="flex items-center gap-1 text-xs text-text-muted">
              <MapPin size={12} />
              <span>{language === 'bn' ? distanceText.bn : distanceText.en}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <span className="flex items-center gap-0.5">
                <Eye size={11} />
                {listing.view_count}
              </span>
              <span>{language === 'bn' ? timeText.bn : timeText.en}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
