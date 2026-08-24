'use client';

import { useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from '@/contexts/LocationContext';
import { useToast } from '@/contexts/ToastContext';
import { DIVISIONS } from '@/lib/constants';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LocationModal({ isOpen, onClose }: LocationModalProps) {
  const { language, t } = useLanguage();
  const { division: currentDiv, district: currentDist, setManualLocation, requestLocation } = useLocation();
  const { showToast } = useToast();

  const [division, setDivision] = useState(currentDiv || 'dhaka');
  const [district, setDistrict] = useState(currentDist || 'ঢাকা');

  const districts = DIVISIONS[division]?.districts || [];

  const handleSave = () => {
    if (!division || !district) {
      showToast('দয়া করে এলাকা সিলেক্ট করুন', 'error');
      return;
    }

    // Centroid coords fallback for manual district
    setManualLocation(23.8103, 90.4125, division, district);
    showToast(`অবস্থান পরিবর্তন করা হয়েছে: ${district}`);
    onClose();
  };

  const handleAutoDetect = () => {
    requestLocation();
    showToast('জিপিএস লোকেশন সনাক্ত করা হচ্ছে...', 'info');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="এলাকা নির্বাচন করুন" size="sm">
      <div className="space-y-4">
        {/* GPS Auto-detect Button */}
        <button
          onClick={handleAutoDetect}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-primary-50 border border-primary-200 text-primary font-semibold text-sm hover:bg-primary-100 transition-colors cursor-pointer"
        >
          <Navigation size={18} />
          <span>জিপিএস দিয়ে স্বয়ংক্রিয়ভাবে সিলেক্ট করুন</span>
        </button>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-border-warm"></div>
          <span className="flex-shrink mx-3 text-xs text-text-muted">অথবা ম্যানুয়ালি নির্বাচন করুন</span>
          <div className="flex-grow border-t border-border-warm"></div>
        </div>

        {/* Division Picker */}
        <Select
          label="বিভাগ"
          value={division}
          onChange={(e) => {
            setDivision(e.target.value);
            setDistrict('');
          }}
          options={Object.entries(DIVISIONS).map(([key, d]) => ({
            value: key,
            label: d[language],
          }))}
        />

        {/* District Picker */}
        <Select
          label="জেলা"
          value={district}
          disabled={!division}
          onChange={(e) => setDistrict(e.target.value)}
          options={districts.map((d) => ({
            value: d.bn,
            label: d[language],
          }))}
        />

        <div className="flex gap-2 justify-end pt-3">
          <Button variant="outline" onClick={onClose}>
            বাতিল
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={!district}>
            সংরক্ষণ করুন
          </Button>
        </div>
      </div>
    </Modal>
  );
}
