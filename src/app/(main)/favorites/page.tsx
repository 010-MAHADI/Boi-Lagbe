'use client';

import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import ListingGrid from '@/components/listings/ListingGrid';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function FavoritesPage() {
  const { user } = useAuth();
  const { favoriteListingsFor } = useData();

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center page-enter">
        <Heart size={48} className="mx-auto mb-4 text-text-muted opacity-40" />
        <h2 className="text-2xl font-bold text-text-main mb-2">পছন্দের তালিকা দেখতে লগইন করুন</h2>
        <p className="text-text-muted mb-6">আপনার বুকমার্ক করা বইগুলো এক স্থানে রাখতে লগইন থাকা প্রয়োজন।</p>
        <Link href="/login">
          <Button variant="primary">লগইন করুন</Button>
        </Link>
      </div>
    );
  }

  const listings = favoriteListingsFor(user.id);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 page-enter">
      <div className="flex items-center gap-2 mb-6">
        <Heart className="text-error" size={24} fill="currentColor" />
        <h1 className="text-2xl font-bold text-text-main">পছন্দের বইসমূহ ({listings.length})</h1>
      </div>

      <ListingGrid
        listings={listings}
        emptyMessage="কোন পছন্দের বই সেভ করা নেই"
        emptyHint="যেকোনো বিজ্ঞাপনের হৃদয় (❤️) বাটনে ক্লিক করে পরে দেখার জন্য সেভ করে রাখুন।"
      />
    </div>
  );
}
