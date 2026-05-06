"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect, ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { AppRole } from "@/types";

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles?: AppRole[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in, redirect to login with return path
        router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
      } else if (allowedRoles && role && !allowedRoles.includes(role)) {
        // Logged in but not authorized for this route
        if (role === "admin") router.push("/admin");
        else if (role === "provider") router.push("/provider");
        else router.push("/dashboard");
      }
    }
  }, [user, role, loading, allowedRoles, router, pathname]);

  if (loading || !user || (allowedRoles && role && !allowedRoles.includes(role))) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
