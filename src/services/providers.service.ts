import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  setDoc,
  updateDoc,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";
import { db, firebaseReady } from "@/lib/firebase/config";
import type { ProviderProfile, Category } from "@/types";

export const providersService = {
  // Fetch all approved providers
  async getAllProviders(): Promise<ProviderProfile[]> {
    if (!firebaseReady) return [];

    const q = query(
      collection(db, "providers"),
      where("status", "==", "approved")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ProviderProfile));
  },

  // Fetch provider by ID
  async getProviderById(id: string): Promise<ProviderProfile | null> {
    if (!firebaseReady) return null;

    const snap = await getDoc(doc(db, "providers", id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as ProviderProfile;
  },

  // Fetch providers by category
  async getProvidersByCategory(categoryId: string): Promise<ProviderProfile[]> {
    if (!firebaseReady) return [];

    const q = query(
      collection(db, "providers"),
      where("categoryId", "==", categoryId),
      where("status", "==", "approved")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ProviderProfile));
  },

  // Create or update provider profile
  async saveProviderProfile(userId: string, data: Partial<ProviderProfile>): Promise<void> {
    if (!firebaseReady) return;

    const ref = doc(db, "providers", userId);
    const snap = await getDoc(ref);
    
    if (snap.exists()) {
      await updateDoc(ref, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(ref, {
        ...data,
        userId,
        status: "pending",
        averageRating: 0,
        totalReviews: 0,
        totalBookings: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    if (!firebaseReady) return [];

    const snap = await getDocs(collection(db, "categories"));
    return snap.docs
      .map((d) => {
        const data = d.data() as Partial<Category>;
        return {
          id: d.id,
          name: data.name || d.id,
          slug: data.slug || d.id,
          description: data.description || "",
          icon: data.icon || "briefcase",
          active: data.active !== false,
          order: typeof data.order === "number" ? data.order : Number.MAX_SAFE_INTEGER,
        } as Category;
      })
      .filter((category) => category.active)
      .sort((left, right) => left.order - right.order);
  },
};
