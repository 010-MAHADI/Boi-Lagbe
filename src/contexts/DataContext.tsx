'use client';

/**
 * DataContext — the app's mutable data layer.
 *
 * Everything the user creates (listings, offers, messages, reports, favorites…)
 * lives here, seeded from `mockData` and persisted to localStorage so it survives
 * navigation and reloads.
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
import {
  mockConversations,
  mockInstitutes,
  mockListings,
  mockMessages,
  mockPriceOffers,
  mockReviews,
  mockUsers,
  mockWantedPosts,
} from '@/lib/mockData';
import { generateId } from '@/lib/utils';

const STORAGE_KEY = 'boi-lagbe-data-v2';
const STORAGE_VERSION = 2;

/** Plan §3.6 — this many distinct buyers reporting "already sold" auto-closes a listing. */
export const AUTO_SOLD_REPORT_THRESHOLD = 3;

interface DataSnapshot {
  version: number;
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
}

function seedSnapshot(): DataSnapshot {
  return JSON.parse(
    JSON.stringify({
      version: STORAGE_VERSION,
      users: mockUsers,
      listings: mockListings,
      institutes: mockInstitutes,
      conversations: mockConversations,
      messages: mockMessages,
      offers: mockPriceOffers,
      wanted: mockWantedPosts,
      wantedOffers: [],
      reviews: mockReviews,
      reports: [],
      favorites: [],
    })
  ) as DataSnapshot;
}

function loadSnapshot(): DataSnapshot {
  if (typeof window === 'undefined') return seedSnapshot();
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as DataSnapshot;
      if (parsed.version === STORAGE_VERSION) {
        return { ...seedSnapshot(), ...parsed };
      }
    }
  } catch {
    // Corrupt or unreadable storage — fall back to seed.
  }
  return seedSnapshot();
}

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
  images: string[];
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
  createListing: (input: CreateListingInput) => Listing;
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
  sendMessage: (
    conversationId: string,
    senderId: string,
    content: string,
    offerAmount?: number
  ) => Message;
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
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DataSnapshot>(seedSnapshot);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setData(loadSnapshot());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Storage full
    }
  }, [data, isLoaded]);

  useEffect(() => {
    mockInstitutes.splice(0, mockInstitutes.length, ...data.institutes);
    mockUsers.splice(0, mockUsers.length, ...data.users);
  }, [data.institutes, data.users]);

  // User Admin Actions
  const toggleBlockUser = useCallback((userId: string) => {
    setData((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === userId ? { ...u, is_blocked: !u.is_blocked } : u)),
    }));
  }, []);

  const toggleVerifyUser = useCallback((userId: string) => {
    setData((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === userId ? { ...u, is_verified: !u.is_verified } : u)),
    }));
  }, []);

  const getListing = useCallback(
    (id: string) => data.listings.find((l) => l.id === id),
    [data.listings]
  );

  const getInstitute = useCallback(
    (id: string) => data.institutes.find((i) => i.id === id),
    [data.institutes]
  );

  const createListing = useCallback((input: CreateListingInput): Listing => {
    const listing: Listing = {
      ...input,
      id: `listing-${generateId()}`,
      status: 'active',
      view_count: 0,
      created_at: new Date().toISOString(),
    };
    setData((prev) => ({ ...prev, listings: [listing, ...prev.listings] }));
    return listing;
  }, []);

  const markListingSold = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      listings: prev.listings.map((l) => (l.id === id ? { ...l, status: 'sold' } : l)),
    }));
  }, []);

  const deleteListing = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      listings: prev.listings.filter((l) => l.id !== id),
      favorites: prev.favorites.filter((f) => f.listing_id !== id),
    }));
  }, []);

  const registerView = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      listings: prev.listings.map((l) =>
        l.id === id ? { ...l, view_count: l.view_count + 1 } : l
      ),
    }));
  }, []);

  const createInstitute = useCallback((input: CreateInstituteInput): Institute => {
    const institute: Institute = {
      ...input,
      id: `inst-${generateId()}`,
      verified: input.verified ?? false,
      created_at: new Date().toISOString(),
    };
    setData((prev) => ({ ...prev, institutes: [institute, ...prev.institutes] }));
    return institute;
  }, []);

  const updateInstitute = useCallback((institute: Institute) => {
    setData((prev) => ({
      ...prev,
      institutes: prev.institutes.map((i) => (i.id === institute.id ? institute : i)),
    }));
  }, []);

  const approveInstitute = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      institutes: prev.institutes.map((i) => (i.id === id ? { ...i, verified: true } : i)),
    }));
  }, []);

  const rejectInstitute = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      institutes: prev.institutes.filter((i) => i.id !== id),
    }));
  }, []);

  const isFavorite = useCallback(
    (userId: string, listingId: string) =>
      data.favorites.some((f) => f.user_id === userId && f.listing_id === listingId),
    [data.favorites]
  );

  const toggleFavorite = useCallback((userId: string, listingId: string): boolean => {
    let nowFavorite = false;
    setData((prev) => {
      const exists = prev.favorites.some(
        (f) => f.user_id === userId && f.listing_id === listingId
      );
      nowFavorite = !exists;
      return {
        ...prev,
        favorites: exists
          ? prev.favorites.filter((f) => !(f.user_id === userId && f.listing_id === listingId))
          : [...prev.favorites, { user_id: userId, listing_id: listingId }],
      };
    });
    return nowFavorite;
  }, []);

  const favoriteListingsFor = useCallback(
    (userId: string) => {
      const ids = data.favorites.filter((f) => f.user_id === userId).map((f) => f.listing_id);
      return data.listings.filter((l) => ids.includes(l.id));
    },
    [data.favorites, data.listings]
  );

  const offersForListing = useCallback(
    (listingId: string) => data.offers.filter((o) => o.listing_id === listingId),
    [data.offers]
  );

  const submitOffer = useCallback(
    (listingId: string, buyerId: string, price: number): PriceOffer => {
      const offer: PriceOffer = {
        id: `offer-${generateId()}`,
        listing_id: listingId,
        buyer_id: buyerId,
        offered_price: price,
        created_at: new Date().toISOString(),
      };
      setData((prev) => ({
        ...prev,
        offers: [
          ...prev.offers.filter(
            (o) => !(o.listing_id === listingId && o.buyer_id === buyerId)
          ),
          offer,
        ],
      }));
      return offer;
    },
    []
  );

  const conversationsFor = useCallback(
    (userId: string) =>
      data.conversations
        .filter((c) => c.buyer_id === userId || c.seller_id === userId)
        .sort(
          (a, b) =>
            new Date(b.last_message_at ?? b.created_at).getTime() -
            new Date(a.last_message_at ?? a.created_at).getTime()
        ),
    [data.conversations]
  );

  const findOrCreateConversation = useCallback(
    (listing: Listing, buyerId: string): Conversation => {
      const existing = data.conversations.find(
        (c) => c.listing_id === listing.id && c.buyer_id === buyerId
      );
      if (existing) return existing;

      const conversation: Conversation = {
        id: `conv-${generateId()}`,
        listing_id: listing.id,
        buyer_id: buyerId,
        seller_id: listing.seller_id,
        listing_title: listing.title,
        listing_image: listing.images[0],
        unread_count: 0,
        created_at: new Date().toISOString(),
      };
      setData((prev) => ({
        ...prev,
        conversations: [conversation, ...prev.conversations],
        messages: { ...prev.messages, [conversation.id]: [] },
      }));
      return conversation;
    },
    [data.conversations]
  );

  const messagesFor = useCallback(
    (conversationId: string) => data.messages[conversationId] ?? [],
    [data.messages]
  );

  const sendMessage = useCallback(
    (
      conversationId: string,
      senderId: string,
      content: string,
      offerAmount?: number
    ): Message => {
      const now = new Date().toISOString();
      const message: Message = {
        id: `msg-${generateId()}`,
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        created_at: now,
        ...(offerAmount !== undefined ? { is_offer: true, offer_amount: offerAmount } : {}),
      };

      setData((prev) => ({
        ...prev,
        messages: {
          ...prev.messages,
          [conversationId]: [...(prev.messages[conversationId] ?? []), message],
        },
        conversations: prev.conversations.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                last_message: content,
                last_message_at: now,
                unread_count: c.unread_count + 1,
              }
            : c
        ),
      }));
      return message;
    },
    []
  );

  const markConversationRead = useCallback((conversationId: string, userId: string) => {
    const now = new Date().toISOString();
    setData((prev) => ({
      ...prev,
      conversations: prev.conversations.map((c) =>
        c.id === conversationId ? { ...c, unread_count: 0 } : c
      ),
      messages: {
        ...prev.messages,
        [conversationId]: (prev.messages[conversationId] ?? []).map((m) =>
          m.sender_id !== userId && !m.read_at ? { ...m, read_at: now } : m
        ),
      },
    }));
  }, []);

  const createWantedPost = useCallback((input: CreateWantedInput): WantedPost => {
    const post: WantedPost = {
      ...input,
      id: `wanted-${generateId()}`,
      fulfilled: false,
      created_at: new Date().toISOString(),
    };
    setData((prev) => ({ ...prev, wanted: [post, ...prev.wanted] }));
    return post;
  }, []);

  const markWantedFulfilled = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      wanted: prev.wanted.map((w) => (w.id === id ? { ...w, fulfilled: true } : w)),
    }));
  }, []);

  const deleteWantedPost = useCallback((id: string) => {
    setData((prev) => ({ ...prev, wanted: prev.wanted.filter((w) => w.id !== id) }));
  }, []);

  const submitWantedOffer = useCallback((input: CreateWantedOfferInput): WantedOffer => {
    const offer: WantedOffer = {
      ...input,
      id: `woffer-${generateId()}`,
      created_at: new Date().toISOString(),
    };
    setData((prev) => ({ ...prev, wantedOffers: [offer, ...prev.wantedOffers] }));
    return offer;
  }, []);

  const wantedOffersForPost = useCallback(
    (wantedId: string) => data.wantedOffers.filter((o) => o.wanted_id === wantedId),
    [data.wantedOffers]
  );

  const reviewsForUser = useCallback(
    (userId: string) =>
      data.reviews
        .filter((r) => r.reviewed_user_id === userId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [data.reviews]
  );

  const hasReviewed = useCallback(
    (reviewerId: string, listingId: string) =>
      data.reviews.some((r) => r.reviewer_id === reviewerId && r.listing_id === listingId),
    [data.reviews]
  );

  const addReview = useCallback((input: Omit<Review, 'id' | 'created_at'>): Review => {
    const review: Review = {
      ...input,
      id: `review-${generateId()}`,
      created_at: new Date().toISOString(),
    };
    setData((prev) => ({ ...prev, reviews: [review, ...prev.reviews] }));
    return review;
  }, []);

  const reportsForListing = useCallback(
    (listingId: string) =>
      data.reports.filter((r) => r.target_type === 'listing' && r.target_id === listingId),
    [data.reports]
  );

  const submitReport = useCallback(
    (input: Omit<Report, 'id' | 'created_at' | 'status'>) => {
      const report: Report = {
        ...input,
        id: `report-${generateId()}`,
        status: 'open',
        created_at: new Date().toISOString(),
      };

      let autoMarkedSold = false;

      setData((prev) => {
        const reports = [
          ...prev.reports.filter(
            (r) =>
              !(
                r.target_type === report.target_type &&
                r.target_id === report.target_id &&
                r.reporter_id === report.reporter_id &&
                r.reason === report.reason
              )
          ),
          report,
        ];

        let listings = prev.listings;
        if (report.target_type === 'listing' && report.reason === 'already_sold') {
          const target = prev.listings.find((l) => l.id === report.target_id);
          if (target && target.status === 'active') {
            const distinctReporters = new Set(
              reports
                .filter(
                  (r) =>
                    r.target_type === 'listing' &&
                    r.target_id === report.target_id &&
                    r.reason === 'already_sold'
                )
                .map((r) => r.reporter_id)
            );
            if (distinctReporters.size >= AUTO_SOLD_REPORT_THRESHOLD) {
              autoMarkedSold = true;
              listings = prev.listings.map((l) =>
                l.id === report.target_id ? { ...l, status: 'sold' as const } : l
              );
            }
          }
        }

        return { ...prev, reports, listings };
      });

      return { report, autoMarkedSold };
    },
    []
  );

  const resolveReport = useCallback((id: string, status: ReportStatus) => {
    setData((prev) => ({
      ...prev,
      reports: prev.reports.map((r) => (r.id === id ? { ...r, status } : r)),
    }));
  }, []);

  const resetData = useCallback(() => {
    const seed = seedSnapshot();
    setData(seed);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<DataContextType>(
    () => ({
      isLoaded,
      users: data.users,
      listings: data.listings,
      institutes: data.institutes,
      conversations: data.conversations,
      messages: data.messages,
      offers: data.offers,
      wanted: data.wanted,
      wantedOffers: data.wantedOffers,
      reviews: data.reviews,
      reports: data.reports,
      favorites: data.favorites,

      toggleBlockUser,
      toggleVerifyUser,

      getListing,
      createListing,
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
    }),
    [
      isLoaded,
      data,
      toggleBlockUser,
      toggleVerifyUser,
      getListing,
      createListing,
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
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextType {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

export { DataContext };
