'use client';

/**
 * DataContext — real API-backed data layer.
 *
 * All mutations call the FastAPI backend. State is kept in React for UI
 * reactivity. The localStorage fallback for mock data is completely removed.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import {
  BookCondition,
  CategorySlug,
  Conversation,
  ContactPreference,
  Favorite,
  Institute,
  InstituteType,
  Listing,
  Message,
  PriceOffer,
  Report,
  ReportStatus,
  Review,
  User,
  WantedPost,
  WantedOffer,
} from '@/types';
import { useAuth } from './AuthContext';
import {
  listingsApi,
  institutesApi,
  chatApi,
  wantedApi,
  reviewsApi,
  reportsApi,
  favoritesApi,
  uploadApi,
  adminApi,
} from '@/lib/api';

export const AUTO_SOLD_REPORT_THRESHOLD = 3;

// ---------------------------------------------------------------------------
// Input types (same interface as before so all callers still compile)
// ---------------------------------------------------------------------------
export interface CreateListingInput {
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
  contact_preference: ContactPreference | ContactPreference[];
  whatsapp_number?: string;
  images: string[];  // data: URLs from ImageUploader — converted to R2 keys on submit
  imageFiles?: File[]; // actual File objects when available
  lat: number;
  lng: number;
}

export interface CreateInstituteInput {
  name: string;
  name_en: string;
  type: InstituteType;
  division: string;
  district: string;
  lat: number;
  lng: number;
  created_by?: string;
  verified?: boolean;
}

export interface CreateWantedInput {
  user_id: string;
  user_name: string;
  title: string;
  institute_id?: string;
  institute_name?: string;
  level_label?: string;
  description?: string;
}

export interface CreateWantedOfferInput {
  wanted_id: string;
  seller_id: string;
  seller_name: string;
  seller_avatar?: string;
  condition: BookCondition;
  price: number;
  location: string;
  description?: string;
}

// ---------------------------------------------------------------------------
// Context type
// ---------------------------------------------------------------------------
interface DataContextType {
  isLoaded: boolean;
  users: User[];
  listings: Listing[];
  institutes: Institute[];
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  offers: PriceOffer[];
  wanted: WantedPost[];
  wantedOffers: WantedOffer[];
  reviews: Review[];
  reports: Report[];
  favorites: Favorite[];

  // User Admin Actions
  toggleBlockUser: (userId: string) => void;
  toggleVerifyUser: (userId: string) => void;

  // Listings
  getListing: (id: string) => Listing | undefined;
  createListing: (input: CreateListingInput) => Promise<Listing>;
  updateListing: (id: string, patch: Partial<Listing>) => Promise<void>;
  markListingSold: (id: string) => void;
  deleteListing: (id: string) => void;
  registerView: (id: string) => void;

  // Institutes
  getInstitute: (id: string) => Institute | undefined;
  createInstitute: (input: CreateInstituteInput) => Institute;
  updateInstitute: (institute: Institute) => void;
  approveInstitute: (id: string) => void;
  rejectInstitute: (id: string) => void;

  // Favorites
  isFavorite: (userId: string, listingId: string) => boolean;
  toggleFavorite: (userId: string, listingId: string) => boolean;
  favoriteListingsFor: (userId: string) => Listing[];

  // Price offers
  offersForListing: (listingId: string) => PriceOffer[];
  submitOffer: (listingId: string, buyerId: string, price: number) => PriceOffer;

  // Chat
  conversationsFor: (userId: string) => Conversation[];
  findOrCreateConversation: (listing: Listing, buyerId: string) => Conversation;
  messagesFor: (conversationId: string) => Message[];
  sendMessage: (convId: string, senderId: string, content: string, offerAmount?: number) => Message;
  markConversationRead: (conversationId: string, userId: string) => void;

  // Wanted board & offers
  createWantedPost: (input: CreateWantedInput) => WantedPost;
  markWantedFulfilled: (id: string) => void;
  deleteWantedPost: (id: string) => void;
  submitWantedOffer: (input: CreateWantedOfferInput) => WantedOffer;
  wantedOffersForPost: (wantedId: string) => WantedOffer[];

  // Reviews
  reviewsForUser: (userId: string) => Review[];
  hasReviewed: (reviewerId: string, listingId: string) => boolean;
  addReview: (input: Omit<Review, 'id' | 'created_at'>) => Review;

  // Reports & moderation
  submitReport: (input: Omit<Report, 'id' | 'created_at' | 'status'>) => {
    report: Report;
    autoMarkedSold: boolean;
  };
  resolveReport: (id: string, status: ReportStatus) => void;
  reportsForListing: (listingId: string) => Report[];

  resetData: () => void;

  // Async data refresh
  refreshListings: (filters?: Record<string, string>) => Promise<void>;
  refreshConversations: () => Promise<void>;
  refreshMessages: (convId: string) => Promise<void>;
  refreshWanted: () => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function genId() {
  return Math.random().toString(36).slice(2, 10);
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function DataProvider({ children }: { children: ReactNode }) {
  const { token, user } = useAuth();

  const [isLoaded, setIsLoaded] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [offers, setOffers] = useState<PriceOffer[]>([]);
  const [wanted, setWanted] = useState<WantedPost[]>([]);
  const [wantedOffers, setWantedOffers] = useState<WantedOffer[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  // ---------------------------------------------------------------------------
  // Initial data load
  // ---------------------------------------------------------------------------
  const refreshListings = useCallback(async (filters?: Record<string, string>) => {
    try {
      const qs = new URLSearchParams(filters);
      const data = await listingsApi.search({ sort_by: 'newest', page: 1, page_size: 50, ...filters } as any);
      setListings(data.items as unknown as Listing[]);
    } catch (e) {
      console.warn('Failed to load listings', e);
    }
  }, []);

  const refreshInstitutes = useCallback(async () => {
    try {
      const data = await institutesApi.list();
      setInstitutes(data as unknown as Institute[]);
    } catch (e) {
      console.warn('Failed to load institutes', e);
    }
  }, []);

  const refreshConversations = useCallback(async () => {
    if (!token) return;
    try {
      const data = await chatApi.conversations(token);
      setConversations(data as unknown as Conversation[]);
    } catch (e) {
      console.warn('Failed to load conversations', e);
    }
  }, [token]);

  const refreshMessages = useCallback(async (convId: string) => {
    if (!token) return;
    try {
      const data = await chatApi.messages(token, convId);
      setMessages((prev) => ({ ...prev, [convId]: data as unknown as Message[] }));
    } catch (e) {
      console.warn('Failed to load messages', e);
    }
  }, [token]);

  const refreshWanted = useCallback(async () => {
    try {
      const data = await wantedApi.list(false);
      setWanted(data as unknown as WantedPost[]);
    } catch (e) {
      console.warn('Failed to load wanted', e);
    }
  }, []);

  const refreshFavorites = useCallback(async () => {
    if (!token) return;
    try {
      const data = await favoritesApi.list(token);
      const favItems: Favorite[] = (data as unknown as Listing[]).map((l) => ({
        user_id: user?.id ?? '',
        listing_id: l.id,
      }));
      setFavorites(favItems);
    } catch (e) {
      console.warn('Failed to load favorites', e);
    }
  }, [token, user]);

  const refreshAdminData = useCallback(async () => {
    if (!token || user?.role !== 'admin') return;
    try {
      const usersData = await adminApi.users(token);
      setUsers(usersData);
    } catch (e) {
      console.warn('Failed to load admin users', e);
    }
  }, [token, user]);

  // Initial load
  useEffect(() => {
    Promise.all([
      refreshListings(),
      refreshInstitutes(),
      refreshWanted(),
    ]).then(() => setIsLoaded(true));
  }, [refreshListings, refreshInstitutes, refreshWanted]);

  // Load user-specific data when logged in
  useEffect(() => {
    if (token) {
      refreshConversations();
      refreshFavorites();
      refreshAdminData();
    }
  }, [token, refreshConversations, refreshFavorites, refreshAdminData]);

  // ---------------------------------------------------------------------------
  // Listings
  // ---------------------------------------------------------------------------
  const getListing = useCallback(
    (id: string) => listings.find((l) => l.id === id),
    [listings]
  );

  const createListing = useCallback(async (input: CreateListingInput): Promise<Listing> => {
    if (!token) throw new Error('লগইন করুন');

    // Upload images to R2 if they are File objects
    const imageKeys: string[] = [];
    const publicUrls: string[] = [];

    if (input.imageFiles && input.imageFiles.length > 0) {
      for (const file of input.imageFiles) {
        const { r2_key, public_url } = await uploadApi.uploadFile(token, file);
        imageKeys.push(r2_key);
        publicUrls.push(public_url);
      }
    }
    // If only data: URLs (no File objects), skip R2 — images stored inline (fallback)

    const contact = Array.isArray(input.contact_preference)
      ? input.contact_preference
      : [input.contact_preference];

    const listing = await listingsApi.create(token, {
      category_slug: input.category_slug,
      institute_id: input.institute_id,
      title: input.title,
      author: input.author,
      description_bn: input.description_bn,
      description_en: input.description_en,
      condition: input.condition,
      level_label: input.level_label,
      price: input.price,
      negotiable: input.negotiable,
      quantity: input.quantity,
      contact_preference: contact,
      whatsapp_number: input.whatsapp_number,
      lat: input.lat,
      lng: input.lng,
      image_keys: imageKeys,
    });

    // Attach public URLs for immediate display
    const listingWithImages: Listing = {
      ...(listing as unknown as Listing),
      images: publicUrls.length > 0 ? publicUrls : input.images,
    };

    setListings((prev) => [listingWithImages, ...prev]);
    return listingWithImages;
  }, [token]);

  const updateListing = useCallback(async (id: string, patch: Partial<Listing>): Promise<void> => {
    if (!token) throw new Error('লগইন করুন');
    const updated = await listingsApi.update(token, id, patch);
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, ...(updated as unknown as Listing) } : l)));
  }, [token]);

  const markListingSold = useCallback((id: string) => {
    if (!token) return;
    listingsApi.markSold(token, id).catch(console.warn);
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status: 'sold' as const } : l)));
  }, [token]);

  const deleteListing = useCallback((id: string) => {
    if (!token) return;
    listingsApi.delete(token, id).catch(console.warn);
    setListings((prev) => prev.filter((l) => l.id !== id));
    setFavorites((prev) => prev.filter((f) => f.listing_id !== id));
  }, [token]);

  const registerView = useCallback((_id: string) => {
    // View counts are incremented server-side when GET /listings/:id is called
  }, []);

  // ---------------------------------------------------------------------------
  // Institutes
  // ---------------------------------------------------------------------------
  const getInstitute = useCallback(
    (id: string) => institutes.find((i) => i.id === id),
    [institutes]
  );

  const createInstitute = useCallback((input: CreateInstituteInput): Institute => {
    // Optimistic local insert; server sync happens async
    const tempInstitute: Institute = {
      id: `inst-${genId()}`,
      verified: false,
      created_at: new Date().toISOString(),
      ...input,
    };
    setInstitutes((prev) => [tempInstitute, ...prev]);
    if (token) {
      institutesApi.create(token, input as any).then((created) => {
        setInstitutes((prev) => prev.map((i) => (i.id === tempInstitute.id ? (created as unknown as Institute) : i)));
      }).catch(console.warn);
    }
    return tempInstitute;
  }, [token]);

  const updateInstitute = useCallback((institute: Institute) => {
    setInstitutes((prev) => prev.map((i) => (i.id === institute.id ? institute : i)));
  }, []);

  const approveInstitute = useCallback((id: string) => {
    if (!token) return;
    institutesApi.approve(token, id).catch(console.warn);
    setInstitutes((prev) => prev.map((i) => (i.id === id ? { ...i, verified: true } : i)));
  }, [token]);

  const rejectInstitute = useCallback((id: string) => {
    if (!token) return;
    institutesApi.delete(token, id).catch(console.warn);
    setInstitutes((prev) => prev.filter((i) => i.id !== id));
  }, [token]);

  // ---------------------------------------------------------------------------
  // Favorites
  // ---------------------------------------------------------------------------
  const isFavorite = useCallback(
    (userId: string, listingId: string) =>
      favorites.some((f) => f.user_id === userId && f.listing_id === listingId),
    [favorites]
  );

  const toggleFavorite = useCallback((userId: string, listingId: string): boolean => {
    const exists = favorites.some((f) => f.user_id === userId && f.listing_id === listingId);
    const nowFav = !exists;
    if (token) {
      if (exists) {
        favoritesApi.remove(token, listingId).catch(console.warn);
      } else {
        favoritesApi.add(token, listingId).catch(console.warn);
      }
    }
    setFavorites((prev) =>
      exists
        ? prev.filter((f) => !(f.user_id === userId && f.listing_id === listingId))
        : [...prev, { user_id: userId, listing_id: listingId }]
    );
    return nowFav;
  }, [token, favorites]);

  const favoriteListingsFor = useCallback(
    (userId: string) => {
      const ids = favorites.filter((f) => f.user_id === userId).map((f) => f.listing_id);
      return listings.filter((l) => ids.includes(l.id));
    },
    [favorites, listings]
  );

  // ---------------------------------------------------------------------------
  // Price Offers
  // ---------------------------------------------------------------------------
  const offersForListing = useCallback(
    (listingId: string) => offers.filter((o) => o.listing_id === listingId),
    [offers]
  );

  const submitOffer = useCallback((listingId: string, buyerId: string, price: number): PriceOffer => {
    const offer: PriceOffer = {
      id: `offer-${genId()}`,
      listing_id: listingId,
      buyer_id: buyerId,
      offered_price: price,
      created_at: new Date().toISOString(),
    };
    setOffers((prev) => [
      ...prev.filter((o) => !(o.listing_id === listingId && o.buyer_id === buyerId)),
      offer,
    ]);
    return offer;
  }, []);

  // ---------------------------------------------------------------------------
  // Chat
  // ---------------------------------------------------------------------------
  const conversationsFor = useCallback(
    (userId: string) =>
      conversations
        .filter((c) => c.buyer_id === userId || c.seller_id === userId)
        .sort((a, b) =>
          new Date(b.last_message_at ?? b.created_at).getTime() -
          new Date(a.last_message_at ?? a.created_at).getTime()
        ),
    [conversations]
  );

  const findOrCreateConversation = useCallback(
    (listing: Listing, buyerId: string): Conversation => {
      const existing = conversations.find(
        (c) => c.listing_id === listing.id && c.buyer_id === buyerId
      );
      if (existing) return existing;

      const tempConv: Conversation = {
        id: `conv-${genId()}`,
        listing_id: listing.id,
        buyer_id: buyerId,
        seller_id: listing.seller_id,
        listing_title: listing.title,
        listing_image: Array.isArray(listing.images) ? (listing.images[0] as unknown as string) : undefined,
        unread_count: 0,
        created_at: new Date().toISOString(),
      };
      setConversations((prev) => [tempConv, ...prev]);
      setMessages((prev) => ({ ...prev, [tempConv.id]: [] }));

      // Server-side create async
      if (token) {
        chatApi.startConversationForListing(token, listing.id).then((serverConv) => {
          setConversations((prev) =>
            prev.map((c) => (c.id === tempConv.id ? (serverConv as unknown as Conversation) : c))
          );
        }).catch(console.warn);
      }
      return tempConv;
    },
    [conversations, token]
  );

  const messagesFor = useCallback(
    (convId: string) => messages[convId] ?? [],
    [messages]
  );

  const sendMessage = useCallback(
    (convId: string, senderId: string, content: string, offerAmount?: number): Message => {
      const now = new Date().toISOString();
      const msg: Message = {
        id: `msg-${genId()}`,
        conversation_id: convId,
        sender_id: senderId,
        content,
        created_at: now,
        ...(offerAmount !== undefined ? { is_offer: true, offer_amount: offerAmount } : {}),
      };
      setMessages((prev) => ({
        ...prev,
        [convId]: [...(prev[convId] ?? []), msg],
      }));
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? { ...c, last_message: content, last_message_at: now, unread_count: c.unread_count + 1 }
            : c
        )
      );
      if (token) {
        chatApi.sendMessage(token, convId, content, offerAmount).then((serverMsg) => {
          setMessages((prev) => ({
            ...prev,
            [convId]: (prev[convId] ?? []).map((m) =>
              m.id === msg.id ? (serverMsg as unknown as Message) : m
            ),
          }));
        }).catch(console.warn);
      }
      return msg;
    },
    [token]
  );

  const markConversationRead = useCallback((convId: string, _userId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, unread_count: 0 } : c))
    );
  }, []);

  // ---------------------------------------------------------------------------
  // Wanted
  // ---------------------------------------------------------------------------
  const createWantedPost = useCallback((input: CreateWantedInput): WantedPost => {
    const post: WantedPost = {
      id: `wanted-${genId()}`,
      ...input,
      fulfilled: false,
      created_at: new Date().toISOString(),
    };
    setWanted((prev) => [post, ...prev]);
    if (token) {
      wantedApi.create(token, {
        title: input.title,
        institute_id: input.institute_id,
        level_label: input.level_label,
        description: input.description,
      } as any).then((serverPost) => {
        setWanted((prev) => prev.map((w) => (w.id === post.id ? (serverPost as unknown as WantedPost) : w)));
      }).catch(console.warn);
    }
    return post;
  }, [token]);

  const markWantedFulfilled = useCallback((id: string) => {
    if (token) wantedApi.fulfill(token, id).catch(console.warn);
    setWanted((prev) => prev.map((w) => (w.id === id ? { ...w, fulfilled: true } : w)));
  }, [token]);

  const deleteWantedPost = useCallback((id: string) => {
    if (token) wantedApi.delete(token, id).catch(console.warn);
    setWanted((prev) => prev.filter((w) => w.id !== id));
  }, [token]);

  const submitWantedOffer = useCallback((input: CreateWantedOfferInput): WantedOffer => {
    const offer: WantedOffer = {
      id: `woffer-${genId()}`,
      wanted_id: input.wanted_id,
      seller_id: input.seller_id,
      seller_name: input.seller_name,
      seller_avatar: input.seller_avatar,
      condition: input.condition,
      price: input.price,
      location: input.location,
      description: input.description,
      created_at: new Date().toISOString(),
    };
    setWantedOffers((prev) => [offer, ...prev]);
    if (token) {
      wantedApi.submitOffer(token, input.wanted_id, {
        condition: input.condition,
        price: input.price,
        location: input.location,
        description: input.description,
      } as any).catch(console.warn);
    }
    return offer;
  }, [token]);

  const wantedOffersForPost = useCallback(
    (wantedId: string) => wantedOffers.filter((o) => o.wanted_id === wantedId),
    [wantedOffers]
  );

  // ---------------------------------------------------------------------------
  // Reviews
  // ---------------------------------------------------------------------------
  const reviewsForUser = useCallback(
    (userId: string) =>
      reviews
        .filter((r) => r.reviewed_user_id === userId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [reviews]
  );

  const hasReviewed = useCallback(
    (reviewerId: string, listingId: string) =>
      reviews.some((r) => r.reviewer_id === reviewerId && r.listing_id === listingId),
    [reviews]
  );

  const addReview = useCallback((input: Omit<Review, 'id' | 'created_at'>): Review => {
    const review: Review = {
      ...input,
      id: `review-${genId()}`,
      created_at: new Date().toISOString(),
    };
    setReviews((prev) => [review, ...prev]);
    if (token) {
      reviewsApi.create(token, {
        reviewed_user_id: input.reviewed_user_id,
        listing_id: input.listing_id,
        rating: input.rating,
        comment: input.comment,
      }).catch(console.warn);
    }
    return review;
  }, [token]);

  // ---------------------------------------------------------------------------
  // Reports
  // ---------------------------------------------------------------------------
  const reportsForListing = useCallback(
    (listingId: string) =>
      reports.filter((r) => r.target_type === 'listing' && r.target_id === listingId),
    [reports]
  );

  const submitReport = useCallback(
    (input: Omit<Report, 'id' | 'created_at' | 'status'>) => {
      const report: Report = {
        ...input,
        id: `report-${genId()}`,
        status: 'open',
        created_at: new Date().toISOString(),
      };
      setReports((prev) => [report, ...prev]);

      let autoMarkedSold = false;
      if (input.target_type === 'listing' && input.reason === 'already_sold') {
        const distinctReporters = new Set(
          [...reports, report]
            .filter((r) => r.target_type === 'listing' && r.target_id === input.target_id && r.reason === 'already_sold')
            .map((r) => r.reporter_id)
        );
        if (distinctReporters.size >= AUTO_SOLD_REPORT_THRESHOLD) {
          autoMarkedSold = true;
          setListings((prev) =>
            prev.map((l) => (l.id === input.target_id ? { ...l, status: 'sold' as const } : l))
          );
        }
      }

      if (token) {
        reportsApi.submit(token, {
          target_type: input.target_type,
          target_id: input.target_id,
          reason: input.reason,
        }).catch(console.warn);
      }

      return { report, autoMarkedSold };
    },
    [token, reports]
  );

  const resolveReport = useCallback((id: string, status: ReportStatus) => {
    if (token) reportsApi.resolve(token, id, status).catch(console.warn);
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }, [token]);

  // ---------------------------------------------------------------------------
  // Admin
  // ---------------------------------------------------------------------------
  const toggleBlockUser = useCallback((userId: string) => {
    if (!token) return;
    adminApi.blockUser(token, userId).then((updated) => {
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    }).catch(console.warn);
  }, [token]);

  const toggleVerifyUser = useCallback((userId: string) => {
    if (!token) return;
    adminApi.verifyUser(token, userId).then((updated) => {
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    }).catch(console.warn);
  }, [token]);

  const resetData = useCallback(() => {
    setListings([]);
    setConversations([]);
    setMessages({});
    setOffers([]);
    setWanted([]);
    setWantedOffers([]);
    setReviews([]);
    setReports([]);
    setFavorites([]);
  }, []);

  // ---------------------------------------------------------------------------
  // Context value
  // ---------------------------------------------------------------------------
  const value = useMemo<DataContextType>(
    () => ({
      isLoaded,
      users,
      listings,
      institutes,
      conversations,
      messages,
      offers,
      wanted,
      wantedOffers,
      reviews,
      reports,
      favorites,

      toggleBlockUser,
      toggleVerifyUser,

      getListing,
      createListing,
      updateListing,
      markListingSold,
      deleteListing,
      registerView,

      getInstitute,
      createInstitute,
      updateInstitute,
      approveInstitute,
      rejectInstitute,

      isFavorite,
      toggleFavorite,
      favoriteListingsFor,

      offersForListing,
      submitOffer,

      conversationsFor,
      findOrCreateConversation,
      messagesFor,
      sendMessage,
      markConversationRead,

      createWantedPost,
      markWantedFulfilled,
      deleteWantedPost,
      submitWantedOffer,
      wantedOffersForPost,

      reviewsForUser,
      hasReviewed,
      addReview,

      submitReport,
      resolveReport,
      reportsForListing,

      resetData,
      refreshListings,
      refreshConversations,
      refreshMessages,
      refreshWanted,
      refreshFavorites,
    }),
    [
      isLoaded, users, listings, institutes, conversations, messages, offers,
      wanted, wantedOffers, reviews, reports, favorites,
      toggleBlockUser, toggleVerifyUser,
      getListing, createListing, updateListing, markListingSold, deleteListing, registerView,
      getInstitute, createInstitute, updateInstitute, approveInstitute, rejectInstitute,
      isFavorite, toggleFavorite, favoriteListingsFor,
      offersForListing, submitOffer,
      conversationsFor, findOrCreateConversation, messagesFor, sendMessage, markConversationRead,
      createWantedPost, markWantedFulfilled, deleteWantedPost, submitWantedOffer, wantedOffersForPost,
      reviewsForUser, hasReviewed, addReview,
      submitReport, resolveReport, reportsForListing,
      resetData, refreshListings, refreshConversations, refreshMessages, refreshWanted, refreshFavorites,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextType {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
}

export { DataContext };
