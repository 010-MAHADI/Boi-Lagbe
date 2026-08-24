'use client';

import { Listing } from '@/types';
import ListingCard from './ListingCard';

interface ListingGridProps {
  listings: Listing[];
  emptyMessage?: string;
  emptyHint?: string;
}

export default function ListingGrid({ listings, emptyMessage, emptyHint }: ListingGridProps) {
  if (listings.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="text-5xl mb-4 opacity-60">📭</div>
        <p className="text-text-secondary font-medium">{emptyMessage || 'কিছু পাওয়া যায়নি'}</p>
        {emptyHint && <p className="text-sm text-text-muted mt-2">{emptyHint}</p>}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
