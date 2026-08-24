'use client';

import { useEffect, useState } from 'react';
import { useLocation } from '@/contexts/LocationContext';
import { listingsApi } from '@/lib/api';
import { Listing } from '@/types';
import ListingDetailClient from '@/app/(main)/listings/[id]/ListingDetailClient';
import Link from 'next/link';
import Button from '@/components/ui/Button';

interface ProductDetailClientProps {
  slug: string;
}

export default function ProductDetailClient({ slug }: ProductDetailClientProps) {
  const { lat, lng } = useLocation();
  const [listingId, setListingId] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    listingsApi
      .getBySlug(slug, lat ?? undefined, lng ?? undefined)
      .then((listing: Listing) => setListingId(listing.id))
      .catch(() => setNotFound(true));
  }, [slug, lat, lng]);

  if (notFound) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center page-enter">
        <h2 className="text-2xl font-bold text-text-main mb-2">বইটি খুঁজে পাওয়া যায়নি</h2>
        <p className="text-text-muted mb-6">
          বিজ্ঞাপনটি মুছে ফেলা হয়ে থাকতে পারে অথবা লিংকটি ভুল।
        </p>
        <Link href="/listings">
          <Button variant="primary">বই খুঁজুন</Button>
        </Link>
      </div>
    );
  }

  if (!listingId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <ListingDetailClient id={listingId} />;
}
