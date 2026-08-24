'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User as UserIcon, Phone, Building2, CheckCircle, Edit3, LogOut } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { getUserById, getInstituteById } from '@/lib/mockData';
import ListingGrid from '@/components/listings/ListingGrid';
import ReviewList from '@/components/listings/ReviewList';
import StarRating from '@/components/ui/StarRating';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';

interface ProfileClientProps {
  userId?: string;
}

export default function ProfileClient({ userId }: ProfileClientProps) {
  const router = useRouter();
  const { user: currentUser, logout } = useAuth();
  const { listings, reviewsForUser } = useData();
  const { showToast } = useToast();

  const targetUserId = userId || currentUser?.id;
  const targetUser = targetUserId ? getUserById(targetUserId) || (targetUserId === currentUser?.id ? currentUser : undefined) : undefined;

  const [activeTab, setActiveTab] = useState<'active' | 'sold' | 'reviews'>('active');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(targetUser?.name || '');
  const [editPhone, setEditPhone] = useState(targetUser?.phone || '');

  if (!targetUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center page-enter">
        <UserIcon size={48} className="mx-auto mb-4 text-text-muted opacity-40" />
        <h2 className="text-2xl font-bold text-text-main mb-2">প্রোফাইল দেখতে লগইন করুন</h2>
        <Button onClick={() => router.push('/login')}>লগইন করুন</Button>
      </div>
    );
  }

  const isSelf = currentUser?.id === targetUser.id;
  const institute = targetUser.institute_id ? getInstituteById(targetUser.institute_id) : undefined;
  const userListings = listings.filter((l) => l.seller_id === targetUser.id);
  const activeListings = userListings.filter((l) => l.status === 'active');
  const soldListings = userListings.filter((l) => l.status === 'sold');
  const reviews = reviewsForUser(targetUser.id);

  const handleLogout = () => {
    logout();
    showToast('লগআউট করা হয়েছে');
    router.push('/');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-8 page-enter">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-border-warm p-6 mb-8 shadow-[var(--shadow-card)]">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <Avatar name={targetUser.name} src={targetUser.avatar_url} size="lg" />

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="text-2xl font-bold text-text-main">{targetUser.name}</h1>
              <CheckCircle size={18} className="text-success" />
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-2">
              <StarRating rating={targetUser.rating_avg} size={16} />
              <span className="text-xs font-semibold text-text-main">
                {targetUser.rating_avg.toFixed(1)}
              </span>
              <span className="text-xs text-text-muted">
                ({targetUser.rating_count} টি রিভিউ)
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-text-muted">
              {institute && (
                <span className="flex items-center gap-1 font-medium text-text-main">
                  <Building2 size={14} className="text-primary" />
                  {institute.name}
                </span>
              )}
              {targetUser.phone && (
                <span className="flex items-center gap-1">
                  <Phone size={13} />
                  {targetUser.phone}
                </span>
              )}
            </div>
          </div>

          {isSelf && (
            <div className="flex sm:flex-col gap-2 shrink-0">
              <Button size="sm" variant="outline" onClick={() => setEditModalOpen(true)}>
                <Edit3 size={14} /> প্রোফাইল এডিট
              </Button>
              <Button size="sm" variant="outline" onClick={handleLogout}>
                <LogOut size={14} /> লগআউট
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border-warm mb-6">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-5 py-3 font-semibold text-sm border-b-2 transition-colors cursor-pointer ${
            activeTab === 'active'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          চালু বিজ্ঞাপন ({activeListings.length})
        </button>

        <button
          onClick={() => setActiveTab('sold')}
          className={`px-5 py-3 font-semibold text-sm border-b-2 transition-colors cursor-pointer ${
            activeTab === 'sold'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          বিক্রি হয়ে যাওয়া ({soldListings.length})
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-5 py-3 font-semibold text-sm border-b-2 transition-colors cursor-pointer ${
            activeTab === 'reviews'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          রিভিউ ({reviews.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'active' && (
        <ListingGrid
          listings={activeListings}
          emptyMessage="কোনো চালু বিজ্ঞাপন নেই"
          emptyHint="নতুন কোনো বই বিক্রি করতে চাইলে 'বই বিক্রি করুন' এ ক্লিক করুন।"
        />
      )}

      {activeTab === 'sold' && (
        <ListingGrid
          listings={soldListings}
          emptyMessage="বিক্রি হওয়া কোনো বই নেই"
          emptyHint="আপনার বিক্রি সম্পন্ন হওয়া সব বই এখানে জমা হবে।"
        />
      )}

      {activeTab === 'reviews' && (
        <ReviewList reviews={reviews} />
      )}

      {/* Edit Profile Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="প্রোফাইল সম্পাদন করুন"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="নাম"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
          />
          <Input
            label="ফোন নম্বর"
            value={editPhone}
            onChange={(e) => setEditPhone(e.target.value)}
            placeholder="017XXXXXXXX"
          />
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              বাতিল
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                showToast('প্রোফাইল তথ্য আপডেট করা হয়েছে');
                setEditModalOpen(false);
              }}
            >
              সংরক্ষণ করুন
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
