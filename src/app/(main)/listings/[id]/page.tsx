import { Suspense } from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import ListingDetailClient from './ListingDetailClient';

export const metadata: Metadata = {
  title: 'বইয়ের বিবরণ | বই লাগবে',
  description: 'ক্যাম্পাসের ব্যবহৃত বইয়ের পূর্ণ বিবরণ ও বিক্রেতার সাথে যোগাযোগের ব্যবস্থা।',
};

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');

interface ListingPageProps {
  params: Promise<{ id: string }>;
}

export default async function ListingDetailPage({ params }: ListingPageProps) {
  const { id } = await params;

  // Redirect old /listings/:uuid URLs to canonical /product/:slug.
  // Falls back to inline render if the API is unreachable or slug is absent.
  try {
    const res = await fetch(`${API_BASE}/api/listings/${id}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.slug) {
        redirect(`/product/${data.slug}`);
      }
    }
  } catch {
    // Silently fall through to inline render
  }

  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center">লোড হচ্ছে...</div>}>
      <ListingDetailClient id={id} />
    </Suspense>
  );
}
