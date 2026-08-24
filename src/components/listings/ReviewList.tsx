'use client';

import { Review } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { timeAgo } from '@/lib/utils';
import Avatar from '@/components/ui/Avatar';
import StarRating from '@/components/ui/StarRating';

interface ReviewListProps {
  reviews: Review[];
  emptyMessage?: string;
}

export default function ReviewList({ reviews, emptyMessage }: ReviewListProps) {
  const { language, t } = useLanguage();

  if (reviews.length === 0) {
    return (
      <p className="text-sm text-text-muted text-center py-8">
        {emptyMessage ?? t('review.empty')}
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {reviews.map((review) => {
        const time = timeAgo(review.created_at);
        return (
          <li
            key={review.id}
            className="bg-white rounded-[var(--radius-card)] border border-border-warm p-4"
          >
            <div className="flex items-start gap-3">
              <Avatar name={review.reviewer_name} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-text-main truncate">
                    {review.reviewer_name}
                  </span>
                  <span className="text-xs text-text-muted shrink-0">
                    {language === 'bn' ? time.bn : time.en}
                  </span>
                </div>
                <StarRating rating={review.rating} size={13} />
                {review.comment && (
                  <p className="text-sm text-text-secondary mt-1.5 leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
