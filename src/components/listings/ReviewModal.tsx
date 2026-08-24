'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/contexts/ToastContext';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import StarRating from '@/components/ui/StarRating';
import Textarea from '@/components/ui/Textarea';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** The seller being rated. */
  reviewedUserId: string;
  reviewerId: string;
  reviewerName: string;
  /** The deal this rating belongs to — one rating per listing per reviewer. */
  listingId: string;
}

/**
 * Post-deal rating (plan §3.9). Opens once the buyer says the deal is done, and
 * `hasReviewed` keeps it from being reopened for the same listing.
 */
export default function ReviewModal({
  isOpen,
  onClose,
  reviewedUserId,
  reviewerId,
  reviewerName,
  listingId,
}: ReviewModalProps) {
  const { t } = useLanguage();
  const { addReview, hasReviewed } = useData();
  const { showToast } = useToast();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string>();

  const already = hasReviewed(reviewerId, listingId);

  const close = () => {
    setRating(0);
    setComment('');
    setError(undefined);
    onClose();
  };

  const handleSubmit = () => {
    if (rating < 1) {
      setError(t('review.chooseRating'));
      return;
    }
    addReview({
      reviewed_user_id: reviewedUserId,
      reviewer_id: reviewerId,
      reviewer_name: reviewerName,
      listing_id: listingId,
      rating,
      comment: comment.trim() || undefined,
    });
    close();
    showToast(t('review.success'));
  };

  return (
    <Modal isOpen={isOpen} onClose={close} title={t('review.rateSeller')} size="sm">
      {already ? (
        <div className="text-center py-4">
          <div className="text-4xl mb-3">🙏</div>
          <p className="text-sm text-text-secondary">{t('review.already')}</p>
          <Button className="mt-5" fullWidth onClick={close}>
            {t('common.ok')}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">{t('review.subtitle')}</p>

          <div>
            <p className="text-sm font-medium text-text-main mb-2">{t('review.chooseRating')}</p>
            <StarRating
              rating={rating}
              size={30}
              interactive
              onChange={(value) => {
                setRating(value);
                setError(undefined);
              }}
            />
          </div>

          <Textarea
            label={t('review.comment')}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('review.commentPlaceholder')}
            maxLength={300}
            showCount
            rows={3}
          />

          {error && <p className="text-xs text-error">{error}</p>}

          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={close}>
              {t('common.cancel')}
            </Button>
            <Button fullWidth onClick={handleSubmit}>
              {t('review.submit')}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
