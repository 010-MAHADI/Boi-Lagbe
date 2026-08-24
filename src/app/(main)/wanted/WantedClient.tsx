'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HelpCircle, Plus, Search, MapPin, Building2, MessageSquare, CheckCircle, Trash2, Tag, BookOpen } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { formatPrice, timeAgo } from '@/lib/utils';
import { BookCondition, Institute, WantedPost } from '@/types';
import { CONDITIONS } from '@/lib/constants';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Avatar from '@/components/ui/Avatar';
import ConditionBadge from '@/components/listings/ConditionBadge';
import InstituteAutosuggest from '@/components/listings/InstituteAutosuggest';

export default function WantedClient() {
  const router = useRouter();
  const { user } = useAuth();
  const { wanted, createWantedPost, markWantedFulfilled, deleteWantedPost, submitWantedOffer, wantedOffersForPost, findOrCreateConversation, sendMessage, listings } = useData();
  const { language } = useLanguage();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // New Wanted Form
  const [title, setTitle] = useState('');
  const [selectedInstitute, setSelectedInstitute] = useState<Institute>();
  const [levelLabel, setLevelLabel] = useState('');
  const [description, setDescription] = useState('');

  // Seller Offer Modal State
  const [selectedWanted, setSelectedWanted] = useState<WantedPost>();
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerCondition, setOfferCondition] = useState<BookCondition>('good');
  const [offerPrice, setOfferPrice] = useState('');
  const [offerLocation, setOfferLocation] = useState('');
  const [offerNote, setOfferNote] = useState('');

  const filteredPosts = wanted.filter((w) =>
    w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (w.institute_name && w.institute_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('পোস্ট দিতে আগে লগইন করুন', 'error');
      router.push('/login');
      return;
    }

    if (!title.trim()) {
      showToast('বইয়ের নাম লিখুন', 'error');
      return;
    }

    createWantedPost({
      user_id: user.id,
      user_name: user.name,
      title: title.trim(),
      institute_id: selectedInstitute?.id,
      institute_name: selectedInstitute?.name,
      level_label: levelLabel.trim() || undefined,
      description: description.trim() || undefined,
    });

    setTitle('');
    setSelectedInstitute(undefined);
    setLevelLabel('');
    setDescription('');
    setModalOpen(false);
    showToast('ওয়ান্টেড পোস্ট সফলভাবে প্রকাশিত হয়েছে!');
  };

  const handleOpenOfferModal = (post: WantedPost) => {
    if (!user) {
      showToast('অফার জানাতে আগে লগইন করুন', 'info');
      router.push('/login');
      return;
    }
    setSelectedWanted(post);
    setOfferLocation(user.institute_id ? 'ক্যাম্পাসের ভেতরে' : 'ঢাকা');
    setOfferModalOpen(true);
  };

  const handleSubmitOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWanted || !user) return;

    const priceNum = parseInt(offerPrice, 10);
    if (isNaN(priceNum) || priceNum <= 0) {
      showToast('সঠিক মূল্য লিখুন', 'error');
      return;
    }

    // Submit public offer card for this wanted post
    submitWantedOffer({
      wanted_id: selectedWanted.id,
      seller_id: user.id,
      seller_name: user.name,
      seller_avatar: user.avatar_url,
      condition: offerCondition,
      price: priceNum,
      location: offerLocation.trim() || 'ক্যাম্পাস এলাকা',
      description: offerNote.trim() || undefined,
    });

    // Send automated chat message to requester if fake listing exists or create conversation
    const dummyListing = listings[0]; // fallback anchor listing
    if (dummyListing) {
      const conv = findOrCreateConversation(dummyListing, selectedWanted.user_id);
      sendMessage(
        conv.id,
        user.id,
        `হ্যালো! আপনি "${selectedWanted.title}" বইটি খুঁজছিলেন। আমার কাছে বইটি আছে, কন্ডিশন: ${offerCondition}, দাম: ${formatPrice(priceNum)}, এলাকা: ${offerLocation}.`
      );
    }

    setOfferModalOpen(false);
    setOfferPrice('');
    setOfferNote('');
    showToast('আপনার অফার প্রকাশিত হয়েছে এবং ক্রেতাকে মেসেজ পাঠানো হয়েছে!');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-8 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-main flex items-center gap-2">
            <HelpCircle className="text-accent" />
            ওয়ান্টেড বোর্ড (Wanted Board)
          </h1>
          <p className="text-sm text-text-muted mt-1">
            যে বইটি খুঁজছেন না পেলে এখানে পোস্ট করুন, অন্যান্য শিক্ষার্থীরা আপনার সাথে যোগাযোগ করবে।
          </p>
        </div>

        <Button onClick={() => setModalOpen(true)} className="shrink-0">
          <Plus size={18} />
          বইয়ের রিকুয়েস্ট দিন
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ওয়ান্টেড বোর্ডে বইয়ের নাম দিয়ে খুঁজুন..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-border-warm text-text-main shadow-xs focus:outline-none focus:ring-2 focus:ring-primary-light text-sm"
        />
      </div>

      {/* Wanted Feed */}
      <div className="space-y-6">
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border-warm p-12 text-center shadow-[var(--shadow-card)]">
            <HelpCircle size={48} className="mx-auto mb-3 text-text-muted opacity-30" />
            <h3 className="text-lg font-semibold text-text-main mb-1">কোন ওয়ান্টেড পোস্ট নেই</h3>
            <p className="text-xs text-text-muted mb-6">আপনার প্রয়োজনীয় বইটির নাম লিখে প্রথম রিকুয়েস্ট পোস্ট করুন!</p>
            <Button onClick={() => setModalOpen(true)}>পোস্ট করুন</Button>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isOwner = user?.id === post.user_id;
            const time = timeAgo(post.created_at);
            const offers = wantedOffersForPost(post.id);

            return (
              <div
                key={post.id}
                className={`bg-white rounded-2xl border p-5 shadow-[var(--shadow-card)] transition-all ${
                  post.fulfilled ? 'opacity-60 border-border-warm bg-warm-surface' : 'border-border-warm hover:border-primary-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-accent-50 text-accent-dark border border-accent-100">
                        বই লাগবে
                      </span>
                      {post.fulfilled && (
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-success-light text-success border border-success/20">
                          পাওয়া গেছে
                        </span>
                      )}
                      <span className="text-xs text-text-muted">
                        · {language === 'bn' ? time.bn : time.en}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-text-main leading-snug">
                      {post.title}
                    </h3>
                  </div>

                  {isOwner && !post.fulfilled && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          markWantedFulfilled(post.id);
                          showToast('বই পাওয়া গেছে হিসেবে চিহ্নিত করা হয়েছে');
                        }}
                        className="p-1.5 rounded-lg text-success hover:bg-success-light transition-colors"
                        title="পাওয়া গেছে হিসেবে চিহ্নিত করুন"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button
                        onClick={() => {
                          deleteWantedPost(post.id);
                          showToast('পোস্ট মুছে ফেলা হয়েছে');
                        }}
                        className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error-light transition-colors"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Institute & Level tags */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted my-3">
                  {post.institute_name && (
                    <span className="flex items-center gap-1 font-medium text-text-main">
                      <Building2 size={14} className="text-primary" />
                      {post.institute_name}
                    </span>
                  )}
                  {post.level_label && (
                    <span className="px-2 py-0.5 rounded bg-warm-surface font-medium border border-border-warm">
                      {post.level_label}
                    </span>
                  )}
                  <span className="ml-auto">পোস্ট করেছেন: {post.user_name}</span>
                </div>

                {post.description && (
                  <p className="text-sm text-text-secondary leading-relaxed bg-warm-surface p-3 rounded-xl border border-border-warm/60">
                    {post.description}
                  </p>
                )}

                {/* Public Offers List under this Wanted Post */}
                {offers.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border-warm space-y-3">
                    <h4 className="text-xs font-bold text-text-main flex items-center gap-1">
                      <Tag size={13} className="text-accent" />
                      বিক্রেতাদের সাড়া ({offers.length}):
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {offers.map((off) => (
                        <div key={off.id} className="p-3 rounded-xl bg-accent-50/60 border border-accent-100 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Avatar name={off.seller_name} src={off.seller_avatar} size="sm" />
                              <span className="text-xs font-bold text-text-main">{off.seller_name}</span>
                            </div>
                            <span className="text-sm font-extrabold text-accent-dark">
                              {formatPrice(off.price)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-text-muted pt-1">
                            <ConditionBadge condition={off.condition} />
                            <span>· {off.location}</span>
                          </div>
                          {off.description && (
                            <p className="text-xs text-text-secondary pt-0.5">{off.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Response CTA */}
                {!isOwner && !post.fulfilled && (
                  <div className="mt-4 pt-3 border-t border-border-warm flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenOfferModal(post)}
                    >
                      <MessageSquare size={14} />
                      আমার কাছে এই বইটি আছে
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create Wanted Post Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="ওয়ান্টেড পোস্ট তৈরি করুন"
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="বইয়ের নাম *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="যেমন: অপটিক্স ও আলোর পদার্থবিজ্ঞান"
            required
          />

          <InstituteAutosuggest
            selected={selectedInstitute}
            onSelect={(inst) => setSelectedInstitute(inst)}
          />

          <Input
            label="সেমিস্টার / শ্রেণি (ঐচ্ছিক)"
            value={levelLabel}
            onChange={(e) => setLevelLabel(e.target.value)}
            placeholder="যেমন: ৩য় সেমিস্টার"
          />

          <Textarea
            label="অতিরিক্ত কোনো তথ্য (ঐচ্ছিক)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="কোন এডিশন বা লেখক দরকার তা স্পষ্ট করে লিখতে পারেন..."
            rows={3}
          />

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              বাতিল
            </Button>
            <Button variant="primary" type="submit">
              পোস্ট করুন
            </Button>
          </div>
        </form>
      </Modal>

      {/* Seller Offer Modal */}
      {selectedWanted && (
        <Modal
          isOpen={offerModalOpen}
          onClose={() => setOfferModalOpen(false)}
          title="বই বিক্রির বিবরণ জমা দিন"
          size="sm"
        >
          <form onSubmit={handleSubmitOffer} className="space-y-4">
            <p className="text-xs text-text-muted">
              বই: <span className="font-bold text-text-main">{selectedWanted.title}</span>
            </p>

            <Select
              label="বইয়ের অবস্থা *"
              value={offerCondition}
              onChange={(e) => setOfferCondition(e.target.value as BookCondition)}
              options={CONDITIONS.map((c) => ({
                value: c.value,
                label: language === 'bn' ? c.bn : c.en,
              }))}
            />

            <Input
              label="বিক্রয় মূল্য (৳) *"
              type="number"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              placeholder="যেমন: ৩০০"
              required
            />

            <Input
              label="অবস্থান / এলাকা *"
              value={offerLocation}
              onChange={(e) => setOfferLocation(e.target.value)}
              placeholder="যেমন: ড্যাফোডিল ক্যাম্পাস এলাকা"
              required
            />

            <Textarea
              label="নোট (ঐচ্ছিক)"
              value={offerNote}
              onChange={(e) => setOfferNote(e.target.value)}
              placeholder="বইয়ের কোনো বিশেষত্ব থাকলে লিখুন..."
              rows={2}
            />

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" type="button" onClick={() => setOfferModalOpen(false)}>
                বাতিল
              </Button>
              <Button variant="primary" type="submit">
                অফার জমা দিন
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
