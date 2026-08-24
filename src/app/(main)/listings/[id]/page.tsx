import { Suspense } from 'react';
import type { Metadata } from 'next';
import ListingDetailClient from './ListingDetailClient';

export const metadata: Metadata = {
  title: 'বইয়ের বিবরণ | বই লাগবে',
  description: 'ক্যাম্পাসের ব্যবহৃত বইয়ের পূর্ণ বিবরণ ও বিক্রেতার সাথে যোগাযোগের ব্যবস্থা।',
};

interface ListingPageProps {
  params: Promise<{ id: string }>;
}

export default async function ListingDetailPage({ params }: ListingPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center">লোড হচ্ছে...</div>}>
      <ListingDetailClient id={id} />
    </Suspense>
  );
}
