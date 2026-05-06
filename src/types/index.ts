// ──────────────────────────────────────────────
// Servexia – TypeScript Type Definitions
// ──────────────────────────────────────────────

export type AppRole = "admin" | "provider" | "user";

export type ProviderStatus = "pending" | "approved" | "rejected" | "suspended";
export type BookingStatus = "pending" | "accepted" | "rejected" | "completed" | "cancelled";
export type ReportStatus = "open" | "reviewed" | "resolved";

// ── User ──
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: AppRole;
  createdAt: string;
}

// ── Provider ──
export interface WorkingHours {
  [day: string]: { open: string; close: string } | null;
}

export interface ProviderProfile {
  id: string;
  userId: string;
  businessName: string;
  profession: string;
  description: string;
  profileImage: string | null;
  galleryImages: string[];
  location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
  };
  workingHours: WorkingHours;
  pricing: string | null;
  categoryId: string;
  categoryName?: string;
  status: ProviderStatus;
  averageRating: number;
  totalReviews: number;
  totalBookings: number;
  createdAt: string;
  updatedAt: string;
}

// ── Booking ──
export interface Booking {
  id: string;
  userId: string;
  userName?: string;
  userAvatar?: string | null;
  providerId: string;
  providerName?: string;
  providerImage?: string | null;
  date: string;
  timeSlot: string;
  status: BookingStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ── Chat ──
export interface Chat {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  participantAvatars: Record<string, string | null>;
  bookingId: string | null;
  lastMessage: string;
  lastMessageAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: string;
  seen: boolean;
}

// ── Review ──
export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  providerId: string;
  bookingId: string;
  rating: number;
  text: string;
  verified: boolean;
  flagged: boolean;
  createdAt: string;
}

// ── Category ──
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  active: boolean;
  order: number;
}

// ── Notification ──
export type NotificationType =
  | "booking_update"
  | "new_message"
  | "admin_approval"
  | "new_review"
  | "system";

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  data: Record<string, string>;
  createdAt: string;
}

// ── Report ──
export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  targetId: string;
  targetType: "review" | "provider" | "user";
  reason: string;
  status: ReportStatus;
  createdAt: string;
}

// ── Audit Log ──
export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  timestamp: string;
}

// ── Favorite ──
export interface Favorite {
  id: string;
  userId: string;
  providerId: string;
  provider?: ProviderProfile;
  createdAt: string;
}
