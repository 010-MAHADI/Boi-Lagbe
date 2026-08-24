'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MessageSquare, ChevronRight, BookOpen } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { timeAgo } from '@/lib/utils';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';

export default function ChatListClient() {
  const router = useRouter();
  const { user } = useAuth();
  const { conversationsFor } = useData();
  const { language, t } = useLanguage();

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center page-enter">
        <MessageSquare size={48} className="mx-auto mb-4 text-text-muted opacity-40" />
        <h2 className="text-2xl font-bold text-text-main mb-2">মেসেজ দেখতে লগইন করুন</h2>
        <p className="text-text-muted mb-6">বিক্রেতা বা ক্রেতার সাথে মেসেজ আদান-প্রদান করতে লগইন থাকা আবশ্যক।</p>
        <button
          onClick={() => router.push('/login')}
          className="px-6 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors cursor-pointer"
        >
          লগইন করুন
        </button>
      </div>
    );
  }

  const conversations = conversationsFor(user.id);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:py-8 page-enter">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-main">মেসেজসমূহ</h1>
        <span className="text-xs text-text-muted">
          {conversations.length} টি কথোপকথন
        </span>
      </div>

      {conversations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border-warm p-12 text-center shadow-[var(--shadow-card)]">
          <MessageSquare size={48} className="mx-auto mb-3 text-text-muted opacity-30" />
          <h3 className="text-lg font-semibold text-text-main mb-1">কোন মেসেজ নেই</h3>
          <p className="text-xs text-text-muted mb-6">কোনো বইয়ের ব্যাপারে আগ্রহ থাকলে বিক্রেতাকে মেসেজ দিতে পারেন।</p>
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors"
          >
            বই খুঁজুন
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border-warm divide-y divide-border-warm shadow-[var(--shadow-card)] overflow-hidden">
          {conversations.map((conv) => {
            // other_user comes from the API-enriched conversation object
            const otherUser = (conv as any).other_user ?? null;
            const otherName = otherUser?.name ?? (conv.buyer_id === user.id ? 'বিক্রেতা' : 'ক্রেতা');
            const time = conv.last_message_at ? timeAgo(conv.last_message_at) : undefined;
            const listingImageUrl = (conv as any).listing_image_url ?? conv.listing_image;

            return (
              <Link
                key={conv.id}
                href={`/chat/${conv.id}`}
                className="flex items-center gap-4 p-4 hover:bg-warm-surface transition-colors group"
              >
                {/* Listing Thumbnail */}
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-warm-surface border border-border-warm shrink-0">
                  {listingImageUrl ? (
                    <Image src={listingImageUrl} alt={conv.listing_title ?? ''} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted">
                      <BookOpen size={20} />
                    </div>
                  )}
                </div>

                {/* Conversation Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-sm text-text-main truncate">
                      {otherName}
                    </span>
                    {time && (
                      <span className="text-xs text-text-muted shrink-0">
                        {language === 'bn' ? time.bn : time.en}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-primary font-medium truncate mb-1">
                    {conv.listing_title}
                  </p>

                  <p className="text-xs text-text-muted truncate">
                    {conv.last_message || 'কথোপকথন শুরু করুন...'}
                  </p>
                </div>

                {/* Unread badge & Chevron */}
                <div className="flex items-center gap-2 shrink-0">
                  {conv.unread_count > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-accent text-white text-xs font-bold shadow-xs">
                      {conv.unread_count}
                    </span>
                  )}
                  <ChevronRight size={18} className="text-text-muted group-hover:text-primary transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
