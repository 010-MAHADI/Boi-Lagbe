import { Suspense } from 'react';
import type { Metadata } from 'next';
import ProfileClient from '../ProfileClient';

export const metadata: Metadata = {
  title: 'প্রোফাইল | বই লাগবে',
  description: 'ব্যবহারকারীর প্রোফাইল, বই এবং রিভিউ।',
};

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function UserProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center">লোড হচ্ছে...</div>}>
      <ProfileClient userId={id} />
    </Suspense>
  );
}
