import { Suspense } from 'react';
import type { Metadata } from 'next';
import CreateListingClient from './CreateListingClient';

export const metadata: Metadata = {
  title: 'বই বিক্রি করুন | বই লাগবে',
  description: 'আপনার পুরনো পাঠ্যবই বা গল্পের বই সহজে বিক্রি করুন।',
};

export default function CreateListingPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center">লোড হচ্ছে...</div>}>
      <CreateListingClient />
    </Suspense>
  );
}
