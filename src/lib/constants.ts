import { Category } from '@/types';

// ===== Bangladesh Divisions & Districts =====
export const DIVISIONS: Record<string, { bn: string; en: string; districts: { bn: string; en: string }[] }> = {
  barishal: {
    bn: 'বরিশাল', en: 'Barishal',
    districts: [
      { bn: 'বরিশাল', en: 'Barishal' }, { bn: 'ভোলা', en: 'Bhola' },
      { bn: 'ঝালকাঠি', en: 'Jhalokati' }, { bn: 'পটুয়াখালী', en: 'Patuakhali' },
      { bn: 'পিরোজপুর', en: 'Pirojpur' }, { bn: 'বরগুনা', en: 'Barguna' },
    ],
  },
  chattogram: {
    bn: 'চট্টগ্রাম', en: 'Chattogram',
    districts: [
      { bn: 'চট্টগ্রাম', en: 'Chattogram' }, { bn: 'কক্সবাজার', en: "Cox's Bazar" },
      { bn: 'কুমিল্লা', en: 'Cumilla' }, { bn: 'ফেনী', en: 'Feni' },
      { bn: 'লক্ষ্মীপুর', en: 'Lakshmipur' }, { bn: 'নোয়াখালী', en: 'Noakhali' },
      { bn: 'রাঙামাটি', en: 'Rangamati' }, { bn: 'খাগড়াছড়ি', en: 'Khagrachhari' },
      { bn: 'বান্দরবান', en: 'Bandarban' }, { bn: 'চাঁদপুর', en: 'Chandpur' },
      { bn: 'ব্রাহ্মণবাড়িয়া', en: 'Brahmanbaria' },
    ],
  },
  dhaka: {
    bn: 'ঢাকা', en: 'Dhaka',
    districts: [
      { bn: 'ঢাকা', en: 'Dhaka' }, { bn: 'গাজীপুর', en: 'Gazipur' },
      { bn: 'নারায়ণগঞ্জ', en: 'Narayanganj' }, { bn: 'টাঙ্গাইল', en: 'Tangail' },
      { bn: 'কিশোরগঞ্জ', en: 'Kishoreganj' }, { bn: 'মানিকগঞ্জ', en: 'Manikganj' },
      { bn: 'মুন্সিগঞ্জ', en: 'Munshiganj' }, { bn: 'নরসিংদী', en: 'Narsingdi' },
      { bn: 'ফরিদপুর', en: 'Faridpur' }, { bn: 'গোপালগঞ্জ', en: 'Gopalganj' },
      { bn: 'মাদারীপুর', en: 'Madaripur' }, { bn: 'রাজবাড়ী', en: 'Rajbari' },
      { bn: 'শরীয়তপুর', en: 'Shariatpur' },
    ],
  },
  khulna: {
    bn: 'খুলনা', en: 'Khulna',
    districts: [
      { bn: 'খুলনা', en: 'Khulna' }, { bn: 'যশোর', en: 'Jessore' },
      { bn: 'সাতক্ষীরা', en: 'Satkhira' }, { bn: 'বাগেরহাট', en: 'Bagerhat' },
      { bn: 'কুষ্টিয়া', en: 'Kushtia' }, { bn: 'মেহেরপুর', en: 'Meherpur' },
      { bn: 'ঝিনাইদহ', en: 'Jhenaidah' }, { bn: 'নড়াইল', en: 'Narail' },
      { bn: 'চুয়াডাঙ্গা', en: 'Chuadanga' }, { bn: 'মাগুরা', en: 'Magura' },
    ],
  },
  mymensingh: {
    bn: 'ময়মনসিংহ', en: 'Mymensingh',
    districts: [
      { bn: 'ময়মনসিংহ', en: 'Mymensingh' }, { bn: 'জামালপুর', en: 'Jamalpur' },
      { bn: 'শেরপুর', en: 'Sherpur' }, { bn: 'নেত্রকোণা', en: 'Netrokona' },
    ],
  },
  rajshahi: {
    bn: 'রাজশাহী', en: 'Rajshahi',
    districts: [
      { bn: 'রাজশাহী', en: 'Rajshahi' }, { bn: 'নওগাঁ', en: 'Naogaon' },
      { bn: 'নাটোর', en: 'Natore' }, { bn: 'চাঁপাইনবাবগঞ্জ', en: 'Chapainawabganj' },
      { bn: 'পাবনা', en: 'Pabna' }, { bn: 'সিরাজগঞ্জ', en: 'Sirajganj' },
      { bn: 'বগুড়া', en: 'Bogura' }, { bn: 'জয়পুরহাট', en: 'Joypurhat' },
    ],
  },
  rangpur: {
    bn: 'রংপুর', en: 'Rangpur',
    districts: [
      { bn: 'রংপুর', en: 'Rangpur' }, { bn: 'দিনাজপুর', en: 'Dinajpur' },
      { bn: 'কুড়িগ্রাম', en: 'Kurigram' }, { bn: 'লালমনিরহাট', en: 'Lalmonirhat' },
      { bn: 'নীলফামারী', en: 'Nilphamari' }, { bn: 'গাইবান্ধা', en: 'Gaibandha' },
      { bn: 'ঠাকুরগাঁও', en: 'Thakurgaon' }, { bn: 'পঞ্চগড়', en: 'Panchagarh' },
    ],
  },
  sylhet: {
    bn: 'সিলেট', en: 'Sylhet',
    districts: [
      { bn: 'সিলেট', en: 'Sylhet' }, { bn: 'মৌলভীবাজার', en: 'Moulvibazar' },
      { bn: 'হবিগঞ্জ', en: 'Habiganj' }, { bn: 'সুনামগঞ্জ', en: 'Sunamganj' },
    ],
  },
};

// ===== Categories =====
export const CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    slug: 'academic_book',
    name_bn: 'একাডেমিক বই',
    name_en: 'Academic Book',
    icon: '📚',
    needs_institute: true,
  },
  {
    id: 'cat-2',
    slug: 'general_book',
    name_bn: 'গল্প ও সাহিত্য',
    name_en: 'General / Story Book',
    icon: '📖',
    needs_institute: false,
  },
  {
    id: 'cat-3',
    slug: 'notes_suggestion',
    name_bn: 'নোটস ও সাজেশন',
    name_en: 'Notes / Suggestion',
    icon: '📝',
    needs_institute: true,
  },
];

// ===== Institute Types =====
export const INSTITUTE_TYPES = [
  { value: 'school', bn: 'স্কুল', en: 'School' },
  { value: 'college', bn: 'কলেজ', en: 'College' },
  { value: 'polytechnic', bn: 'পলিটেকনিক', en: 'Polytechnic' },
  { value: 'university', bn: 'বিশ্ববিদ্যালয়', en: 'University' },
  { value: 'madrasah', bn: 'মাদ্রাসা', en: 'Madrasah' },
  { value: 'coaching', bn: 'কোচিং সেন্টার', en: 'Coaching Center' },
] as const;

// ===== Book Conditions =====
export const CONDITIONS = [
  { value: 'new', bn: 'নতুন', en: 'New', color: 'badge-new' },
  { value: 'like_new', bn: 'প্রায় নতুন', en: 'Like New', color: 'badge-like-new' },
  { value: 'good', bn: 'ভালো', en: 'Good', color: 'badge-good' },
  { value: 'fair', bn: 'মোটামুটি', en: 'Fair', color: 'badge-fair' },
] as const;

// ===== Level Options =====
export const POLYTECHNIC_SEMESTERS = [
  { value: '1st-semester', bn: '১ম সেমিস্টার', en: '1st Semester' },
  { value: '2nd-semester', bn: '২য় সেমিস্টার', en: '2nd Semester' },
  { value: '3rd-semester', bn: '৩য় সেমিস্টার', en: '3rd Semester' },
  { value: '4th-semester', bn: '৪র্থ সেমিস্টার', en: '4th Semester' },
  { value: '5th-semester', bn: '৫ম সেমিস্টার', en: '5th Semester' },
  { value: '6th-semester', bn: '৬ষ্ঠ সেমিস্টার', en: '6th Semester' },
  { value: '7th-semester', bn: '৭ম সেমিস্টার', en: '7th Semester' },
  { value: '8th-semester', bn: '৮ম সেমিস্টার', en: '8th Semester' },
];

export const UNIVERSITY_YEARS = [
  { value: '1st-year', bn: '১ম বর্ষ', en: '1st Year' },
  { value: '2nd-year', bn: '২য় বর্ষ', en: '2nd Year' },
  { value: '3rd-year', bn: '৩য় বর্ষ', en: '3rd Year' },
  { value: '4th-year', bn: '৪র্থ বর্ষ', en: '4th Year' },
  { value: 'masters', bn: 'মাস্টার্স', en: 'Masters' },
];

export const SCHOOL_CLASSES = [
  { value: 'class-6', bn: '৬ষ্ঠ শ্রেণি', en: 'Class 6' },
  { value: 'class-7', bn: '৭ম শ্রেণি', en: 'Class 7' },
  { value: 'class-8', bn: '৮ম শ্রেণি', en: 'Class 8' },
  { value: 'class-9', bn: '৯ম শ্রেণি', en: 'Class 9' },
  { value: 'class-10', bn: '১০ম শ্রেণি', en: 'Class 10' },
  { value: 'ssc', bn: 'এসএসসি', en: 'SSC' },
  { value: 'hsc-1st', bn: 'এইচএসসি ১ম বর্ষ', en: 'HSC 1st Year' },
  { value: 'hsc-2nd', bn: 'এইচএসসি ২য় বর্ষ', en: 'HSC 2nd Year' },
];

// ===== Contact Preferences =====
export const CONTACT_PREFERENCES = [
  { value: 'chat', bn: 'অ্যাপের মেসেজ', en: 'In-app Chat', icon: '💬', recommended: true },
  { value: 'phone', bn: 'ফোন নম্বর দেখান', en: 'Show Phone Number', icon: '📞', recommended: false },
  { value: 'whatsapp', bn: 'WhatsApp লিংক', en: 'WhatsApp Link', icon: '📲', recommended: false },
] as const;

// ===== Default Location (Dhaka) =====
export const DEFAULT_LOCATION = {
  lat: 23.8103,
  lng: 90.4125,
  division: 'dhaka',
  district: 'ঢাকা',
};

// ===== Placeholder Images =====
export const PLACEHOLDER_BOOK_IMAGE = '/images/book-placeholder.svg';
export const PLACEHOLDER_AVATAR = '/images/avatar-placeholder.svg';
