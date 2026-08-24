'use client';

import { useState } from 'react';
import { Flag } from 'lucide-react';
import { ReportReason, ReportTargetType } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/contexts/ToastContext';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: string;
  reporterId: string;
}

const REASONS: ReportReason[] = ['already_sold', 'spam', 'scam', 'inappropriate', 'other'];

/**
 * Report sheet.
 *
 * "বিক্রি হয়ে গেছে" is deliberately the first option: it is the reason buyers pick
 * most often, and enough independent reports close the listing on their own
 * (plan §3.6) — `submitReport` tells us when that happened so the buyer learns
 * their report actually did something.
 */
export default function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  reporterId,
}: ReportModalProps) {
  const { t } = useLanguage();
  const { submitReport } = useData();
  const { showToast } = useToast();

  const [reason, setReason] = useState<ReportReason>();
  const [error, setError] = useState<string>();

  const close = () => {
    setReason(undefined);
    setError(undefined);
    onClose();
  };

  const handleSubmit = () => {
    if (!reason) {
      setError(t('report.reasonRequired'));
      return;
    }
    const { autoMarkedSold } = submitReport({
      target_type: targetType,
      target_id: targetId,
      reporter_id: reporterId,
      reason,
    });
    close();
    showToast(t('report.success'));
    if (autoMarkedSold) showToast(t('report.autoSold'), 'info');
  };

  return (
    <Modal isOpen={isOpen} onClose={close} title={t('report.title')} size="sm">
      <div className="space-y-4">
        <p className="text-sm font-medium text-text-main">{t('report.reason')}</p>

        <div className="space-y-2">
          {REASONS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setReason(value);
                setError(undefined);
              }}
              aria-pressed={reason === value}
              className={cn(
                'w-full flex items-center gap-2.5 px-4 py-2.5 rounded-[var(--radius-button)] border text-sm text-left transition-colors cursor-pointer',
                reason === value
                  ? 'border-primary bg-primary-50 text-primary font-medium'
                  : 'border-border-warm bg-white text-text-secondary hover:border-primary-200'
              )}
            >
              <span
                className={cn(
                  'w-4 h-4 rounded-full border-2 shrink-0',
                  reason === value ? 'border-primary bg-primary' : 'border-border-strong'
                )}
              />
              {t(`report.${value}`)}
            </button>
          ))}
        </div>

        {error && <p className="text-xs text-error">{error}</p>}

        <div className="flex gap-3 pt-1">
          <Button variant="outline" fullWidth onClick={close}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" fullWidth onClick={handleSubmit}>
            <Flag size={16} />
            {t('report.submit')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
