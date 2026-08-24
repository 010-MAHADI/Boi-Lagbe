/**
 * Typed API client — all HTTP calls to the FastAPI backend.
 * Base URL is set via NEXT_PUBLIC_API_URL env var (defaults to /api for same-origin).
 */

import type {
  User, Listing, Institute, Conversation, Message,
  PriceOffer, WantedPost, WantedOffer, Review, Report,
  SearchFilters,
} from '@/types';

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');

// ---------------------------------------------------------------------------
// Fetch wrapper
// ---------------------------------------------------------------------------
type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

async function request<T>(
  method: Method,
  path: string,
  body?: unknown,
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      detail = err.detail ?? err.message ?? detail;
    } catch {
      // ignore
    }
    throw new Error(detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  institute_id?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  signup: (data: SignupPayload) =>
    request<TokenResponse>('POST', '/api/auth/signup', data),

  login: (data: LoginPayload) =>
    request<TokenResponse>('POST', '/api/auth/login', data),

  me: (token: string) =>
    request<User>('GET', '/api/auth/me', undefined, token),

  updateMe: (token: string, data: Partial<Pick<User, 'name' | 'phone' | 'avatar_url' | 'institute_id'>>) =>
    request<User>('PATCH', '/api/auth/me', data, token),
};

// ---------------------------------------------------------------------------
// Institutes
// ---------------------------------------------------------------------------
export const institutesApi = {
  list: (params?: { q?: string; type?: string; verified_only?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.q) qs.set('q', params.q);
    if (params?.type) qs.set('type', params.type);
    if (params?.verified_only) qs.set('verified_only', 'true');
    return request<Institute[]>('GET', `/api/institutes?${qs}`);
  },

  create: (token: string, data: Omit<Institute, 'id' | 'verified' | 'created_at'>) =>
    request<Institute>('POST', '/api/institutes', data, token),

  approve: (token: string, id: string) =>
    request<Institute>('POST', `/api/institutes/${id}/approve`, undefined, token),

  delete: (token: string, id: string) =>
    request<void>('DELETE', `/api/institutes/${id}`, undefined, token),
};

// ---------------------------------------------------------------------------
// Listings
// ---------------------------------------------------------------------------
export interface PaginatedListings {
  items: Listing[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

export interface CreateListingPayload {
  category_slug: string;
  institute_id?: string;
  title: string;
  author?: string;
  description_bn?: string;
  description_en?: string;
  condition: string;
  level_label?: string;
  price: number;
  negotiable: boolean;
  quantity: number;
  contact_preference: string[];
  whatsapp_number?: string;
  lat: number;
  lng: number;
  image_keys: string[];
}

export const listingsApi = {
  search: (filters: SearchFilters & { page?: number; page_size?: number }) => {
    const qs = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
    });
    return request<PaginatedListings>('GET', `/api/listings?${qs}`);
  },

  get: (id: string, lat?: number, lng?: number) => {
    const qs = new URLSearchParams();
    if (lat) qs.set('lat', String(lat));
    if (lng) qs.set('lng', String(lng));
    return request<Listing>('GET', `/api/listings/${id}?${qs}`);
  },

  getBySlug: (slug: string, lat?: number, lng?: number) => {
    const qs = new URLSearchParams();
    if (lat) qs.set('lat', String(lat));
    if (lng) qs.set('lng', String(lng));
    return request<Listing>('GET', `/api/listings/slug/${slug}?${qs}`);
  },

  create: (token: string, data: CreateListingPayload) =>
    request<Listing>('POST', '/api/listings', data, token),

  update: (token: string, id: string, data: Partial<Listing>) =>
    request<Listing>('PATCH', `/api/listings/${id}`, data, token),

  delete: (token: string, id: string) =>
    request<void>('DELETE', `/api/listings/${id}`, undefined, token),

  markSold: (token: string, id: string) =>
    request<Listing>('PATCH', `/api/listings/${id}`, { status: 'sold' }, token),

  byUser: (userId: string) =>
    request<Listing[]>('GET', `/api/listings/user/${userId}`),
};

// ---------------------------------------------------------------------------
// Upload (R2 presigned URL flow)
// ---------------------------------------------------------------------------
export interface PresignedUploadResponse {
  upload_url: string;
  r2_key: string;
  public_url: string;
}

export const uploadApi = {
  /** Step 1: Get a presigned PUT URL from the backend */
  presign: (token: string, filename: string, contentType: string) =>
    request<PresignedUploadResponse>('POST', '/api/upload/presign', { filename, content_type: contentType }, token),

  /** Step 2: PUT the file bytes directly to R2 (no auth header needed) */
  putToR2: async (uploadUrl: string, file: File): Promise<void> => {
    const res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    if (!res.ok) throw new Error(`R2 upload failed: ${res.status}`);
  },

  /**
   * Convenience: presign + upload a File, return the r2_key.
   * The r2_key is what you pass in CreateListingPayload.image_keys[].
   */
  uploadFile: async (token: string, file: File): Promise<{ r2_key: string; public_url: string }> => {
    const { upload_url, r2_key, public_url } = await uploadApi.presign(token, file.name, file.type);
    await uploadApi.putToR2(upload_url, file);
    return { r2_key, public_url };
  },

  /** Delete a file from R2 by its key */
  deleteFile: (token: string, key: string) =>
    request<void>('DELETE', `/api/upload/${key}`, undefined, token),
};

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------
export const chatApi = {
  conversations: (token: string) =>
    request<Conversation[]>('GET', '/api/chat/conversations', undefined, token),

  startConversation: (token: string, listing_id: string) =>
    request<Conversation>('POST', '/api/chat/conversations', undefined, token,
    // pass listing_id as query param
    ).catch(() => {}) as Promise<Conversation>,

  startConversationForListing: (token: string, listing_id: string) =>
    request<Conversation>('POST', `/api/chat/conversations?listing_id=${listing_id}`, undefined, token),

  messages: (token: string, convId: string, after?: string) => {
    const qs = after ? `?after=${encodeURIComponent(after)}` : '';
    return request<Message[]>('GET', `/api/chat/conversations/${convId}/messages${qs}`, undefined, token);
  },

  sendMessage: (token: string, convId: string, content: string, offerAmount?: number) =>
    request<Message>('POST', `/api/chat/conversations/${convId}/messages`, {
      content,
      is_offer: offerAmount !== undefined,
      offer_amount: offerAmount,
    }, token),

  priceOffers: (listingId: string) =>
    request<PriceOffer[]>('GET', `/api/chat/listings/${listingId}/offers`),
};

// ---------------------------------------------------------------------------
// Wanted board
// ---------------------------------------------------------------------------
export const wantedApi = {
  list: (fulfilled = false) =>
    request<WantedPost[]>('GET', `/api/wanted?fulfilled=${fulfilled}`),

  create: (token: string, data: Omit<WantedPost, 'id' | 'user_id' | 'user_name' | 'fulfilled' | 'created_at'>) =>
    request<WantedPost>('POST', '/api/wanted', data, token),

  fulfill: (token: string, id: string) =>
    request<WantedPost>('POST', `/api/wanted/${id}/fulfill`, undefined, token),

  delete: (token: string, id: string) =>
    request<void>('DELETE', `/api/wanted/${id}`, undefined, token),

  offers: (postId: string) =>
    request<WantedOffer[]>('GET', `/api/wanted/${postId}/offers`),

  submitOffer: (token: string, postId: string, data: Omit<WantedOffer, 'id' | 'wanted_id' | 'seller_id' | 'seller_name' | 'created_at'>) =>
    request<WantedOffer>('POST', `/api/wanted/${postId}/offers`, data, token),
};

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------
export const reviewsApi = {
  forUser: (userId: string) =>
    request<Review[]>('GET', `/api/reviews/user/${userId}`),

  create: (token: string, data: { reviewed_user_id: string; listing_id: string; rating: number; comment?: string }) =>
    request<Review>('POST', '/api/reviews', data, token),
};

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------
export const reportsApi = {
  submit: (token: string, data: { target_type: string; target_id: string; reason: string }) =>
    request<{ message: string; auto_marked_sold: boolean }>('POST', '/api/reports', data, token),

  list: (token: string, status = 'open') =>
    request<Report[]>('GET', `/api/reports?status=${status}`, undefined, token),

  resolve: (token: string, id: string, status: string) =>
    request<Report>('PATCH', `/api/reports/${id}`, { status }, token),
};

// ---------------------------------------------------------------------------
// Favorites
// ---------------------------------------------------------------------------
export const favoritesApi = {
  list: (token: string) =>
    request<Listing[]>('GET', '/api/favorites', undefined, token),

  check: (token: string, listingId: string) =>
    request<{ is_favorite: boolean }>('GET', `/api/favorites/check/${listingId}`, undefined, token),

  add: (token: string, listingId: string) =>
    request<{ message: string }>('POST', `/api/favorites/${listingId}`, undefined, token),

  remove: (token: string, listingId: string) =>
    request<void>('DELETE', `/api/favorites/${listingId}`, undefined, token),
};

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------
export const adminApi = {
  stats: (token: string) =>
    request<{ users: number; total_listings: number; active_listings: number; open_reports: number; pending_institutes: number }>(
      'GET', '/api/admin/stats', undefined, token
    ),

  users: (token: string) =>
    request<User[]>('GET', '/api/admin/users', undefined, token),

  blockUser: (token: string, userId: string) =>
    request<User>('POST', `/api/admin/users/${userId}/block`, undefined, token),

  verifyUser: (token: string, userId: string) =>
    request<User>('POST', `/api/admin/users/${userId}/verify`, undefined, token),

  pendingInstitutes: (token: string) =>
    request<Institute[]>('GET', '/api/admin/institutes/pending', undefined, token),
};
