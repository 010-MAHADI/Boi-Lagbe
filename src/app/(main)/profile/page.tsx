import { Suspense } from 'react';
import type { Metadata } from 'next';
import ProfileClient from './ProfileClient';

export const metadata: Metadata = {
  title: 'আমার প্রোফাইল | বই লাগবে',
  description: 'আপনার প্রোফাইল, সচল ও বিক্রি হওয়া বই এবং প্রাপ্ত রিভিউসমূহ দেখুন।',
};

export default function MyProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center">লোড হচ্ছে...</div>}>
      <ProfileClient />
    </Suspense>
  );
}
