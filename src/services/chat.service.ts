import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  writeBatch,
  setDoc,
} from "firebase/firestore";
import { db, firebaseReady } from "@/lib/firebase/config";
import type { Chat, Message } from "@/types";

export const chatService = {
  // Create or get a chat room between two users
  async getOrCreateChat(
    participantIds: string[],
    participantData: Record<string, { name: string; avatar: string | null }>,
    bookingId: string | null = null
  ): Promise<string> {
    if (!firebaseReady) return "";

    // Sort IDs to ensure consistent chat room ID
    const sortedIds = [...participantIds].sort();
    const chatId = sortedIds.join("_");
    
    const chatRef = doc(db, "chats", chatId);
    const snap = await getDoc(chatRef);
    
    if (!snap.exists()) {
      const names: Record<string, string> = {};
      const avatars: Record<string, string | null> = {};
      
      participantIds.forEach(id => {
        names[id] = participantData[id].name;
        avatars[id] = participantData[id].avatar;
      });

      await setDoc(chatRef, {
        participants: sortedIds,
        participantNames: names,
        participantAvatars: avatars,
        bookingId,
        lastMessage: "No messages yet",
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    
    return chatId;
  },

  // Send a message
  async sendMessage(chatId: string, senderId: string, text: string): Promise<void> {
    if (!firebaseReady) return;

    const batch = writeBatch(db);
    
    const messageRef = doc(collection(db, `chats/${chatId}/messages`));
    batch.set(messageRef, {
      senderId,
      text,
      timestamp: serverTimestamp(),
      seen: false,
    });
    
    const chatRef = doc(db, "chats", chatId);
    batch.update(chatRef, {
      lastMessage: text,
      lastMessageAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    await batch.commit();
  },

  // Subscribe to chat list
  subscribeToChats(userId: string, callback: (chats: Chat[]) => void) {
    if (!firebaseReady) {
      callback([]);
      return () => undefined;
    }

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", userId),
      orderBy("updatedAt", "desc")
    );
    
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Chat)));
    });
  },

  // Subscribe to messages in a chat
  subscribeToMessages(chatId: string, callback: (messages: Message[]) => void) {
    if (!firebaseReady) {
      callback([]);
      return () => undefined;
    }

    const q = query(
      collection(db, `chats/${chatId}/messages`),
      orderBy("timestamp", "asc")
    );
    
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
    });
  },

  // Mark messages as seen
  async markAsSeen(chatId: string, userId: string): Promise<void> {
    if (!firebaseReady) return;

    const q = query(
      collection(db, `chats/${chatId}/messages`),
      where("senderId", "!=", userId),
      where("seen", "==", false)
    );
    
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    
    snap.docs.forEach(d => {
      batch.update(d.ref, { seen: true });
    });
    
    await batch.commit();
  }
};
