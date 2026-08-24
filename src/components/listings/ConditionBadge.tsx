'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import Badge from '@/components/ui/Badge';
import { BookCondition } from '@/types';

interface ConditionBadgeProps {
  condition: BookCondition;
}

const conditionMap: Record<BookCondition, { variant: 'success' | 'info' | 'warning' | 'accent'; keyBn: string }> = {
  new: { variant: 'success', keyBn: 'condition.new' },
  like_new: { variant: 'info', keyBn: 'condition.like_new' },
  good: { variant: 'warning', keyBn: 'condition.good' },
  fair: { variant: 'accent', keyBn: 'condition.fair' },
};

export default function ConditionBadge({ condition }: ConditionBadgeProps) {
  const { t } = useLanguage();
  const config = conditionMap[condition] || conditionMap.good;

  return <Badge variant={config.variant}>{t(config.keyBn)}</Badge>;
}
