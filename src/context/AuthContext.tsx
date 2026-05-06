"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import {
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, firebaseReady } from "@/lib/firebase/config";
import type { AppRole } from "@/types";

const ADMIN_EMAIL = "mohamedabdouooo28@gmail.com";

function isAdminEmail(email?: string | null) {
  return email?.toLowerCase() === ADMIN_EMAIL;
}

interface AuthContextValue {
  user: User | null;
  role: AppRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
    role: AppRole
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = useCallback(async (uid: string) => {
    if (!firebaseReady) {
      setRole("user");
      return;
    }

    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);

    if (isAdminEmail(auth.currentUser?.email)) {
      await setDoc(
        userRef,
        {
          uid,
          email: auth.currentUser?.email,
          displayName: auth.currentUser?.displayName ?? "Admin",
          avatarUrl: auth.currentUser?.photoURL ?? null,
          role: "admin",
          createdAt: snap.exists() ? snap.data().createdAt ?? serverTimestamp() : serverTimestamp(),
        },
        { merge: true }
      );
      setRole("admin");
      return;
    }

    if (snap.exists()) {
      setRole((snap.data().role as AppRole) ?? "user");
    } else {
      setRole("user");
    }
  }, []);

  useEffect(() => {
    if (!firebaseReady) {
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchRole(firebaseUser.uid);
      } else {
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [fetchRole]);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string,
    selectedRole: AppRole
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    const effectiveRole = isAdminEmail(email) ? "admin" : selectedRole;
    await setDoc(doc(db, "users", cred.user.uid), {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName,
      avatarUrl: null,
      role: effectiveRole,
      createdAt: serverTimestamp(),
    });
    setRole(effectiveRole);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const snap = await getDoc(doc(db, "users", cred.user.uid));
    const effectiveRole = isAdminEmail(cred.user.email) ? "admin" : "user";
    if (!snap.exists()) {
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName ?? "User",
        avatarUrl: cred.user.photoURL,
        role: effectiveRole,
        createdAt: serverTimestamp(),
      });
      setRole(effectiveRole);
    } else {
      setRole(isAdminEmail(cred.user.email) ? "admin" : (snap.data().role as AppRole) ?? "user");
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, role, loading, signIn, signUp, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
