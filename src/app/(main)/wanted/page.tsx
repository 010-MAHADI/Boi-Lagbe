import { Suspense } from 'react';
import type { Metadata } from 'next';
import WantedClient from './WantedClient';

export const metadata: Metadata = {
  title: 'ওয়ান্টেড বোর্ড | বই লাগবে',
  description: 'যে বইটি খুঁজে পাচ্ছেন না তা সার্চ করুন বা শিক্ষার্থীদের কাছে পোস্ট চেয়ে রিকুয়েস্ট করুন।',
};

export default function WantedPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center">লোড হচ্ছে...</div>}>
      <WantedClient />
    </Suspense>
  );
}
