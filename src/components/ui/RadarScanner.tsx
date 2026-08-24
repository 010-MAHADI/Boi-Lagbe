'use client';

import { MapPin } from 'lucide-react';

interface RadarScannerProps {
  label?: string;
  sublabel?: string;
}

export default function RadarScanner({
  label = 'আশেপাশের বই স্ক্যান করা হচ্ছে...',
  sublabel = 'আপনার অবস্থানের ৫ কিলোমিটারের ভেতরের বইসমূহ খোঁজা হচ্ছে',
}: RadarScannerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="relative w-28 h-28 flex items-center justify-center mb-6">
        {/* Pulsing Radar Rings */}
        <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping opacity-75" />
        <div className="absolute inset-2 rounded-full border border-primary/40 animate-pulse" />
        <div className="absolute inset-6 rounded-full bg-primary/10 border border-primary-light" />

        {/* Center Location Pin */}
        <div className="relative z-10 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg animate-bounce">
          <MapPin size={24} />
        </div>
      </div>

      <h3 className="text-base md:text-lg font-bold text-text-main mb-1">{label}</h3>
      <p className="text-xs md:text-sm text-text-muted max-w-sm">{sublabel}</p>
    </div>
  );
}
