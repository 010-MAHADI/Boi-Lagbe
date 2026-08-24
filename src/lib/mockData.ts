import { Institute, User, Listing, Conversation, Message, PriceOffer, WantedPost, Review } from '@/types';

// ===== Institutes =====
export const mockInstitutes: Institute[] = [
  { id: 'inst-1', name: 'ঢাকা পলিটেকনিক ইনস্টিটিউট', name_en: 'Dhaka Polytechnic Institute', type: 'polytechnic', district: 'ঢাকা', division: 'dhaka', lat: 23.7260, lng: 90.3913, verified: true, created_at: '2026-01-01' },
  { id: 'inst-2', name: 'রাজশাহী পলিটেকনিক ইনস্টিটিউট', name_en: 'Rajshahi Polytechnic Institute', type: 'polytechnic', district: 'রাজশাহী', division: 'rajshahi', lat: 24.3745, lng: 88.6042, verified: true, created_at: '2026-01-01' },
  { id: 'inst-3', name: 'চট্টগ্রাম পলিটেকনিক ইনস্টিটিউট', name_en: 'Chattogram Polytechnic Institute', type: 'polytechnic', district: 'চট্টগ্রাম', division: 'chattogram', lat: 22.3569, lng: 91.7832, verified: true, created_at: '2026-01-01' },
  { id: 'inst-4', name: 'বাংলাদেশ প্রকৌশল বিশ্ববিদ্যালয় (বুয়েট)', name_en: 'BUET', type: 'university', district: 'ঢাকা', division: 'dhaka', lat: 23.7266, lng: 90.3926, verified: true, created_at: '2026-01-01' },
  { id: 'inst-5', name: 'ঢাকা বিশ্ববিদ্যালয়', name_en: 'University of Dhaka', type: 'university', district: 'ঢাকা', division: 'dhaka', lat: 23.7339, lng: 90.3926, verified: true, created_at: '2026-01-01' },
  { id: 'inst-6', name: 'জাহাঙ্গীরনগর বিশ্ববিদ্যালয়', name_en: 'Jahangirnagar University', type: 'university', district: 'ঢাকা', division: 'dhaka', lat: 23.8827, lng: 90.2676, verified: true, created_at: '2026-01-01' },
  { id: 'inst-7', name: 'কুমিল্লা পলিটেকনিক', name_en: 'Cumilla Polytechnic', type: 'polytechnic', district: 'কুমিল্লা', division: 'chattogram', lat: 23.4607, lng: 91.1809, verified: true, created_at: '2026-01-01' },
  { id: 'inst-8', name: 'ময়মনসিংহ পলিটেকনিক', name_en: 'Mymensingh Polytechnic', type: 'polytechnic', district: 'ময়মনসিংহ', division: 'mymensingh', lat: 24.7471, lng: 90.4203, verified: true, created_at: '2026-01-01' },
  { id: 'inst-9', name: 'বরিশাল পলিটেকনিক', name_en: 'Barishal Polytechnic', type: 'polytechnic', district: 'বরিশাল', division: 'barishal', lat: 22.7010, lng: 90.3535, verified: true, created_at: '2026-01-01' },
  { id: 'inst-10', name: 'সিলেট পলিটেকনিক', name_en: 'Sylhet Polytechnic', type: 'polytechnic', district: 'সিলেট', division: 'sylhet', lat: 24.8949, lng: 91.8687, verified: true, created_at: '2026-01-01' },
  { id: 'inst-11', name: 'ঢাকা কলেজ', name_en: 'Dhaka College', type: 'college', district: 'ঢাকা', division: 'dhaka', lat: 23.7330, lng: 90.3980, verified: true, created_at: '2026-01-01' },
  { id: 'inst-12', name: 'নটর ডেম কলেজ', name_en: 'Notre Dame College', type: 'college', district: 'ঢাকা', division: 'dhaka', lat: 23.7372, lng: 90.3880, verified: true, created_at: '2026-01-01' },
  { id: 'inst-13', name: 'রাজশাহী কলেজ', name_en: 'Rajshahi College', type: 'college', district: 'রাজশাহী', division: 'rajshahi', lat: 24.3636, lng: 88.6241, verified: true, created_at: '2026-01-01' },
  { id: 'inst-14', name: 'বগুড়া পলিটেকনিক', name_en: 'Bogura Polytechnic', type: 'polytechnic', district: 'বগুড়া', division: 'rajshahi', lat: 24.8465, lng: 88.8695, verified: true, created_at: '2026-01-01' },
  { id: 'inst-15', name: 'পাবনা পলিটেকনিক', name_en: 'Pabna Polytechnic', type: 'polytechnic', district: 'পাবনা', division: 'rajshahi', lat: 24.0064, lng: 89.2372, verified: true, created_at: '2026-01-01' },
  { id: 'inst-16', name: 'ফেনী পলিটেকনিক', name_en: 'Feni Polytechnic', type: 'polytechnic', district: 'ফেনী', division: 'chattogram', lat: 23.0159, lng: 91.3976, verified: true, created_at: '2026-01-01' },
  { id: 'inst-17', name: 'যশোর পলিটেকনিক', name_en: 'Jessore Polytechnic', type: 'polytechnic', district: 'যশোর', division: 'khulna', lat: 23.1634, lng: 89.2132, verified: true, created_at: '2026-01-01' },
  { id: 'inst-18', name: 'রংপুর পলিটেকনিক', name_en: 'Rangpur Polytechnic', type: 'polytechnic', district: 'রংপুর', division: 'rangpur', lat: 25.7439, lng: 89.2752, verified: true, created_at: '2026-01-01' },
  { id: 'inst-19', name: 'খুলনা প্রকৌশল ও প্রযুক্তি বিশ্ববিদ্যালয় (কুয়েট)', name_en: 'KUET', type: 'university', district: 'খুলনা', division: 'khulna', lat: 22.9006, lng: 89.5024, verified: true, created_at: '2026-01-01' },
  { id: 'inst-20', name: 'চট্টগ্রাম কলেজ', name_en: 'Chattogram College', type: 'college', district: 'চট্টগ্রাম', division: 'chattogram', lat: 22.3419, lng: 91.8266, verified: true, created_at: '2026-01-01' },
];

// ===== Users =====
export const mockUsers: User[] = [
  { id: 'user-1', name: 'রহিম উদ্দিন', email: 'rahim@example.com', phone: '01712345678', rating_avg: 4.5, rating_count: 12, created_at: '2026-02-15' },
  { id: 'user-2', name: 'ফাতেমা আক্তার', email: 'fatema@example.com', phone: '01812345678', rating_avg: 4.8, rating_count: 8, created_at: '2026-03-01' },
  { id: 'user-3', name: 'কামরুল হাসান', email: 'kamrul@example.com', rating_avg: 4.2, rating_count: 5, created_at: '2026-03-10' },
  { id: 'user-4', name: 'নাফিসা ইসলাম', email: 'nafisa@example.com', phone: '01912345678', rating_avg: 5.0, rating_count: 3, created_at: '2026-04-01' },
  { id: 'user-5', name: 'সাকিব আহমেদ', email: 'sakib@example.com', rating_avg: 3.8, rating_count: 15, created_at: '2026-04-15' },
  { id: 'user-6', name: 'তানজিনা রহমান', email: 'tanjina@example.com', phone: '01612345678', rating_avg: 4.6, rating_count: 7, created_at: '2026-05-01' },
  { id: 'user-7', name: 'মাহমুদুল হক', email: 'mahmud@example.com', rating_avg: 4.0, rating_count: 10, created_at: '2026-05-20' },
  { id: 'user-8', name: 'রুমানা পারভীন', email: 'rumana@example.com', phone: '01512345678', rating_avg: 4.9, rating_count: 6, created_at: '2026-06-01' },
  // Moderator account — log in with this email to reach /admin.
  { id: 'user-9', name: 'বই লাগবে টিম', email: 'admin@boilagbe.com', phone: '01311111111', role: 'admin', rating_avg: 0, rating_count: 0, created_at: '2026-01-01' },
  { id: 'user-admin', name: 'Mahadi (Admin)', email: 'mahadi379377@gmail.com', phone: '01712345678', role: 'admin', rating_avg: 5.0, rating_count: 99, created_at: '2026-01-01' },
];

// ===== Listings =====
export const mockListings: Listing[] = [
  {
    id: 'listing-1', seller_id: 'user-1', category_id: 'cat-1', category_slug: 'academic_book',
    institute_id: 'inst-1', title: 'ইলেকট্রিক্যাল সার্কিট অ্যানালাইসিস',
    author: 'Boylestad',
    description_bn: '৪র্থ সেমিস্টারের ইলেকট্রিক্যাল সার্কিট বই। ভালো কন্ডিশনে আছে, কোনো পেজ ছেঁড়া নেই। মার্কার দিয়ে কিছু জায়গায় হাইলাইট করা আছে।',
    description_en: 'Electrical circuit analysis book for 4th semester. Good condition, no torn pages. Some highlighting with marker.',
    condition: 'good', level_label: '৪র্থ সেমিস্টার', price: 350, negotiable: true, quantity: 1,
    status: 'active', contact_preference: 'chat', lat: 23.7260, lng: 90.3913,
    images: ['/images/books/book1.jpg'], view_count: 45, created_at: '2026-08-20T10:00:00Z',
  },
  {
    id: 'listing-2', seller_id: 'user-2', category_id: 'cat-1', category_slug: 'academic_book',
    institute_id: 'inst-1', title: 'ফিজিক্স ১ — মেকানিক্স ও তাপগতিবিদ্যা',
    author: 'Halliday, Resnick & Walker',
    description_bn: '১ম সেমিস্টারের ফিজিক্স বই। একদম নতুনের মতো, খুব কম ইউজ করা হয়েছে। সাথে সলিউশন ম্যানুয়ালও দেওয়া হবে।',
    description_en: 'Physics 1 textbook for 1st semester. Almost new, barely used. Solution manual included.',
    condition: 'like_new', level_label: '১ম সেমিস্টার', price: 500, negotiable: false, quantity: 1,
    status: 'active', contact_preference: 'chat', lat: 23.7265, lng: 90.3918,
    images: ['/images/books/book2.jpg'], view_count: 78, created_at: '2026-08-19T14:30:00Z',
  },
  {
    id: 'listing-3', seller_id: 'user-3', category_id: 'cat-2', category_slug: 'general_book',
    title: 'শরৎচন্দ্রের দেবদাস',
    author: 'শরৎচন্দ্র চট্টোপাধ্যায়',
    description_bn: 'শরৎচন্দ্রের অমর উপন্যাস দেবদাস। ভালো কন্ডিশনে আছে, পড়া শেষ তাই বিক্রি করছি।',
    description_en: 'Devdas by Sarat Chandra Chattopadhyay. Classic Bengali novel in good condition.',
    condition: 'good', price: 150, negotiable: true, quantity: 1,
    status: 'active', contact_preference: 'whatsapp', whatsapp_number: '8801712345678',
    lat: 23.8100, lng: 90.4125, images: ['/images/books/book3.jpg'], view_count: 23, created_at: '2026-08-22T09:00:00Z',
  },
  {
    id: 'listing-4', seller_id: 'user-4', category_id: 'cat-3', category_slug: 'notes_suggestion',
    institute_id: 'inst-11', title: 'HSC পদার্থবিজ্ঞান সাজেশন ২০২৬',
    description_bn: 'HSC পরীক্ষার জন্য কমপ্লিট সাজেশন, গত ৫ বছরের প্রশ্ন সহ। নিজে লিখেছি, A+ পেয়েছি এই সাজেশন ফলো করে।',
    description_en: 'Complete HSC Physics suggestion with last 5 years questions. Self-written, got A+ following this.',
    condition: 'new', level_label: 'এইচএসসি ২য় বর্ষ', price: 200, negotiable: false, quantity: 5,
    status: 'active', contact_preference: 'chat', lat: 23.7330, lng: 90.3980,
    images: ['/images/books/book4.jpg'], view_count: 156, created_at: '2026-08-18T16:00:00Z',
  },
  {
    id: 'listing-5', seller_id: 'user-5', category_id: 'cat-1', category_slug: 'academic_book',
    institute_id: 'inst-4', title: 'Introduction to Algorithms (CLRS)',
    author: 'Cormen, Leiserson, Rivest, Stein',
    description_bn: 'CSE এর সবচেয়ে গুরুত্বপূর্ণ বই। হার্ডকভার, ভালো কন্ডিশন। কিছু পেজে পেন্সিল দিয়ে নোট আছে।',
    description_en: 'The essential algorithms textbook for CSE. Hardcover, good condition with some pencil notes.',
    condition: 'good', level_label: '২য় বর্ষ', price: 800, negotiable: true, quantity: 1,
    status: 'active', contact_preference: 'chat', lat: 23.7266, lng: 90.3926,
    images: ['/images/books/book5.jpg'], view_count: 92, created_at: '2026-08-21T11:00:00Z',
  },
  {
    id: 'listing-6', seller_id: 'user-6', category_id: 'cat-1', category_slug: 'academic_book',
    institute_id: 'inst-2', title: 'অটোমোবাইল ইঞ্জিনিয়ারিং',
    author: 'Kripal Singh',
    description_bn: '৬ষ্ঠ সেমিস্টারের অটোমোবাইল বই। একটু পুরনো কিন্তু সব পেজ ঠিক আছে। সস্তায় দিয়ে দিচ্ছি।',
    description_en: 'Automobile engineering for 6th semester. Slightly old but all pages intact. Selling cheap.',
    condition: 'fair', level_label: '৬ষ্ঠ সেমিস্টার', price: 200, negotiable: true, quantity: 1,
    status: 'active', contact_preference: 'phone', lat: 24.3745, lng: 88.6042,
    images: ['/images/books/book6.jpg'], view_count: 31, created_at: '2026-08-17T08:00:00Z',
  },
  {
    id: 'listing-7', seller_id: 'user-7', category_id: 'cat-2', category_slug: 'general_book',
    title: 'হুমায়ূন আহমেদের হিমু সমগ্র',
    author: 'হুমায়ূন আহমেদ',
    description_bn: 'হিমু সিরিজের প্রথম ৫টি বই একসাথে। সব কটাই ভালো কন্ডিশনে। আলাদা আলাদা বিক্রি হবে না।',
    description_en: 'First 5 Himu series books together. All in good condition. Not selling separately.',
    condition: 'good', price: 600, negotiable: true, quantity: 5,
    status: 'active', contact_preference: 'chat', lat: 23.8050, lng: 90.4100,
    images: ['/images/books/book7.jpg'], view_count: 67, created_at: '2026-08-23T07:30:00Z',
  },
  {
    id: 'listing-8', seller_id: 'user-8', category_id: 'cat-1', category_slug: 'academic_book',
    institute_id: 'inst-3', title: 'ডিজিটাল ইলেকট্রনিক্স',
    author: 'Morris Mano',
    description_bn: '৩য় সেমিস্টারের ডিজিটাল ইলেকট্রনিক্স। খুব ভালো কন্ডিশন, কোনো মার্ক নেই।',
    description_en: 'Digital electronics for 3rd semester. Excellent condition, no marks.',
    condition: 'like_new', level_label: '৩য় সেমিস্টার', price: 400, negotiable: false, quantity: 1,
    status: 'active', contact_preference: 'chat', lat: 22.3569, lng: 91.7832,
    images: ['/images/books/book8.jpg'], view_count: 54, created_at: '2026-08-22T15:00:00Z',
  },
  {
    id: 'listing-9', seller_id: 'user-1', category_id: 'cat-3', category_slug: 'notes_suggestion',
    institute_id: 'inst-1', title: 'ইলেকট্রিক্যাল ৪র্থ সেমিস্টার কমপ্লিট নোটস',
    description_bn: 'ইলেকট্রিক্যাল টেকনোলজির ৪র্থ সেমিস্টারের সব সাবজেক্টের হাতে লেখা নোটস। ক্লিয়ার হ্যান্ডরাইটিং, ডায়াগ্রাম সহ।',
    description_en: 'Complete handwritten notes for all subjects of Electrical 4th semester. Clear handwriting with diagrams.',
    condition: 'good', level_label: '৪র্থ সেমিস্টার', price: 300, negotiable: true, quantity: 3,
    status: 'active', contact_preference: 'chat', lat: 23.7260, lng: 90.3913,
    images: ['/images/books/book9.jpg'], view_count: 89, created_at: '2026-08-21T09:00:00Z',
  },
  {
    id: 'listing-10', seller_id: 'user-3', category_id: 'cat-1', category_slug: 'academic_book',
    institute_id: 'inst-5', title: 'মাইক্রোইকোনমিক্স',
    author: 'Mankiw',
    description_bn: 'অর্থনীতি বিভাগের ১ম বর্ষের বই। একটু পুরনো এডিশন কিন্তু সিলেবাসের সাথে মেলে।',
    description_en: 'Microeconomics for Economics dept 1st year. Slightly older edition but matches syllabus.',
    condition: 'fair', level_label: '১ম বর্ষ', price: 250, negotiable: true, quantity: 1,
    status: 'active', contact_preference: 'whatsapp', whatsapp_number: '8801834567890',
    lat: 23.7339, lng: 90.3926, images: ['/images/books/book10.jpg'], view_count: 19, created_at: '2026-08-15T12:00:00Z',
  },
  {
    id: 'listing-11', seller_id: 'user-2', category_id: 'cat-2', category_slug: 'general_book',
    title: 'রবীন্দ্রনাথের গীতাঞ্জলি',
    author: 'রবীন্দ্রনাথ ঠাকুর',
    description_bn: 'গীতাঞ্জলির সংগ্রহশালা সংস্করণ। হার্ডকভার, সুন্দর প্রিন্ট। উপহারের জন্যও পারফেক্ট।',
    description_en: 'Collector edition of Gitanjali. Hardcover, beautiful print. Perfect for gifting.',
    condition: 'like_new', price: 350, negotiable: false, quantity: 1,
    status: 'active', contact_preference: 'chat', lat: 23.7270, lng: 90.3920,
    images: ['/images/books/book11.jpg'], view_count: 41, created_at: '2026-08-23T13:00:00Z',
  },
  {
    id: 'listing-12', seller_id: 'user-5', category_id: 'cat-1', category_slug: 'academic_book',
    institute_id: 'inst-4', title: 'ডিসক্রিট ম্যাথমেটিক্স',
    author: 'Kenneth Rosen',
    description_bn: 'CSE এর ডিসক্রিট ম্যাথ বই। ৭ম এডিশন। ভালো কন্ডিশন।',
    description_en: 'Discrete mathematics for CSE. 7th edition. Good condition.',
    condition: 'good', level_label: '১ম বর্ষ', price: 450, negotiable: true, quantity: 1,
    status: 'active', contact_preference: 'chat', lat: 23.7266, lng: 90.3926,
    images: ['/images/books/book12.jpg'], view_count: 63, created_at: '2026-08-20T16:30:00Z',
  },
  {
    id: 'listing-13', seller_id: 'user-4', category_id: 'cat-1', category_slug: 'academic_book',
    institute_id: 'inst-7', title: 'পাওয়ার প্ল্যান্ট ইঞ্জিনিয়ারিং',
    author: 'P.K. Nag',
    description_bn: '৫ম সেমিস্টারের পাওয়ার প্ল্যান্ট বই। কিছু পেজে আন্ডারলাইন করা আছে কিন্তু পড়তে সমস্যা নেই।',
    description_en: 'Power plant engineering for 5th semester. Some underlines but readable.',
    condition: 'good', level_label: '৫ম সেমিস্টার', price: 280, negotiable: true, quantity: 1,
    status: 'active', contact_preference: 'chat', lat: 23.4607, lng: 91.1809,
    images: ['/images/books/book13.jpg'], view_count: 27, created_at: '2026-08-19T11:00:00Z',
  },
  {
    id: 'listing-14', seller_id: 'user-6', category_id: 'cat-3', category_slug: 'notes_suggestion',
    institute_id: 'inst-12', title: 'HSC রসায়ন সাজেশন ও টেস্ট পেপার',
    description_bn: 'নটর ডেমের শিক্ষকদের তৈরি করা HSC রসায়ন সাজেশন। গত ১০ বছরের প্রশ্ন প্যাটার্ন অনুযায়ী।',
    description_en: 'HSC Chemistry suggestion prepared by Notre Dame teachers. Based on last 10 years question patterns.',
    condition: 'new', level_label: 'এইচএসসি ২য় বর্ষ', price: 180, negotiable: false, quantity: 10,
    status: 'active', contact_preference: 'chat', lat: 23.7372, lng: 90.3880,
    images: ['/images/books/book14.jpg'], view_count: 203, created_at: '2026-08-16T10:00:00Z',
  },
  {
    id: 'listing-15', seller_id: 'user-7', category_id: 'cat-1', category_slug: 'academic_book',
    institute_id: 'inst-14', title: 'থার্মোডায়নামিক্স',
    author: 'Yunus Cengel',
    description_bn: '৩য় সেমিস্টারের থার্মোডায়নামিক্স। নতুন কেনা কিন্তু সাবজেক্ট চেঞ্জ হয়ে গেছে। আনইউজড।',
    description_en: 'Thermodynamics for 3rd semester. Bought new but subject changed. Unused.',
    condition: 'new', level_label: '৩য় সেমিস্টার', price: 550, negotiable: true, quantity: 1,
    status: 'active', contact_preference: 'phone', lat: 24.8465, lng: 88.8695,
    images: ['/images/books/book15.jpg'], view_count: 35, created_at: '2026-08-22T08:00:00Z',
  },
  {
    id: 'listing-16', seller_id: 'user-8', category_id: 'cat-2', category_slug: 'general_book',
    title: 'মিসির আলি সমগ্র (১ম খণ্ড)',
    author: 'হুমায়ূন আহমেদ',
    description_bn: 'মিসির আলি সিরিজের প্রথম খণ্ড। সব গল্প একসাথে। খুবই ভালো কন্ডিশন।',
    description_en: 'Misir Ali Samagra Vol 1 by Humayun Ahmed. All stories in one volume. Very good condition.',
    condition: 'like_new', price: 400, negotiable: false, quantity: 1,
    status: 'active', contact_preference: 'chat', lat: 22.3575, lng: 91.7840,
    images: ['/images/books/book16.jpg'], view_count: 88, created_at: '2026-08-23T17:00:00Z',
  },
  {
    id: 'listing-17', seller_id: 'user-1', category_id: 'cat-1', category_slug: 'academic_book',
    institute_id: 'inst-1', title: 'ম্যাথমেটিক্স ১ — ক্যালকুলাস',
    author: 'Thomas',
    description_bn: '১ম সেমিস্টারের ক্যালকুলাস বই। ভালো অবস্থায় আছে। কিছু সমস্যার সমাধান পেন্সিলে লেখা আছে।',
    description_en: 'Calculus for 1st semester. Good condition with some pencil solutions.',
    condition: 'good', level_label: '১ম সেমিস্টার', price: 300, negotiable: true, quantity: 1,
    status: 'active', contact_preference: 'chat', lat: 23.7262, lng: 90.3915,
    images: ['/images/books/book17.jpg'], view_count: 52, created_at: '2026-08-18T14:00:00Z',
  },
  {
    id: 'listing-18', seller_id: 'user-3', category_id: 'cat-1', category_slug: 'academic_book',
    institute_id: 'inst-6', title: 'অর্গানিক কেমিস্ট্রি',
    author: 'Morrison & Boyd',
    description_bn: 'রসায়ন বিভাগের ২য় বর্ষের অর্গানিক কেমিস্ট্রি। ভারী বই, প্রায় ১০০০ পেজ। সব ঠিক আছে।',
    description_en: 'Organic chemistry for Chemistry dept 2nd year. Heavy book, ~1000 pages. All intact.',
    condition: 'good', level_label: '২য় বর্ষ', price: 650, negotiable: true, quantity: 1,
    status: 'active', contact_preference: 'chat', lat: 23.8827, lng: 90.2676,
    images: ['/images/books/book18.jpg'], view_count: 38, created_at: '2026-08-21T13:00:00Z',
  },
  {
    id: 'listing-19', seller_id: 'user-5', category_id: 'cat-3', category_slug: 'notes_suggestion',
    institute_id: 'inst-4', title: 'CSE ডাটা স্ট্রাকচার ল্যাব ম্যানুয়াল',
    description_bn: 'বুয়েটের CSE ডিপার্টমেন্টের ডাটা স্ট্রাকচার ল্যাব ম্যানুয়াল। সব এক্সপেরিমেন্ট কোড সহ। ফটোকপি।',
    description_en: 'BUET CSE Data Structure lab manual with all experiment codes. Photocopy.',
    condition: 'fair', level_label: '২য় বর্ষ', price: 120, negotiable: false, quantity: 2,
    status: 'active', contact_preference: 'chat', lat: 23.7268, lng: 90.3928,
    images: ['/images/books/book19.jpg'], view_count: 71, created_at: '2026-08-20T09:30:00Z',
  },
  {
    id: 'listing-20', seller_id: 'user-2', category_id: 'cat-1', category_slug: 'academic_book',
    institute_id: 'inst-1', title: '২য় সেমিস্টার সব বই একসাথে (৬টি)',
    description_bn: 'ঢাকা পলিটেকনিকের ইলেকট্রিক্যাল ২য় সেমিস্টারের সব বই একসাথে দিচ্ছি। আলাদা কিনলে ৩০০০+ লাগবে।',
    description_en: 'All 6 books for Dhaka Polytechnic Electrical 2nd semester together. Would cost 3000+ separately.',
    condition: 'good', level_label: '২য় সেমিস্টার', price: 1500, negotiable: true, quantity: 6,
    status: 'active', contact_preference: 'chat', lat: 23.7263, lng: 90.3916,
    images: ['/images/books/book20.jpg'], view_count: 134, created_at: '2026-08-23T11:00:00Z',
  },
];

// ===== Conversations =====
export const mockConversations: Conversation[] = [
  {
    id: 'conv-1', listing_id: 'listing-1', buyer_id: 'user-3', seller_id: 'user-1',
    listing_title: 'ইলেকট্রিক্যাল সার্কিট অ্যানালাইসিস', listing_image: '/images/books/book1.jpg',
    last_message: 'ভাই বইটা কি এখনো আছে?', last_message_at: '2026-08-23T15:30:00Z',
    unread_count: 1, created_at: '2026-08-23T15:00:00Z',
  },
  {
    id: 'conv-2', listing_id: 'listing-5', buyer_id: 'user-1', seller_id: 'user-5',
    listing_title: 'Introduction to Algorithms (CLRS)', listing_image: '/images/books/book5.jpg',
    last_message: '৳700 দিলে নিয়ে যান', last_message_at: '2026-08-23T14:00:00Z',
    unread_count: 0, created_at: '2026-08-22T10:00:00Z',
  },
  {
    id: 'conv-3', listing_id: 'listing-4', buyer_id: 'user-7', seller_id: 'user-4',
    listing_title: 'HSC পদার্থবিজ্ঞান সাজেশন ২০২৬', listing_image: '/images/books/book4.jpg',
    last_message: 'ধানমণ্ডিতে মিট করতে পারবেন?', last_message_at: '2026-08-23T12:00:00Z',
    unread_count: 2, created_at: '2026-08-21T09:00:00Z',
  },
];

// ===== Messages =====
export const mockMessages: Record<string, Message[]> = {
  'conv-1': [
    { id: 'msg-1', conversation_id: 'conv-1', sender_id: 'user-3', content: 'আস্সালামু আলাইকুম ভাই', created_at: '2026-08-23T15:00:00Z', read_at: '2026-08-23T15:01:00Z' },
    { id: 'msg-2', conversation_id: 'conv-1', sender_id: 'user-3', content: 'বইটা কি এখনো আছে? কন্ডিশন কেমন?', created_at: '2026-08-23T15:02:00Z', read_at: '2026-08-23T15:05:00Z' },
    { id: 'msg-3', conversation_id: 'conv-1', sender_id: 'user-1', content: 'ওয়া আলাইকুমুস সালাম! হ্যাঁ ভাই আছে। কন্ডিশন ভালোই, ফটো দেখেছেন তো?', created_at: '2026-08-23T15:05:00Z', read_at: '2026-08-23T15:06:00Z' },
    { id: 'msg-4', conversation_id: 'conv-1', sender_id: 'user-3', content: '৳300 দিলে নিব, কেমন?', created_at: '2026-08-23T15:10:00Z', is_offer: true, offer_amount: 300 },
    { id: 'msg-5', conversation_id: 'conv-1', sender_id: 'user-1', content: '৳320 করে দেন ভাই, ফাইনাল', created_at: '2026-08-23T15:15:00Z' },
    { id: 'msg-6', conversation_id: 'conv-1', sender_id: 'user-3', content: 'ভাই বইটা কি এখনো আছে?', created_at: '2026-08-23T15:30:00Z' },
  ],
  'conv-2': [
    { id: 'msg-7', conversation_id: 'conv-2', sender_id: 'user-1', content: 'CLRS বইটা কি আছে এখনো?', created_at: '2026-08-22T10:00:00Z', read_at: '2026-08-22T10:30:00Z' },
    { id: 'msg-8', conversation_id: 'conv-2', sender_id: 'user-5', content: 'জি আছে', created_at: '2026-08-22T10:30:00Z', read_at: '2026-08-22T10:31:00Z' },
    { id: 'msg-9', conversation_id: 'conv-2', sender_id: 'user-1', content: '৳650 হবে?', created_at: '2026-08-22T10:32:00Z', is_offer: true, offer_amount: 650 },
    { id: 'msg-10', conversation_id: 'conv-2', sender_id: 'user-5', content: '৳700 দিলে নিয়ে যান', created_at: '2026-08-23T14:00:00Z', read_at: '2026-08-23T14:01:00Z' },
  ],
  'conv-3': [
    { id: 'msg-11', conversation_id: 'conv-3', sender_id: 'user-7', content: 'সাজেশনটা কোন টপিক কভার করে?', created_at: '2026-08-21T09:00:00Z', read_at: '2026-08-21T09:10:00Z' },
    { id: 'msg-12', conversation_id: 'conv-3', sender_id: 'user-4', content: 'সব টপিক কভার করা আছে ভাই। ১ম ও ২য় পত্র দুইটাই।', created_at: '2026-08-21T09:10:00Z', read_at: '2026-08-21T09:15:00Z' },
    { id: 'msg-13', conversation_id: 'conv-3', sender_id: 'user-7', content: 'ধানমণ্ডিতে মিট করতে পারবেন?', created_at: '2026-08-23T12:00:00Z' },
  ],
};

// ===== Price Offers =====
export const mockPriceOffers: PriceOffer[] = [
  { id: 'offer-1', listing_id: 'listing-1', buyer_id: 'user-3', offered_price: 300, created_at: '2026-08-23T15:10:00Z' },
  { id: 'offer-2', listing_id: 'listing-1', buyer_id: 'user-7', offered_price: 280, created_at: '2026-08-22T10:00:00Z' },
  { id: 'offer-3', listing_id: 'listing-5', buyer_id: 'user-1', offered_price: 650, created_at: '2026-08-22T10:32:00Z' },
  { id: 'offer-4', listing_id: 'listing-5', buyer_id: 'user-6', offered_price: 700, created_at: '2026-08-21T16:00:00Z' },
  { id: 'offer-5', listing_id: 'listing-7', buyer_id: 'user-4', offered_price: 500, created_at: '2026-08-23T09:00:00Z' },
  { id: 'offer-6', listing_id: 'listing-20', buyer_id: 'user-3', offered_price: 1200, created_at: '2026-08-23T12:00:00Z' },
  { id: 'offer-7', listing_id: 'listing-20', buyer_id: 'user-7', offered_price: 1300, created_at: '2026-08-23T13:00:00Z' },
];

// ===== Wanted Posts =====
export const mockWantedPosts: WantedPost[] = [
  {
    id: 'wanted-1', user_id: 'user-3', user_name: 'কামরুল হাসান',
    title: 'ইলেকট্রিক্যাল মেশিন — ৫ম সেমিস্টার',
    institute_id: 'inst-1', institute_name: 'ঢাকা পলিটেকনিক ইনস্টিটিউট',
    level_label: '৫ম সেমিস্টার',
    description: 'ইলেকট্রিক্যাল মেশিনের বইটা খুঁজছি। ঢাকা পলিটেকনিকের ৫ম সেমিস্টারের জন্য। যেকোনো কন্ডিশন হলেই চলবে।',
    created_at: '2026-08-22T10:00:00Z', fulfilled: false,
  },
  {
    id: 'wanted-2', user_id: 'user-7', user_name: 'মাহমুদুল হক',
    title: 'HSC উচ্চতর গণিত ১ম পত্র',
    institute_id: 'inst-12', institute_name: 'নটর ডেম কলেজ',
    level_label: 'এইচএসসি ১ম বর্ষ',
    description: 'উচ্চতর গণিত ১ম পত্রের বই দরকার। ভালো কন্ডিশন হলে ভালো হয়।',
    created_at: '2026-08-21T14:00:00Z', fulfilled: false,
  },
  {
    id: 'wanted-3', user_id: 'user-4', user_name: 'নাফিসা ইসলাম',
    title: 'Programming in C — Balagurusamy',
    institute_id: 'inst-7', institute_name: 'কুমিল্লা পলিটেকনিক',
    level_label: '২য় সেমিস্টার',
    description: 'C প্রোগ্রামিং এর বইটা দরকার। Balagurusamy এর হলে সবচেয়ে ভালো হয়, তবে অন্য লেখকেরও চলবে।',
    created_at: '2026-08-20T09:00:00Z', fulfilled: false,
  },
  {
    id: 'wanted-4', user_id: 'user-6', user_name: 'তানজিনা রহমান',
    title: 'রবীন্দ্র রচনাবলী (যেকোনো খণ্ড)',
    description: 'রবীন্দ্রনাথের রচনাবলীর যেকোনো খণ্ড কিনতে চাই। পুরনো হলেও চলবে।',
    created_at: '2026-08-19T16:00:00Z', fulfilled: false,
  },
];

// ===== Reviews =====
export const mockReviews: Review[] = [
  { id: 'rev-1', reviewed_user_id: 'user-1', reviewer_id: 'user-3', reviewer_name: 'কামরুল হাসান', listing_id: 'listing-1', rating: 5, comment: 'অনেক ভালো সেলার, বই ঠিক যেমন বলেছিলেন তেমনই ছিল।', created_at: '2026-08-10T10:00:00Z' },
  { id: 'rev-2', reviewed_user_id: 'user-2', reviewer_id: 'user-7', reviewer_name: 'মাহমুদুল হক', listing_id: 'listing-2', rating: 5, comment: 'সময়মতো এসেছেন, বইয়ের কন্ডিশনও খুব ভালো।', created_at: '2026-08-12T14:00:00Z' },
  { id: 'rev-3', reviewed_user_id: 'user-5', reviewer_id: 'user-1', reviewer_name: 'রহিম উদ্দিন', listing_id: 'listing-5', rating: 4, comment: 'ভালো বই, তবে দেখা করতে একটু দেরি করেছিলেন।', created_at: '2026-08-15T11:00:00Z' },
  { id: 'rev-4', reviewed_user_id: 'user-4', reviewer_id: 'user-6', reviewer_name: 'তানজিনা রহমান', listing_id: 'listing-4', rating: 5, comment: 'সাজেশনটা অসাধারণ! A+ পাওয়ার পথে।', created_at: '2026-08-18T09:00:00Z' },
];

// Helper functions to look up related data
export function getInstituteById(id: string): Institute | undefined {
  return mockInstitutes.find((i) => i.id === id);
}

export function getUserById(id: string): User | undefined {
  return mockUsers.find((u) => u.id === id);
}

export function getListingById(id: string): Listing | undefined {
  return mockListings.find((l) => l.id === id);
}

export function getOffersForListing(listingId: string): PriceOffer[] {
  return mockPriceOffers.filter((o) => o.listing_id === listingId);
}

export function getReviewsForUser(userId: string): Review[] {
  return mockReviews.filter((r) => r.reviewed_user_id === userId);
}
