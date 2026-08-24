/**
 * Seller ratings.
 *
 * `User.rating_avg` / `rating_count` are the lifetime aggregate the future API will
 * keep on the users table; `mockReviews` only carries a sample of the comments
 * behind it. So a seller's displayed score is that aggregate plus every review
 * written in this session — counting the seeded comments again would double-count
 * ratings already folded into the aggregate.
 */

import { Review, User } from '@/types';
import { mockReviews } from '@/lib/mockData';

const SEEDED_REVIEW_IDS = new Set(mockReviews.map((r) => r.id));

export interface RatingSummary {
  avg: number;
  count: number;
}

export function ratingFor(user: User | undefined, reviews: Review[]): RatingSummary {
  if (!user) return { avg: 0, count: 0 };

  const fresh = reviews.filter(
    (r) => r.reviewed_user_id === user.id && !SEEDED_REVIEW_IDS.has(r.id)
  );

  const count = user.rating_count + fresh.length;
  if (count === 0) return { avg: 0, count: 0 };

  const total =
    user.rating_avg * user.rating_count + fresh.reduce((sum, r) => sum + r.rating, 0);

  return { avg: total / count, count };
}
