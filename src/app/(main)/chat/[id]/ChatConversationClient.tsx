'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Send, ChevronLeft, TrendingDown, CheckCircle, BookOpen } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { formatPrice, timeAgo } from '@/lib/utils';
import ReviewModal from '@/components/listings/ReviewModal';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Avatar from '@/components/ui/Avatar';
import MessageList from './MessageList';

interface ChatConversationClientProps {
  conversationId: string;
}

export default function ChatConversationClient({ conversationId }: ChatConversationClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { conversations, messagesFor, sendMessage, markConversationRead, getListing, submitOffer, markListingSold, refreshMessages } = useData();
  const { language } = useLanguage();
  const { showToast } = useToast();

  const [inputMessage, setInputMessage] = useState('');
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversation = conversations.find((c) => c.id === conversationId);

  // Real polling — fetch new messages every 4 seconds while window is open
  useEffect(() => {
    if (!conversationId || !user) return;
    markConversationRead(conversationId, user.id);
    const interval = setInterval(() => {
      refreshMessages(conversationId);
    }, 4000);
    return () => clearInterval(interval);
  }, [conversationId, user, markConversationRead, refreshMessages]);

  // Scroll to bottom on new message
  const messages = messagesFor(conversationId);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center page-enter">
        <h2 className="text-2xl font-bold text-text-main mb-2">মেসেজ দেখতে লগইন করুন</h2>
        <Button onClick={() => router.push('/login')}>লগইন করুন</Button>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center page-enter">
        <h2 className="text-2xl font-bold text-text-main mb-2">কথোপকথনটি পাওয়া যায়নি</h2>
        <Link href="/chat">
          <Button variant="outline">সব মেসেজে ফিরুন</Button>
        </Link>
      </div>
    );
  }

  const listing = getListing(conversation.listing_id);
  // other_user from API-enriched conversation
  const otherUser = (conversation as any).other_user ?? null;
  const otherUserId = conversation.buyer_id === user.id ? conversation.seller_id : conversation.buyer_id;
  const isBuyer = user.id === conversation.buyer_id;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    sendMessage(conversationId, user.id, inputMessage.trim());
    setInputMessage('');
  };

  const handleSendOffer = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseInt(offerAmount, 10);
    if (isNaN(price) || price <= 0) {
      showToast('সঠিক অফার লিখুন', 'error');
      return;
    }

    submitOffer(conversation.listing_id, user.id, price);
    sendMessage(
      conversationId,
      user.id,
      `আমি এই বইটির জন্য ${formatPrice(price)} অফার করেছি।`,
      price
    );

    setOfferModalOpen(false);
    setOfferAmount('');
    showToast('অফার মেসেজ পাঠানো হয়েছে!');
  };

  const handleDealDone = () => {
    if (listing) {
      markListingSold(listing.id);
    }
    setReviewModalOpen(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 md:py-6 page-enter flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="bg-white rounded-t-2xl border border-border-warm p-4 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/chat" className="p-1.5 rounded-full hover:bg-warm-surface text-text-muted">
            <ChevronLeft size={20} />
          </Link>

          <Avatar name={otherUser?.name || 'ব্যবহারকারী'} src={otherUser?.avatar_url} size="md" />

          <div className="min-w-0">
            <h2 className="font-bold text-sm text-text-main truncate">
              {otherUser?.name || 'ব্যবহারকারী'}
            </h2>
            <span className="text-xs text-text-muted block truncate">
              {conversation.listing_title}
            </span>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          {listing && (
            <Link
              href={listing.slug ? `/product/${listing.slug}` : `/listings/${listing.id}`}
              className="p-2 rounded-xl bg-warm-surface border border-border-warm text-text-muted hover:text-primary transition-colors text-xs font-medium flex items-center gap-1"
              title="বইয়ের পাতা দেখুন"
            >
              <BookOpen size={16} />
              <span className="hidden sm:inline">বই দেখুন</span>
            </Link>
          )}

          <Button size="sm" variant="accent" onClick={handleDealDone}>
            <CheckCircle size={14} />
            <span className="hidden sm:inline">ডিল সম্পন্ন</span>
          </Button>
        </div>
      </div>

      {/* Listing Strip */}
      {listing && (
        <div className="bg-primary-50 border-x border-b border-primary-100 p-2.5 px-4 flex items-center justify-between text-xs text-primary-800">
          <div className="flex items-center gap-2 truncate">
            <span className="font-semibold">বই:</span>
            <span className="truncate">{listing.title}</span>
            <span className="font-bold text-primary">{formatPrice(listing.price)}</span>
          </div>
          {isBuyer && listing.status === 'active' && (
            <button
              onClick={() => setOfferModalOpen(true)}
              className="flex items-center gap-1 font-semibold text-accent hover:underline shrink-0 cursor-pointer"
            >
              <TrendingDown size={14} />
              অফার পাঠান
            </button>
          )}
        </div>
      )}

      {/* Messages Stream */}
      <MessageList
        messages={messages}
        currentUserId={user.id}
        language={language}
      />

      {/* Bottom Message Input Bar */}
      <form
        onSubmit={handleSend}
        className="bg-white rounded-b-2xl border border-border-warm p-3 flex items-center gap-2 shadow-xs"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="মেসেজ লিখুন..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-border-warm bg-warm-surface text-text-main focus:outline-none focus:ring-2 focus:ring-primary-light text-sm"
        />

        <Button type="submit" variant="primary" size="md" disabled={!inputMessage.trim()}>
          <Send size={16} />
        </Button>
      </form>

      {/* In-Chat Offer Modal */}
      {listing && (
        <Modal
          isOpen={offerModalOpen}
          onClose={() => setOfferModalOpen(false)}
          title="অফার মেসেজ পাঠান"
          size="sm"
        >
          <form onSubmit={handleSendOffer} className="space-y-4">
            <p className="text-sm text-text-muted">
              বইয়ের আসল দাম: <span className="font-bold text-text-main">{formatPrice(listing.price)}</span>
            </p>
            <Input
              label="আপনার প্রস্তাবিত দাম (৳)"
              type="number"
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
              placeholder="যেমন: ৪৫০"
              required
              autoFocus
            />
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" type="button" onClick={() => setOfferModalOpen(false)}>
                বাতিল
              </Button>
              <Button variant="primary" type="submit">
                অফার পাঠান
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Review Modal */}
      {listing && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          reviewedUserId={otherUserId}
          reviewerId={user.id}
          reviewerName={user.name}
          listingId={listing.id}
        />
      )}
    </div>
  );
}
