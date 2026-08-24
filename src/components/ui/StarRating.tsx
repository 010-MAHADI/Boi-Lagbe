'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  showValue?: boolean;
  count?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({
  rating,
  maxStars = 5,
  size = 16,
  showValue = false,
  count,
  interactive = false,
  onChange,
}: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {Array.from({ length: maxStars }, (_, i) => {
          const filled = i < Math.floor(rating);
          const halfFilled = !filled && i < rating;

          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange?.(i + 1)}
              className={cn(
                'p-0 border-0 bg-transparent',
                interactive && 'cursor-pointer hover:scale-110 transition-transform'
              )}
            >
              <Star
                size={size}
                className={cn(
                  filled ? 'fill-warning text-warning' : halfFilled ? 'fill-warning/50 text-warning' : 'fill-none text-border-strong'
                )}
              />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm text-text-secondary ml-1">
          {rating.toFixed(1)}
          {count !== undefined && <span className="text-text-muted"> ({count})</span>}
        </span>
      )}
    </div>
  );
}
