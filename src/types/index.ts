// ===== User =====
export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  institute_id?: string;
  /** Absent means an ordinary member; only moderators carry `admin`. */
  role?: UserRole;
  rating_avg: number;
  rating_count: number;
  is_blocked?: boolean;
  is_verified?: boolean;
  created_at: string;
}

// ===== Institute =====
export type InstituteType = 'school' | 'college' | 'polytechnic' | 'university' | 'madrasah' | 'coaching';

export interface Institute {
  id: string;
  name: string;
  name_en: string;
  type: InstituteType;
  district: string;
  division: string;
  lat: number;
  lng: number;
  verified: boolean;
  created_by?: string;
  created_at: string;
}

// ===== Category =====
export type CategorySlug = 'academic_book' | 'general_book' | 'notes_suggestion';

export interface Category {
  id: string;
  slug: CategorySlug;
  name_bn: string;
  name_en: string;
  icon: string;
  needs_institute: boolean;
}

// ===== Listing =====
export type BookCondition = 'new' | 'like_new' | 'good' | 'fair';
export type ListingStatus = 'active' | 'sold';
export type ContactPreference = 'chat' | 'phone' | 'whatsapp';

export interface Listing {
  id: string;
  slug?: string;
  seller_id: string;
  category_id: string;
  category_slug: CategorySlug;
  institute_id?: string;
  title: string;
  author?: string;
  description_bn?: string;
  description_en?: string;
  condition: BookCondition;
  level_label?: string;
  price: number;
  negotiable: boolean;
  quantity: number;
  status: ListingStatus;
  contact_preference: ContactPreference | ContactPreference[];
  whatsapp_number?: string;
  lat: number;
  lng: number;
  images: string[];
  view_count: number;
  created_at: string;
}

// ===== Listing Image =====
export interface ListingImage {
  id: string;
  listing_id: string;
  url: string;
  sort_order: number;
}

// ===== Conversation =====
export interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  listing_title: string;
  listing_image?: string;
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
  created_at: string;
}

// ===== Message =====
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_offer?: boolean;
  offer_amount?: number;
  created_at: string;
  read_at?: string;
}

// ===== Price Offer =====
export interface PriceOffer {
  id: string;
  listing_id: string;
  buyer_id: string;
  offered_price: number;
  created_at: string;
}

// ===== Wanted Post & Offer =====
export interface WantedOffer {
  id: string;
  wanted_id: string;
  seller_id: string;
  seller_name: string;
  seller_avatar?: string;
  condition: BookCondition;
  price: number;
  location: string;
  description?: string;
  created_at: string;
}

// ===== Wanted Post =====
export interface WantedPost {
  id: string;
  user_id: string;
  user_name: string;
  title: string;
  institute_id?: string;
  institute_name?: string;
  level_label?: string;
  description?: string;
  created_at: string;
  fulfilled: boolean;
}

// ===== Review =====
export interface Review {
  id: string;
  reviewed_user_id: string;
  reviewer_id: string;
  reviewer_name: string;
  listing_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

// ===== Report =====
export type ReportReason = 'already_sold' | 'spam' | 'scam' | 'inappropriate' | 'other';
export type ReportStatus = 'open' | 'reviewed' | 'dismissed';
export type ReportTargetType = 'listing' | 'user';

export interface Report {
  id: string;
  target_type: ReportTargetType;
  target_id: string;
  reporter_id: string;
  reason: ReportReason;
  status: ReportStatus;
  created_at: string;
}

// ===== Favorite =====
export interface Favorite {
  user_id: string;
  listing_id: string;
}

// ===== Auth =====
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  institute_id?: string;
}

// ===== API Response =====
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ===== Search & Filter =====
export interface SearchFilters {
  query?: string;
  category?: CategorySlug;
  institute_type?: InstituteType;
  institute_id?: string;
  level_label?: string;
  condition?: BookCondition;
  min_price?: number;
  max_price?: number;
  division?: string;
  district?: string;
  sort_by?: 'nearest' | 'newest' | 'price_low' | 'price_high';
  lat?: number;
  lng?: number;
}
