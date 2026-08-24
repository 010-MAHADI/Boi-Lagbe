'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User as UserIcon, Phone, Building2, CheckCircle, Edit3, LogOut,
  MapPin, Navigation, BookOpen, Trash2, CheckSquare, PenLine,
  Calendar, Eye, TrendingUp, Star, ChevronDown, ChevronUp,
  Clock, AlertTriangle, Info,
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useLocation } from '@/contexts/LocationContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Listing } from '@/types';
import { DIVISIONS } from '@/lib/constants';
import { formatPrice, timeAgo } from '@/lib/utils';
import ReviewList from '@/components/listings/ReviewList';
import ConditionBadge from '@/components/listings/ConditionBadge';
import StarRating from '@/components/ui/StarRating';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

// Days after which a sold listing is auto-purged (front-end display only)
const AUTO_DELETE_DAYS = 30;

function daysUntilAutoDelete(soldAt: string): number {
  const ms = AUTO_DELETE_DAYS * 24 * 60 * 60 * 1000;
  const deadline = new Date(soldAt).getTime() + ms;
  return Math.max(0, Math.ceil((deadline - Date.now()) / (24 * 60 * 60 * 1000)));
}

// ─── Listing management card ────────────────────────────────────────────────
interface ListingManageCardProps {
  listing: Listing;
  onMarkSold: (l: Listing) => void;
  onDelete: (l: Listing) => void;
  onEdit: (l: Listing) => void;
}

function ListingManageCard({ listing, onMarkSold, onDelete, onEdit }: ListingManageCardProps) {
  const { language } = useLanguage();
  const firstImage = Array.isArray(listing.images)
    ? (typeof listing.images[0] === 'string' ? listing.images[0] : (listing.images[0] as any)?.url)
    : undefined;
  const ago = timeAgo(listing.created_at);
  const isSold = listing.status === 'sold';
  const daysLeft = isSold ? daysUntilAutoDelete(listing.created_at) : null;

  return (
    <div className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-opacity ${isSold ? 'border-border-warm opacity-80' : 'border-border-warm'}`}>
      <div className="flex gap-3 p-3">
        {/* Thumbnail */}
        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-warm-surface shrink-0">
          {firstImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={firstImage} alt={listing.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen size={24} className="text-text-muted opacity-40" />
            </div>
          )}
          {isSold && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-[9px] font-bold bg-error px-1.5 py-0.5 rounded-full">বিক্রি</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <Link
              href={listing.slug ? `/product/${listing.slug}` : `/listings/${listing.id}`}
              className="text-sm font-semibold text-text-main line-clamp-2 hover:text-primary transition-colors leading-snug"
            >
              {listing.title}
            </Link>
            <ConditionBadge condition={listing.condition} />
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-base font-bold text-accent-dark">{formatPrice(listing.price)}</span>
            {listing.negotiable && <span className="text-[10px] text-text-muted">আলোচনা সাপেক্ষ</span>}
          </div>

          <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
            <span className="flex items-center gap-0.5">
              <Eye size={11} /> {listing.view_count}
            </span>
            <span className="flex items-center gap-0.5">
              <Clock size={11} />
              {language === 'bn' ? ago.bn : ago.en}
            </span>
            {isSold && daysLeft !== null && (
              <span className={`flex items-center gap-0.5 ${daysLeft <= 7 ? 'text-warning font-medium' : ''}`}>
                <AlertTriangle size={11} />
                {daysLeft} দিনে অটো-ডিলিট
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className={`border-t border-border-warm flex divide-x divide-border-warm ${isSold ? 'bg-warm-surface/50' : ''}`}>
        {!isSold && (
          <button
            onClick={() => onEdit(listing)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-text-secondary hover:text-primary hover:bg-primary-50 transition-colors cursor-pointer"
          >
            <PenLine size={13} /> সম্পাদনা
          </button>
        )}
        {!isSold && (
          <button
            onClick={() => onMarkSold(listing)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-text-secondary hover:text-success hover:bg-success-light transition-colors cursor-pointer"
          >
            <CheckSquare size={13} /> বিক্রি সম্পন্ন
          </button>
        )}
        <button
          onClick={() => onDelete(listing)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-text-secondary hover:text-error hover:bg-error-light transition-colors cursor-pointer"
        >
          <Trash2 size={13} /> মুছুন
        </button>
      </div>
    </div>
  );
}

// ─── Quick edit modal ────────────────────────────────────────────────────────
interface EditListingModalProps {
  listing: Listing;
  onClose: () => void;
  onSaved: () => void;
}

function EditListingModal({ listing, onClose, onSaved }: EditListingModalProps) {
  const { updateListing } = useData();
  const { showToast } = useToast();

  const [title, setTitle] = useState(listing.title);
  const [price, setPrice] = useState(String(listing.price));
  const [negotiable, setNegotiable] = useState(listing.negotiable);
  const [descBn, setDescBn] = useState(listing.description_bn || '');
  const [busy, setBusy] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) { showToast('নাম খালি রাখা যাবে না', 'error'); return; }
    const numPrice = parseInt(price, 10);
    if (isNaN(numPrice) || numPrice < 0) { showToast('সঠিক মূল্য লিখুন', 'error'); return; }
    setBusy(true);
    try {
      await updateListing(listing.id, { title: title.trim(), price: numPrice, negotiable, description_bn: descBn.trim() || undefined });
      showToast('বিজ্ঞাপন আপডেট হয়েছে ✓');
      onSaved();
    } catch (e: any) {
      showToast(e?.message || 'আপডেট করতে সমস্যা হয়েছে', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="বিজ্ঞাপন সম্পাদনা" size="sm">
      <div className="space-y-4">
        <Input label="বইয়ের নাম *" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input label="মূল্য (৳) *" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
        <div className="flex items-center gap-2">
          <input type="checkbox" id="neg" checked={negotiable} onChange={(e) => setNegotiable(e.target.checked)} className="w-4 h-4 text-primary rounded" />
          <label htmlFor="neg" className="text-sm text-text-main cursor-pointer">দাম আলোচনা সাপেক্ষ</label>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-main mb-1">বিবরণ (বাংলায়)</label>
          <textarea
            rows={3}
            value={descBn}
            onChange={(e) => setDescBn(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border-warm text-sm resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            placeholder="বইয়ের অবস্থা ও বিবরণ..."
          />
        </div>
        <div className="flex gap-2 justify-end pt-1">
          <Button variant="outline" onClick={onClose} disabled={busy}>বাতিল</Button>
          <Button variant="primary" onClick={handleSave} isLoading={busy}>সংরক্ষণ করুন</Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Main ProfileClient ──────────────────────────────────────────────────────
export default function ProfileClient({ userId }: { userId?: string }) {
  const router = useRouter();
  const { user: currentUser, logout, updateProfile } = useAuth();
  const { listings, reviewsForUser, getInstitute, users, markListingSold, deleteListing } = useData();
  const { showToast } = useToast();
  const { lat, lng, division, district, requestLocation, setManualLocation } = useLocation();
  const { language } = useLanguage();

  const targetUserId = userId || currentUser?.id;
  const targetUser = targetUserId
    ? (users.find((u) => u.id === targetUserId) ?? (targetUserId === currentUser?.id ? currentUser : undefined))
    : undefined;

  type Tab = 'active' | 'sold' | 'reviews';
  const [activeTab, setActiveTab] = useState<Tab>('active');

  // Profile edit state
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [saving, setSaving] = useState(false);

  // Location settings state
  const [locationOpen, setLocationOpen] = useState(false);
  const [selDivision, setSelDivision] = useState(division || 'dhaka');
  const [selDistrict, setSelDistrict] = useState(district || 'ঢাকা');

  // Listing management state
  const [editListing, setEditListing] = useState<Listing | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Listing | null>(null);
  const [soldConfirm, setSoldConfirm] = useState<Listing | null>(null);
  const [actionBusy, setActionBusy] = useState(false);

  // Stats expand
  const [statsExpanded, setStatsExpanded] = useState(false);

  const openEdit = () => {
    if (!targetUser) return;
    setEditName(targetUser.name);
    setEditPhone(targetUser.phone || '');
    setEditOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) { showToast('নাম খালি রাখা যাবে না', 'error'); return; }
    setSaving(true);
    try {
      await updateProfile({ name: editName.trim(), phone: editPhone.trim() || undefined });
      showToast('প্রোফাইল আপডেট হয়েছে ✓');
      setEditOpen(false);
    } catch {
      showToast('আপডেট করতে সমস্যা হয়েছে', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLocation = () => {
    setManualLocation(lat, lng, selDivision, selDistrict);
    showToast('অবস্থান আপডেট হয়েছে ✓');
    setLocationOpen(false);
  };

  const handleMarkSold = async () => {
    if (!soldConfirm) return;
    setActionBusy(true);
    markListingSold(soldConfirm.id);
    showToast('বিজ্ঞাপনটি বিক্রি হিসেবে চিহ্নিত হয়েছে ✓');
    setSoldConfirm(null);
    setActionBusy(false);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setActionBusy(true);
    deleteListing(deleteConfirm.id);
    showToast('বিজ্ঞাপনটি মুছে দেওয়া হয়েছে');
    setDeleteConfirm(null);
    setActionBusy(false);
  };

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
  const institute = targetUser.institute_id ? getInstitute(targetUser.institute_id) : undefined;
  const userListings = listings.filter((l) => l.seller_id === targetUser.id);
  const activeListings = userListings.filter((l) => l.status === 'active');
  const soldListings = userListings.filter((l) => l.status === 'sold');
  const reviews = reviewsForUser(targetUser.id);
  const totalViews = userListings.reduce((s, l) => s + (l.view_count || 0), 0);

  const districtOptions = DIVISIONS[selDivision]?.districts || [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:py-8 page-enter space-y-5">

      {/* ── Profile header card ── */}
      <div className="bg-white rounded-2xl border border-border-warm shadow-[var(--shadow-card)] overflow-hidden">
        {/* Banner strip */}
        <div className="h-20 bg-gradient-to-r from-primary-700 to-primary rounded-none" />

        <div className="px-5 pb-5">
          {/* Avatar — overlaps the banner */}
          <div className="flex items-end justify-between -mt-10 mb-3">
            <div className="relative">
              <Avatar name={targetUser.name} src={targetUser.avatar_url} size="lg" className="w-20 h-20 text-2xl ring-4 ring-white shadow-md" />
              {targetUser.is_verified && (
                <span className="absolute -bottom-1 -right-1 bg-success text-white rounded-full p-0.5">
                  <CheckCircle size={14} />
                </span>
              )}
            </div>
            {isSelf && (
              <div className="flex gap-2 mt-10">
                <Button size="sm" variant="outline" onClick={openEdit}>
                  <Edit3 size={13} /> এডিট
                </Button>
                <Button size="sm" variant="outline" onClick={() => { logout(); showToast('লগআউট হয়ে গেছে'); router.push('/'); }}>
                  <LogOut size={13} /> লগআউট
                </Button>
              </div>
            )}
          </div>

          {/* Name & rating */}
          <h1 className="text-xl font-bold text-text-main">{targetUser.name}</h1>
          <div className="flex items-center gap-1.5 mt-0.5 mb-3">
            <StarRating rating={targetUser.rating_avg} size={14} />
            <span className="text-xs font-semibold text-text-main">{targetUser.rating_avg.toFixed(1)}</span>
            <span className="text-xs text-text-muted">({targetUser.rating_count} রিভিউ)</span>
          </div>

          {/* Info pills */}
          <div className="flex flex-wrap gap-2 text-xs">
            {institute && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-800 rounded-full border border-primary-100">
                <Building2 size={12} /> {institute.name}
              </span>
            )}
            {targetUser.phone && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-warm-surface text-text-secondary rounded-full border border-border-warm">
                <Phone size={12} /> {targetUser.phone}
              </span>
            )}
            {district && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-warm-surface text-text-secondary rounded-full border border-border-warm">
                <MapPin size={12} /> {district}
              </span>
            )}
            <span className="flex items-center gap-1 px-2.5 py-1 bg-warm-surface text-text-muted rounded-full border border-border-warm">
              <Calendar size={12} />
              যোগদান {new Date(targetUser.created_at).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long' })}
            </span>
          </div>

          {/* Stats row — expandable */}
          <div className="mt-4 border-t border-border-warm pt-3">
            <button
              onClick={() => setStatsExpanded((v) => !v)}
              className="flex items-center gap-1 text-xs text-text-muted hover:text-text-main transition-colors cursor-pointer mb-2"
            >
              {statsExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              পরিসংখ্যান
            </button>
            {statsExpanded && (
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { icon: BookOpen, label: 'চালু বিজ্ঞাপন', value: activeListings.length },
                  { icon: CheckSquare, label: 'বিক্রি হয়েছে', value: soldListings.length },
                  { icon: Eye, label: 'মোট ভিউ', value: totalViews },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-warm-surface rounded-xl p-3">
                    <Icon size={18} className="mx-auto text-primary mb-1" />
                    <p className="text-lg font-bold text-text-main">{value}</p>
                    <p className="text-[10px] text-text-muted leading-tight">{label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Settings row (self only) ── */}
      {isSelf && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setLocationOpen(true)}
            className="flex items-center gap-2.5 p-3.5 bg-white rounded-xl border border-border-warm shadow-sm hover:border-primary-200 hover:bg-primary-50 transition-colors text-left cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-primary-100 text-primary shrink-0">
              <MapPin size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-text-main truncate">অবস্থান সেটিং</p>
              <p className="text-[11px] text-text-muted truncate">{district || 'সেট করুন'}</p>
            </div>
          </button>

          <Link
            href="/listings/new"
            className="flex items-center gap-2.5 p-3.5 bg-white rounded-xl border border-border-warm shadow-sm hover:border-accent-200 hover:bg-accent-50 transition-colors cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-accent-100 text-accent shrink-0">
              <TrendingUp size={16} />
            </div>
            <div>
              <p className="text-xs font-semibold text-text-main">বই বিক্রি করুন</p>
              <p className="text-[11px] text-text-muted">নতুন বিজ্ঞাপন দিন</p>
            </div>
          </Link>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex border-b border-border-warm">
        {([
          ['active', `চালু (${activeListings.length})`],
          ['sold', `বিক্রি (${soldListings.length})`],
          ['reviews', `রিভিউ (${reviews.length})`],
        ] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === key ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-main'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      {activeTab === 'active' && (
        <div className="space-y-3">
          {activeListings.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">কোনো চালু বিজ্ঞাপন নেই</p>
              {isSelf && (
                <Link href="/listings/new" className="mt-3 inline-block text-sm text-primary font-medium hover:underline">
                  + নতুন বিজ্ঞাপন দিন
                </Link>
              )}
            </div>
          ) : (
            activeListings.map((l) => (
              <ListingManageCard
                key={l.id}
                listing={l}
                onEdit={(listing) => setEditListing(listing)}
                onMarkSold={(listing) => setSoldConfirm(listing)}
                onDelete={(listing) => setDeleteConfirm(listing)}
              />
            ))
          )}
        </div>
      )}

      {activeTab === 'sold' && (
        <div className="space-y-3">
          {soldListings.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <CheckSquare size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">এখনো কোনো বিক্রি সম্পন্ন হয়নি</p>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-2 p-3 bg-warning-light rounded-xl text-xs text-warning border border-yellow-200">
                <Info size={14} className="shrink-0 mt-0.5" />
                <span>বিক্রি হওয়া বিজ্ঞাপন ৩০ দিন পর স্বয়ংক্রিয়ভাবে মুছে যাবে এবং ছবিগুলোও ডিলিট হয়ে যাবে।</span>
              </div>
              {soldListings.map((l) => (
                <ListingManageCard
                  key={l.id}
                  listing={l}
                  onEdit={(listing) => setEditListing(listing)}
                  onMarkSold={(listing) => setSoldConfirm(listing)}
                  onDelete={(listing) => setDeleteConfirm(listing)}
                />
              ))}
            </>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div>
          {reviews.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <Star size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">এখনো কোনো রিভিউ আসেনি</p>
            </div>
          ) : (
            <ReviewList reviews={reviews} />
          )}
        </div>
      )}

      {/* ── Edit Profile Modal ── */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="প্রোফাইল আপডেট করুন" size="sm">
        <div className="space-y-4">
          <Input
            label="নাম *"
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
          <div className="p-3 bg-warm-surface rounded-xl text-xs text-text-muted flex items-start gap-2">
            <Info size={13} className="shrink-0 mt-0.5 text-primary" />
            <span>প্রোফাইল ফটো আপলোড ফিচার শীঘ্রই আসছে।</span>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>বাতিল</Button>
            <Button variant="primary" onClick={handleSaveProfile} isLoading={saving}>সংরক্ষণ করুন</Button>
          </div>
        </div>
      </Modal>

      {/* ── Location Settings Modal ── */}
      <Modal isOpen={locationOpen} onClose={() => setLocationOpen(false)} title="অবস্থান সেটিং" size="sm">
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => {
              requestLocation();
              showToast('জিপিএস দিয়ে অবস্থান সনাক্ত হচ্ছে...', 'info');
              setLocationOpen(false);
            }}
            className="w-full flex items-center gap-3 p-3 bg-primary-50 border border-primary-100 rounded-xl text-sm text-primary font-medium hover:bg-primary-100 transition-colors cursor-pointer"
          >
            <Navigation size={18} /> GPS দিয়ে স্বয়ংক্রিয়ভাবে সনাক্ত করুন
          </button>

          <div className="relative flex items-center gap-2 text-xs text-text-muted">
            <div className="flex-1 border-t border-border-warm" />
            <span>অথবা নিজে বাছুন</span>
            <div className="flex-1 border-t border-border-warm" />
          </div>

          <Select
            label="বিভাগ"
            value={selDivision}
            onChange={(e) => { setSelDivision(e.target.value); setSelDistrict(''); }}
            options={Object.entries(DIVISIONS).map(([key, d]) => ({ value: key, label: d[language] }))}
          />
          <Select
            label="জেলা"
            value={selDistrict}
            onChange={(e) => setSelDistrict(e.target.value)}
            options={[
              { value: '', label: 'জেলা বাছুন' },
              ...districtOptions.map((d) => ({ value: d.bn, label: d[language] })),
            ]}
          />
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="outline" onClick={() => setLocationOpen(false)}>বাতিল</Button>
            <Button variant="primary" onClick={handleSaveLocation} disabled={!selDistrict}>সংরক্ষণ করুন</Button>
          </div>
        </div>
      </Modal>

      {/* ── Mark Sold Confirm ── */}
      {soldConfirm && (
        <Modal isOpen onClose={() => setSoldConfirm(null)} title="বিক্রি সম্পন্ন?" size="sm">
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              <span className="font-semibold text-text-main">{soldConfirm.title}</span> — এই বিজ্ঞাপনটি বিক্রি হিসেবে চিহ্নিত হবে। ৩০ দিন পর স্বয়ংক্রিয়ভাবে মুছে যাবে।
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setSoldConfirm(null)}>বাতিল</Button>
              <Button variant="primary" onClick={handleMarkSold} isLoading={actionBusy}>
                <CheckSquare size={15} /> হ্যাঁ, বিক্রি হয়েছে
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Delete Confirm ── */}
      {deleteConfirm && (
        <Modal isOpen onClose={() => setDeleteConfirm(null)} title="বিজ্ঞাপন মুছবেন?" size="sm">
          <div className="space-y-4">
            <div className="p-3 bg-error-light rounded-xl text-sm text-error flex items-start gap-2">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>
                <span className="font-semibold">{deleteConfirm.title}</span> — এই বিজ্ঞাপন ও এর সমস্ত ছবি স্থায়ীভাবে মুছে যাবে। এটি আর ফেরানো যাবে না।
              </span>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>বাতিল</Button>
              <Button
                onClick={handleDelete}
                isLoading={actionBusy}
                className="bg-error hover:bg-error/90 text-white"
              >
                <Trash2 size={14} /> মুছে দিন
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Quick Edit Listing Modal ── */}
      {editListing && (
        <EditListingModal
          listing={editListing}
          onClose={() => setEditListing(null)}
          onSaved={() => setEditListing(null)}
        />
      )}
    </div>
  );
}
