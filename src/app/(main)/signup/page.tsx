import { Suspense } from 'react';
import type { Metadata } from 'next';
import SignupClient from './SignupClient';

export const metadata: Metadata = {
  title: 'অ্যাকাউন্ট খুলুন | বই লাগবে',
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <SignupClient />
    </Suspense>
  );
}
