"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { Toaster } from "sonner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            className: "bg-card text-card-foreground border-border shadow-card",
          }}
        />
      </NotificationProvider>
    </AuthProvider>
  );
}
