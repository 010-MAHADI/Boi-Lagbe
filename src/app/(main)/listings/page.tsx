import { Suspense } from 'react';
import type { Metadata } from 'next';
import BrowseClient from './BrowseClient';

export const metadata: Metadata = {
  title: 'বই খুঁজুন | বই লাগবে',
  description: 'ক্যাম্পাসের পুরনো বই খুঁজুন — ইনস্টিটিউট, সেমিস্টার আর এলাকা অনুযায়ী।',
};

export default function BrowsePage() {
  // The whole browse UI is URL-driven (`useSearchParams`), so it needs a boundary.
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <BrowseClient />
    </Suspense>
  );
}
