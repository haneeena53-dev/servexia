import {
  collection,
  doc,
  getDoc,
  query,
  where,
  addDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db, firebaseReady } from "@/lib/firebase/config";
import type { Booking, BookingStatus } from "@/types";

function toMillis(value: unknown) {
  if (!value) return 0;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  if (typeof value === "object") {
    const candidate = value as { seconds?: number; toDate?: () => Date };
    if (typeof candidate.toDate === "function") return candidate.toDate().getTime();
    if (typeof candidate.seconds === "number") return candidate.seconds * 1000;
  }
  return 0;
}

export const bookingsService = {
  // Create a new booking
  async createBooking(data: Omit<Booking, "id" | "createdAt" | "updatedAt">): Promise<string> {
    if (!firebaseReady) return "";

    const docRef = await addDoc(collection(db, "bookings"), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  // Update booking status
  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<void> {
    if (!firebaseReady) return;

    await updateDoc(doc(db, "bookings", bookingId), {
      status,
      updatedAt: serverTimestamp(),
    });
  },

  // Fetch user bookings with real-time updates
  subscribeToUserBookings(userId: string, callback: (bookings: Booking[]) => void) {
    if (!firebaseReady) {
      callback([]);
      return () => undefined;
    }

    const q = query(
      collection(db, "bookings"),
      where("userId", "==", userId)
    );
    
    return onSnapshot(q, (snap) => {
      const bookings = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Booking))
        .sort((left, right) => toMillis((right as Booking).date) - toMillis((left as Booking).date));
      callback(bookings);
    }, (error) => {
      console.error("[bookingsService] subscribeToUserBookings error:", error.code, error.message);
      callback([]);
    });
  },

  // Fetch provider bookings with real-time updates
  subscribeToProviderBookings(providerId: string, callback: (bookings: Booking[]) => void) {
    if (!firebaseReady) {
      callback([]);
      return () => undefined;
    }

    const q = query(
      collection(db, "bookings"),
      where("providerId", "==", providerId)
    );
    
    return onSnapshot(q, (snap) => {
      const bookings = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Booking))
        .sort((left, right) => toMillis((right as Booking).date) - toMillis((left as Booking).date));
      callback(bookings);
    }, (error) => {
      console.error("[bookingsService] subscribeToProviderBookings error:", error.code, error.message);
      callback([]);
    });
  },

  // Fetch specific booking
  async getBookingById(id: string): Promise<Booking | null> {
    if (!firebaseReady) return null;

    const snap = await getDoc(doc(db, "bookings", id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Booking;
  }
};
