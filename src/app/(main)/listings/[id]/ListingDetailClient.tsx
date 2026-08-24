'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  MessageSquare,
  Phone,
  MessageCircle,
  Heart,
  Share2,
  MapPin,
  Building2,
  GraduationCap,
  Eye,
  Clock,
  CheckCircle,
  Flag,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  BookOpen
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from '@/contexts/LocationContext';
import { useToast } from '@/contexts/ToastContext';
import { formatPrice, timeAgo, calculateDistance, formatDistance } from '@/lib/utils';
import { getInstituteById, getUserById } from '@/lib/mockData';
import ConditionBadge from '@/components/listings/ConditionBadge';
import PriceOfferFeed from '@/components/listings/PriceOfferFeed';
import ReportModal from '@/components/listings/ReportModal';
import StarRating from '@/components/ui/StarRating';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';

interface ListingDetailClientProps {
  id: string;
}

export default function ListingDetailClient({ id }: ListingDetailClientProps) {
  const router = useRouter();
  const { getListing, isFavorite, toggleFavorite, offersForListing, submitOffer, findOrCreateConversation, markListingSold, sendMessage } = useData();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { lat, lng } = useLocation();
  const { showToast } = useToast();

  const listing = getListing(id);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [reportModalOpen, setReportModalOpen] = useState(false);

  if (!listing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center page-enter">
        <h2 className="text-2xl font-bold text-text-main mb-2">বইটি খুঁজে পাওয়া যায়নি</h2>
        <p className="text-text-muted mb-6">বিজ্ঞাপনটি মুছে ফেলা হয়ে থাকতে পারে অথবা ভুল লিংক।</p>
        <Link href="/listings">
          <Button variant="primary">বই খুঁজুন</Button>
        </Link>
      </div>
    );
  }

  const seller = getUserById(listing.seller_id);
  const institute = listing.institute_id ? getInstituteById(listing.institute_id) : undefined;
  const isOwner = user?.id === listing.seller_id;
  const favorited = user ? isFavorite(user.id, listing.id) : false;
  const offers = offersForListing(listing.id);
  const createdAgo = timeAgo(listing.created_at);

  const distanceKm =
    lat && lng && listing.lat && listing.lng
      ? calculateDistance(lat, lng, listing.lat, listing.lng)
      : undefined;

  const distFormatted = distanceKm !== undefined ? formatDistance(distanceKm) : undefined;

  const handleToggleFavorite = () => {
    if (!user) {
      showToast('পছন্দের তালিকায় যোগ করতে লগইন করুন', 'info');
      router.push('/login');
      return;
    }
    const isFav = toggleFavorite(user.id, listing.id);
    showToast(isFav ? 'পছন্দের তালিকায় যুক্ত করা হয়েছে' : 'পছন্দের তালিকা থেকে সরানো হয়েছে');
  };

  const handleStartChat = () => {
    if (!user) {
      showToast('কথা বলতে আগে লগইন করুন', 'info');
      router.push('/login');
      return;
    }
    if (isOwner) {
      showToast('এটি আপনার নিজের বিজ্ঞাপন!', 'warning');
      return;
    }
    const conv = findOrCreateConversation(listing, user.id);
    router.push(`/chat/${conv.id}`);
  };

  const handleSendOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('অফার পাঠাতে লগইন করুন', 'info');
      router.push('/login');
      return;
    }
    const price = parseInt(offerAmount, 10);
    if (isNaN(price) || price <= 0) {
      showToast('সঠিক দামের অফার লিখুন', 'error');
      return;
    }

    // Submit public offer
    submitOffer(listing.id, user.id, price);

    // Send chat message with offer
    const conv = findOrCreateConversation(listing, user.id);
    sendMessage(
      conv.id,
      user.id,
      `আমি এই বইটির জন্য ${formatPrice(price)} অফার করেছি।`,
      price
    );

    setOfferModalOpen(false);
    setOfferAmount('');
    showToast('অফার সফলভাবে পাঠানো হয়েছে!');
  };

  const handleMarkSold = () => {
    markListingSold(listing.id);
    showToast('বিজ্ঞাপনটি বিক্রি হিসেবে চিহ্নিত করা হয়েছে');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('লিংক কপি করা হয়েছে!');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10 page-enter">
      {/* Top Breadcrumb & Share */}
      <div className="flex items-center justify-between mb-4">
        <Link href="/listings" className="flex items-center gap-1 text-sm text-text-muted hover:text-primary transition-colors">
          <ChevronLeft size={16} />
          <span>সব বইয়ে ফিরে যান</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-full border transition-colors cursor-pointer ${
              favorited ? 'bg-error-light border-error text-error' : 'bg-white border-border-warm text-text-muted hover:text-error'
            }`}
            title="পছন্দ করুন"
          >
            <Heart size={18} fill={favorited ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-white border border-border-warm text-text-muted hover:text-text-main transition-colors cursor-pointer"
            title="শেয়ার করুন"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image Gallery & Description */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Image Viewer */}
          <div className="bg-white rounded-2xl border border-border-warm overflow-hidden shadow-[var(--shadow-card)]">
            <div className="relative aspect-4/3 w-full bg-warm-surface">
              {listing.images && listing.images.length > 0 ? (
                <Image
                  src={listing.images[activeImageIndex]}
                  alt={listing.title}
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-text-muted">
                  <BookOpen size={48} className="mb-2 opacity-40" />
                  <span>কোন ছবি নেই</span>
                </div>
              )}

              {/* Status Badge Overlay */}
              {listing.status === 'sold' && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                  <span className="bg-error text-white px-6 py-2 rounded-full font-bold text-lg shadow-lg">
                    বিক্রি হয়ে গেছে
                  </span>
                </div>
              )}

              {/* Prev / Next Controls */}
              {listing.images && listing.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : listing.images.length - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev < listing.images.length - 1 ? prev + 1 : 0))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {listing.images && listing.images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto border-t border-border-warm">
                {listing.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      activeImageIndex === idx ? 'border-primary ring-2 ring-primary-light' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt={`Thumb ${idx}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Book Info & Description */}
          <div className="bg-white rounded-2xl border border-border-warm p-6 space-y-6 shadow-[var(--shadow-card)]">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ConditionBadge condition={listing.condition} />
                <span className="text-xs text-text-muted flex items-center gap-1">
                  <Clock size={12} />
                  {language === 'bn' ? createdAgo.bn : createdAgo.en}
                </span>
                <span className="text-xs text-text-muted flex items-center gap-1 ml-auto">
                  <Eye size={12} />
                  {listing.view_count} বার দেখা হয়েছে
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-text-main leading-tight mb-2">
                {listing.title}
              </h1>

              {listing.author && (
                <p className="text-sm text-text-muted mb-4">
                  লেখক/প্রকাশক: <span className="font-medium text-text-main">{listing.author}</span>
                </p>
              )}

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-primary">
                  {formatPrice(listing.price)}
                </span>
                {listing.negotiable && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-accent-50 text-accent-dark font-medium border border-accent-100">
                    দাম আলোচনা সাপেক্ষ
                  </span>
                )}
              </div>
            </div>

            <hr className="border-border-warm" />

            {/* Academic & Location Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {institute && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-warm-surface">
                  <Building2 size={20} className="text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-text-muted block">ইনস্টিটিউট</span>
                    <span className="text-sm font-semibold text-text-main">{institute.name}</span>
                  </div>
                </div>
              )}

              {listing.level_label && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-warm-surface">
                  <GraduationCap size={20} className="text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-text-muted block">শ্রেণি / সেমিস্টার</span>
                    <span className="text-sm font-semibold text-text-main">{listing.level_label}</span>
                  </div>
                </div>
              )}

              {distFormatted && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-warm-surface sm:col-span-2">
                  <MapPin size={20} className="text-accent shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-text-muted block">অবস্থান</span>
                    <span className="text-sm font-semibold text-text-main">
                      {language === 'bn' ? distFormatted.bn : distFormatted.en}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <hr className="border-border-warm" />

            {/* Description Text */}
            <div>
              <h3 className="text-base font-bold text-text-main mb-2">বিবরণ</h3>
              {listing.description_bn && (
                <p className="text-text-secondary leading-relaxed whitespace-pre-line mb-3">
                  {listing.description_bn}
                </p>
              )}
              {listing.description_en && (
                <p className="text-text-muted leading-relaxed text-sm whitespace-pre-line border-l-2 border-primary-200 pl-3">
                  {listing.description_en}
                </p>
              )}
            </div>

            {/* Public Price Offer Feed ("Last Price") */}
            <hr className="border-border-warm" />
            <div>
              <div className="flex items-center justify-between mb-3">
                <PriceOfferFeed offers={offers} />
                {listing.status === 'active' && !isOwner && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setOfferModalOpen(true)}
                    className="shrink-0"
                  >
                    <TrendingDown size={14} className="text-accent" />
                    অফার দাম দিন
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Seller Profile & Contact CTAs */}
        <div className="lg:col-span-5 space-y-6">
          {/* Seller Card */}
          <div className="bg-white rounded-2xl border border-border-warm p-6 space-y-5 shadow-[var(--shadow-card)]">
            <h3 className="text-base font-bold text-text-main border-b border-border-warm pb-3">
              বিক্রেতার তথ্য
            </h3>

            {seller && (
              <div className="flex items-center gap-3">
                <Avatar name={seller.name} src={seller.avatar_url} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-text-main truncate">{seller.name}</span>
                    <CheckCircle size={16} className="text-success shrink-0" />
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <StarRating rating={seller.rating_avg} size={14} />
                    <span className="text-xs text-text-muted">
                      ({seller.rating_count} রিভিউ)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {listing.status === 'active' ? (
              <div className="space-y-3 pt-2">
                {/* Chat CTA */}
                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  onClick={handleStartChat}
                  disabled={isOwner}
                >
                  <MessageSquare size={18} />
                  ইন-অ্যাপ চ্যাট করুন
                </Button>

                {/* WhatsApp Direct CTA */}
                {listing.whatsapp_number && (
                  <a
                    href={`https://wa.me/${listing.whatsapp_number.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button variant="accent" fullWidth size="lg" className="!bg-[#25D366] !text-white hover:!bg-[#20ba5a]">
                      <MessageCircle size={18} />
                      WhatsApp এ নক দিন
                    </Button>
                  </a>
                )}

                {/* Phone Reveal */}
                {listing.contact_preference === 'phone' && seller?.phone && (
                  <div>
                    {showPhone ? (
                      <div className="p-3 bg-primary-50 border border-primary-200 rounded-xl text-center">
                        <span className="text-xs text-text-muted block mb-1">ফোন নম্বর</span>
                        <a href={`tel:${seller.phone}`} className="text-lg font-bold text-primary hover:underline">
                          {seller.phone}
                        </a>
                      </div>
                    ) : (
                      <Button variant="outline" fullWidth size="lg" onClick={() => setShowPhone(true)}>
                        <Phone size={18} />
                        ফোন নম্বর দেখুন
                      </Button>
                    )}
                  </div>
                )}

                {/* Owner Actions */}
                {isOwner && (
                  <div className="pt-2 border-t border-border-warm">
                    <Button variant="accent" fullWidth onClick={handleMarkSold}>
                      <CheckCircle size={16} />
                      বিক্রি হিসেবে চিহ্নিত করুন
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-error-light text-error rounded-xl text-center text-sm font-medium">
                এই বইটি ইতোমধ্যে বিক্রি হয়ে গেছে।
              </div>
            )}

            {/* Safety Reminder */}
            <div className="p-3 rounded-xl bg-warm-surface border border-border-warm text-xs text-text-muted space-y-1">
              <span className="font-semibold text-text-main block">নিরাপত্তা টিপস:</span>
              <p>ক্যাম্পাসের জনবহুল ও আলোকিত স্থানে দেখা করুন। অগ্রিম টাকা না দিয়ে সরাসরি বইটি দেখে কেনাবেচা করুন।</p>
            </div>

            {/* Report Button */}
            {!isOwner && user && (
              <div className="text-center pt-2">
                <button
                  onClick={() => setReportModalOpen(true)}
                  className="text-xs text-text-muted hover:text-error transition-colors flex items-center gap-1 mx-auto cursor-pointer"
                >
                  <Flag size={12} />
                  <span>বিজ্ঞাপনটি রিপোর্ট করুন</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Offer Modal */}
      <Modal
        isOpen={offerModalOpen}
        onClose={() => setOfferModalOpen(false)}
        title="দাম অফার দিন"
        size="sm"
      >
        <form onSubmit={handleSendOffer} className="space-y-4">
          <p className="text-sm text-text-muted">
            বিক্রেতার চাওয়া দাম: <span className="font-bold text-text-main">{formatPrice(listing.price)}</span>
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
          <div className="text-xs text-text-muted bg-accent-50 p-2.5 rounded-lg border border-accent-100">
            * আপনার দেওয়া এই দামটি বিজ্ঞাপনের পাতায় প্রকাশ্য অফার ফিডে দেখাবে।
          </div>
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

      {/* Report Modal */}
      {user && (
        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          targetType="listing"
          targetId={listing.id}
          reporterId={user.id}
        />
      )}
    </div>
  );
}
