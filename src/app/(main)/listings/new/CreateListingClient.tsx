'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, BookMarked, FileText, ChevronRight, ChevronLeft, Check, AlertCircle, MapPin, Navigation, Phone } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from '@/contexts/LocationContext';
import { useToast } from '@/contexts/ToastContext';
import { CategorySlug, InstituteType, BookCondition, ContactPreference, Institute } from '@/types';
import { CATEGORIES, CONDITIONS, CONTACT_PREFERENCES, INSTITUTE_TYPES, DIVISIONS } from '@/lib/constants';
import { levelsForInstituteType } from '@/lib/levels';
import InstituteAutosuggest from '@/components/listings/InstituteAutosuggest';
import ImageUploader from '@/components/listings/ImageUploader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';

export default function CreateListingClient() {
  const router = useRouter();
  const { createListing } = useData();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { lat, lng, division: locDiv, district: locDist, requestLocation } = useLocation();
  const { showToast } = useToast();

  // Auth Protection Guard
  useEffect(() => {
    if (!user) {
      showToast('বই বিক্রি করতে আগে লগইন করুন', 'info');
      router.push('/login?redirect=/listings/new');
    }
  }, [user, router, showToast]);

  // Wizard Step (1-4)
  const [step, setStep] = useState(1);

  // Form State
  const [categorySlug, setCategorySlug] = useState<CategorySlug>('academic_book');
  const [instituteType, setInstituteType] = useState<InstituteType>('polytechnic');
  const [selectedInstitute, setSelectedInstitute] = useState<Institute>();
  const [division, setDivision] = useState(locDiv || 'dhaka');
  const [district, setDistrict] = useState(locDist || 'ঢাকা');
  const [levelLabel, setLevelLabel] = useState('');

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [descriptionBn, setDescriptionBn] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [condition, setCondition] = useState<BookCondition>('good');
  const [price, setPrice] = useState('');
  const [negotiable, setNegotiable] = useState(true);
  const [quantity, setQuantity] = useState('1');
  const [images, setImages] = useState<string[]>([]);

  // Multi-select Contact Preferences
  const [contactPreferences, setContactPreferences] = useState<ContactPreference[]>(['chat']);
  const [userPhoneInput, setUserPhoneInput] = useState(user?.phone || '');
  const [whatsappNumber, setWhatsappNumber] = useState(user?.phone || '');

  const [error, setError] = useState<string>();

  // Helper lists
  const currentCategory = CATEGORIES.find((c) => c.slug === categorySlug);
  const isAcademic = currentCategory?.needs_institute ?? true;
  const levelOptions = levelsForInstituteType(instituteType);
  const districts = DIVISIONS[division]?.districts || [];

  const toggleContactPreference = (pref: ContactPreference) => {
    if (contactPreferences.includes(pref)) {
      if (contactPreferences.length === 1) {
        showToast('কমপক্ষে ১টি যোগাযোগের মাধ্যম নির্বাচন করতে হবে', 'warning');
        return;
      }
      setContactPreferences((prev) => prev.filter((p) => p !== pref));
    } else {
      setContactPreferences((prev) => [...prev, pref]);
    }
  };

  const validateStep = (currentStep: number): boolean => {
    setError(undefined);

    if (currentStep === 1) {
      if (!categorySlug) {
        setError('দয়া করে ক্যাটাগরি নির্বাচন করুন');
        return false;
      }
    }

    if (currentStep === 2) {
      if (isAcademic) {
        if (!selectedInstitute) {
          setError('দয়া করে ইনস্টিটিউট নির্বাচন করুন');
          return false;
        }
        if (!levelLabel) {
          setError('দয়া করে সেমিস্টার/শ্রেণি নির্বাচন করুন');
          return false;
        }
      }
      if (!district) {
        setError('দয়া করে এলাকা সিলেক্ট করুন');
        return false;
      }
    }

    if (currentStep === 3) {
      if (!title.trim()) {
        setError('বইয়ের নাম লিখুন');
        return false;
      }
      if (!descriptionBn.trim() && !descriptionEn.trim()) {
        setError('কমপক্ষে বাংলায় বা ইংরেজিতে বিবরণ দিন');
        return false;
      }
      const numPrice = parseInt(price, 10);
      if (isNaN(numPrice) || numPrice < 0) {
        setError('সঠিক মূল্য নির্ধারণ করুন');
        return false;
      }
      if (images.length === 0) {
        setError('কমপক্ষে ১টি ছবি আপলোড করুন');
        return false;
      }
    }

    if (currentStep === 4) {
      if (contactPreferences.includes('phone') && !user?.phone && !userPhoneInput.trim()) {
        setError('ফোন নম্বর প্রদর্শন করতে ফোন নম্বর লিখুন');
        return false;
      }
      if (contactPreferences.includes('whatsapp') && !whatsappNumber.trim()) {
        setError('WhatsApp নম্বর লিখুন');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setError(undefined);
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('বিজ্ঞাপন দিতে আগে লগইন করুন', 'error');
      router.push('/login');
      return;
    }

    if (!validateStep(4)) return;

    // Save phone to user if missing
    if (userPhoneInput.trim() && !user.phone) {
      user.phone = userPhoneInput.trim();
    }

    const numPrice = parseInt(price, 10) || 0;
    const numQty = parseInt(quantity, 10) || 1;

    const newListing = createListing({
      seller_id: user.id,
      category_id: currentCategory?.id || 'cat-1',
      category_slug: categorySlug,
      institute_id: isAcademic ? selectedInstitute?.id : undefined,
      title: title.trim(),
      author: author.trim() || undefined,
      description_bn: descriptionBn.trim() || undefined,
      description_en: descriptionEn.trim() || undefined,
      condition,
      level_label: isAcademic ? levelLabel : undefined,
      price: numPrice,
      negotiable,
      quantity: numQty,
      contact_preference: contactPreferences,
      whatsapp_number: contactPreferences.includes('whatsapp') ? whatsappNumber.trim() : undefined,
      images,
      lat: lat || selectedInstitute?.lat || 23.8103,
      lng: lng || selectedInstitute?.lng || 90.4125,
    });

    showToast('আপনার বিজ্ঞাপনটি সফলভাবে প্রকাশ করা হয়েছে!');
    router.push(`/listings/${newListing.id}`);
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 page-enter">
      {/* Step Header Indicator */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-main mb-2">বই বিক্রি করুন</h1>
        <div className="flex items-center justify-between gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step === s
                    ? 'bg-primary text-white ring-4 ring-primary-light'
                    : step > s
                    ? 'bg-success text-white'
                    : 'bg-warm-surface text-text-muted border border-border-warm'
                }`}
              >
                {step > s ? <Check size={14} /> : s}
              </div>
              <span className="text-xs text-text-muted hidden sm:inline">
                {s === 1 ? 'ক্যাটাগরি' : s === 2 ? 'ইনস্টিটিউট ও এলাকা' : s === 3 ? 'বইয়ের বিবরণ' : 'যোগাযোগ'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-error-light text-error text-sm font-medium flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border-warm p-6 space-y-6 shadow-[var(--shadow-card)]">
        {/* STEP 1: CATEGORY SELECTION */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-text-main">১. বইয়ের ক্যাটাগরি নির্বাচন করুন</h2>
            <div className="grid grid-cols-1 gap-3">
              {/* Academic Book */}
              <button
                type="button"
                onClick={() => setCategorySlug('academic_book')}
                className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  categorySlug === 'academic_book'
                    ? 'border-primary bg-primary-50 ring-2 ring-primary-light'
                    : 'border-border-warm bg-white hover:border-primary-200'
                }`}
              >
                <div className="p-3 rounded-xl bg-primary-100 text-primary shrink-0">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-text-main">একাডেমিক বই</h3>
                  <p className="text-xs text-text-muted mt-1">স্কুল, কলেজ, পলিটেকনিক, বিশ্ববিদ্যালয় বা মাদ্রাসা পাঠ্যবই</p>
                </div>
              </button>

              {/* General / Story Book */}
              <button
                type="button"
                onClick={() => setCategorySlug('general_book')}
                className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  categorySlug === 'general_book'
                    ? 'border-accent bg-accent-50 ring-2 ring-accent-light'
                    : 'border-border-warm bg-white hover:border-accent-200'
                }`}
              >
                <div className="p-3 rounded-xl bg-accent-100 text-accent shrink-0">
                  <BookMarked size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-text-main">সাধারণ বই / উপন্যাস / গল্প</h3>
                  <p className="text-xs text-text-muted mt-1">সাধারণ পড়ার বই, সাহিত্য, গল্পের বই বা আত্মউন্নয়নমূলক বই</p>
                </div>
              </button>

              {/* Notes & Suggestions */}
              <button
                type="button"
                onClick={() => setCategorySlug('notes_suggestion')}
                className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  categorySlug === 'notes_suggestion'
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-border-warm bg-white hover:border-blue-200'
                }`}
              >
                <div className="p-3 rounded-xl bg-blue-100 text-blue-600 shrink-0">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-text-main">নোটস / সাজেশন / প্রশ্ন ব্যাংক</h3>
                  <p className="text-xs text-text-muted mt-1">পরীক্ষার আগের হ্যান্ডনোট, সাজেশনস ও প্রিভিয়াস ইয়ার সলিউশন</p>
                </div>
              </button>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="button" onClick={handleNext}>
                পরবর্তী ধাপ <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: INSTITUTE & LOCATION DETAILS */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-text-main">
              ২. ইনস্টিটিউট ও এলাকা নির্বাচন
            </h2>

            {isAcademic && (
              <>
                <Select
                  label="ইনস্টিটিউটের ধরণ"
                  value={instituteType}
                  onChange={(e) => {
                    setInstituteType(e.target.value as InstituteType);
                    setSelectedInstitute(undefined);
                    setLevelLabel('');
                  }}
                  options={INSTITUTE_TYPES.map((t) => ({
                    value: t.value,
                    label: language === 'bn' ? t.bn : t.en,
                  }))}
                />

                <InstituteAutosuggest
                  instituteType={instituteType}
                  selected={selectedInstitute}
                  onSelect={(inst) => setSelectedInstitute(inst)}
                />

                <Select
                  label="সেমিস্টার / শ্রেণি / বর্ষ"
                  value={levelLabel}
                  onChange={(e) => setLevelLabel(e.target.value)}
                  options={[
                    { value: '', label: 'সেমিস্টার/শ্রেণি বাছুন' },
                    ...levelOptions.map((lvl) => ({
                      value: lvl.bn,
                      label: language === 'bn' ? lvl.bn : lvl.en,
                    })),
                  ]}
                />
              </>
            )}

            {/* Location Selector Option */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-text-main">
                  বিজ্ঞাপনের অবস্থান / এলাকা *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    requestLocation();
                    showToast('জিপিএস লোকেশন সনাক্ত করা হচ্ছে...', 'info');
                  }}
                  className="text-xs text-primary font-medium flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Navigation size={13} />
                  GPS দিয়ে অটো ডিটেক্ট করুন
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="বিভাগ"
                  value={division}
                  onChange={(e) => {
                    setDivision(e.target.value);
                    setDistrict('');
                  }}
                  options={Object.entries(DIVISIONS).map(([key, d]) => ({
                    value: key,
                    label: d[language],
                  }))}
                />

                <Select
                  label="জেলা"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  options={districts.map((d) => ({
                    value: d.bn,
                    label: d[language],
                  }))}
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <Button type="button" variant="outline" onClick={handlePrev}>
                <ChevronLeft size={16} /> পূর্ববর্তী
              </Button>
              <Button type="button" onClick={handleNext}>
                পরবর্তী ধাপ <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: BOOK DETAILS & IMAGES */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-text-main">৩. বইয়ের বিবরণ ও ছবি</h2>

            <Input
              label="বইয়ের নাম *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="যেমন: ডাটা স্ট্রাকচার ও অ্যালগরিদম"
              required
            />

            <Input
              label="লেখক / প্রকাশক (ঐচ্ছিক)"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="যেমন: লেখক রফিকুল ইসলাম"
            />

            <Textarea
              label="বইয়ের বিবরণ (বাংলায়)"
              value={descriptionBn}
              onChange={(e) => setDescriptionBn(e.target.value)}
              placeholder="বইটির অবস্থা, কত পুরনো, কোনো দাগ আছে কিনা বিস্তারিত লিখুন..."
              rows={3}
            />

            <Textarea
              label="Description (English - Optional)"
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              placeholder="Brief details about book condition in English..."
              rows={2}
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="বইয়ের অবস্থা *"
                value={condition}
                onChange={(e) => setCondition(e.target.value as BookCondition)}
                options={CONDITIONS.map((c) => ({
                  value: c.value,
                  label: language === 'bn' ? c.bn : c.en,
                }))}
              />

              <Input
                label="মূল্য (৳) *"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="যেমন: ৩০০"
                required
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="negotiable"
                checked={negotiable}
                onChange={(e) => setNegotiable(e.target.checked)}
                className="w-4 h-4 text-primary rounded border-border-warm focus:ring-primary"
              />
              <label htmlFor="negotiable" className="text-sm font-medium text-text-main cursor-pointer">
                দাম আলোচনা সাপেক্ষ (Negotiable)
              </label>
            </div>

            <ImageUploader images={images} onChange={setImages} max={6} />

            <div className="pt-4 flex justify-between">
              <Button type="button" variant="outline" onClick={handlePrev}>
                <ChevronLeft size={16} /> পূর্ববর্তী
              </Button>
              <Button type="button" onClick={handleNext}>
                পরবর্তী ধাপ <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: MULTI-SELECT CONTACT PREFERENCES & PUBLISH */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-text-main">৪. যোগাযোগের মাধ্যম নির্বাচন করুন (একাধিক নির্বাচন করা সম্ভব)</h2>

            <div className="space-y-3">
              {CONTACT_PREFERENCES.map((pref) => {
                const isSelected = contactPreferences.includes(pref.value as ContactPreference);

                return (
                  <div
                    key={pref.value}
                    onClick={() => toggleContactPreference(pref.value as ContactPreference)}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary bg-primary-50 font-medium ring-1 ring-primary'
                        : 'border-border-warm bg-white hover:border-primary-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // Handled by div click
                      className="mt-1 w-4 h-4 text-primary rounded border-border-warm focus:ring-primary"
                    />
                    <div className="flex-1">
                      <span className="block text-sm font-semibold text-text-main">
                        {language === 'bn' ? pref.bn : pref.en}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Inline Phone Input if Phone selected and profile has no phone */}
            {contactPreferences.includes('phone') && (
              <div className="p-4 bg-warm-surface rounded-xl border border-border-warm space-y-2">
                <Input
                  label="আপনার প্রদর্শনীয় ফোন নম্বর *"
                  value={userPhoneInput}
                  onChange={(e) => setUserPhoneInput(e.target.value)}
                  placeholder="01712345678"
                  required
                />
                {!user.phone && (
                  <p className="text-xs text-primary font-medium">
                    * এটি আপনার প্রোফাইলে নতুন ফোন নম্বর হিসেবে সংরক্ষিত হবে।
                  </p>
                )}
              </div>
            )}

            {contactPreferences.includes('whatsapp') && (
              <Input
                label="WhatsApp নম্বর *"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="01712345678"
                required
              />
            )}

            <div className="pt-6 flex justify-between">
              <Button type="button" variant="outline" onClick={handlePrev}>
                <ChevronLeft size={16} /> পূর্ববর্তী
              </Button>
              <Button type="submit" variant="primary" size="lg">
                বিজ্ঞাপন প্রকাশ করুন
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
