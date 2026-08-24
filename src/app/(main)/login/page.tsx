import { Suspense } from 'react';
import type { Metadata } from 'next';
import LoginClient from './LoginClient';

export const metadata: Metadata = {
  title: 'লগইন | বই লাগবে',
};

export default function LoginPage() {
  // `LoginClient` reads `?next=` with `useSearchParams`, which needs a boundary.
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <LoginClient />
    </Suspense>
  );
}
