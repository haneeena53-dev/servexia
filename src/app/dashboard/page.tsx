"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  MapPin, MessageSquare, Star,
  Bell, Package, ChevronRight, LayoutDashboard,
  Menu, LogOut, Sun, Moon, X
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { bookingsService } from "@/services/bookings.service";
import type { Booking } from "@/types";
import { formatDate } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Package, label: "Bookings", href: "/bookings" },
  { icon: MapPin, label: "Find Services", href: "/map" },
  { icon: MessageSquare, label: "Messages", href: "/chat" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  accepted: { label: "Confirmed", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  pending: { label: "Pending", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  rejected: { label: "Cancelled", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  completed: { label: "Completed", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
};

const quickActions = [
  {
    label: "Book New Service",
    desc: "Find and book local services",
    href: "/map",
    icon: MapPin,
    gradient: "from-[#f97316] to-[#fb923c]",
  },
  {
    label: "Manage Bookings",
    desc: "View and manage your bookings",
    href: "/bookings",
    icon: Package,
    gradient: "from-[#a855f7] to-[#d946ef]",
  },
  {
    label: "Messages",
    desc: "Chat with your providers",
    href: "/chat",
    icon: MessageSquare,
    gradient: "from-[#06b6d4] to-[#38bdf8]",
  },
];

export default function UserDashboard() {
  const { user, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const { theme, setTheme } = useTheme();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user) return;
    const unsub = bookingsService.subscribeToUserBookings(user.uid, (data) => {
      setBookings(data.slice(0, 6));
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <AuthGuard allowedRoles={["user"]}>
      <div className="min-h-screen flex bg-slate-50 dark:bg-[#0d0d18]">

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <aside
          className={`fixed top-0 left-0 h-full w-64 bg-[#0f172a] text-white z-50 flex flex-col transition-transform duration-300
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#f97316] to-[#a855f7] flex items-center justify-center shadow-lg">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Servexia</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto lg:hidden p-1.5 rounded-lg hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto hide-scrollbar">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive
                      ? "bg-gradient-to-r from-[#f97316] to-[#a855f7] text-white shadow-lg shadow-[#f97316]/20"
                      : "text-slate-400 hover:text-white hover:bg-white/10"
                    }`}
                >
                  <item.icon className="h-4.5 w-4.5 flex-shrink-0" strokeWidth={1.75} />
                  {item.label}
                  {item.href === "/notifications" && unreadCount > 0 && (
                    <span className="ml-auto text-xs bg-[#f97316] text-white font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="px-3 py-4 border-t border-white/10 space-y-1">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={user?.photoURL || ""} />
                <AvatarFallback className="bg-gradient-to-br from-[#f97316] to-[#a855f7] text-white text-xs font-bold">
                  {user?.displayName?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.displayName || "User"}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-white/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">

          {/* Top bar */}
          <header className="bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-white/10 px-5 py-3.5 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <Menu className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              </button>
              <h1 className="text-base font-bold text-slate-900 dark:text-white">Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/notifications"
                className="relative p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-[#111827]" />
                )}
              </Link>
              <div className="flex items-center gap-2.5 px-2">
                <Avatar className="h-8 w-8 cursor-pointer" onClick={() => router.push("/dashboard")}>
                  <AvatarImage src={user?.photoURL || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-[#f97316] to-[#a855f7] text-white text-xs font-bold">
                    {user?.displayName?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white leading-none">
                    {user?.displayName?.split(" ")[0] || "User"}
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-5 lg:p-8 space-y-7">

            {/* Welcome header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Hello, {user?.displayName?.split(" ")[0] || "there"}! 👋
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  Here's what's happening with your bookings today.
                </p>
              </div>
              <Button
                asChild
                className="bg-gradient-to-r from-[#f97316] to-[#a855f7] hover:opacity-90 text-white rounded-xl shadow-lg w-fit"
              >
                <Link href="/map">
                  <MapPin className="mr-2 h-4 w-4" /> Open Map
                </Link>
              </Button>
            </div>

            {/* Quick action cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {quickActions.map((card) => (
                <Link key={card.href} href={card.href} className="group block">
                  <div className={`relative bg-gradient-to-br ${card.gradient} rounded-2xl p-5 text-white cursor-pointer group-hover:scale-[1.02] group-hover:shadow-xl transition-all duration-200 shadow-lg`}>
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <card.icon className="h-5 w-5" />
                      </div>
                      <ChevronRight className="h-5 w-5 text-white/60 group-hover:text-white transition-colors" />
                    </div>
                    <p className="font-bold text-base leading-tight mb-1">{card.label}</p>
                    <p className="text-white/75 text-xs">{card.desc}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Recent bookings + sidebar panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Recent bookings */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-sm border border-slate-100 dark:border-white/10 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/10">
                    <h3 className="font-bold text-slate-900 dark:text-white">Recent Bookings</h3>
                    <Link href="/bookings" className="text-sm text-[#f97316] font-medium hover:underline">
                      View all →
                    </Link>
                  </div>

                  {loading ? (
                    <div className="p-5 space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse h-16 bg-slate-100 dark:bg-white/5 rounded-xl" />
                      ))}
                    </div>
                  ) : bookings.length > 0 ? (
                    <div className="divide-y divide-slate-50 dark:divide-white/5">
                      {bookings.map((booking) => {
                        const status = statusConfig[booking.status] ?? {
                          label: booking.status,
                          className: "bg-slate-100 text-slate-600",
                        };
                        return (
                          <div key={booking.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                            <Avatar className="h-10 w-10 rounded-xl border border-slate-200 dark:border-white/10 flex-shrink-0">
                              <AvatarImage src={booking.providerImage || ""} />
                              <AvatarFallback className="bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-sm">
                                {booking.providerName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{booking.providerName}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {formatDate(booking.date)} · {booking.timeSlot}
                              </p>
                            </div>
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${status.className}`}>
                              {status.label}
                            </span>
                            <Link
                              href={`/bookings/${booking.id}`}
                              className="text-slate-300 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex-shrink-0"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="px-5 py-14 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                        <Package className="h-7 w-7 text-slate-300 dark:text-slate-600" />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No bookings yet</p>
                      <Link href="/map" className="text-[#f97316] text-sm font-medium hover:underline mt-2 inline-block">
                        Explore the map →
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Right panel */}
              <div className="space-y-4">
                {/* Recommendations */}
                <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-sm border border-slate-100 dark:border-white/10 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 dark:border-white/10">
                    <h3 className="font-bold text-slate-900 dark:text-white">Recommended</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    {[
                      { name: "Premium Dental Clinic", rating: "4.9", distance: "1.2 km" },
                      { name: "AutoFix Garage", rating: "4.7", distance: "0.8 km" },
                      { name: "HealthHub Pharmacy", rating: "4.8", distance: "2.1 km" },
                    ].map((rec, i) => (
                      <div key={i} className="flex items-start gap-3 group cursor-pointer">
                        <div className={`w-10 h-10 rounded-xl flex-shrink-0 bg-gradient-to-br ${
                          i === 0 ? "from-blue-400 to-cyan-500" :
                          i === 1 ? "from-orange-400 to-amber-500" :
                          "from-green-400 to-emerald-500"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-[#f97316] transition-colors">
                            {rec.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs text-slate-500 dark:text-slate-400">{rec.rating} · {rec.distance}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Link href="/map" className="text-[#f97316] text-sm font-medium hover:underline block pt-1">
                      See all nearby →
                    </Link>
                  </div>
                </div>

                {/* Map CTA card */}
                <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-2xl p-5 text-white border border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-[#f97316]/20 flex items-center justify-center mb-4">
                    <MapPin className="h-5 w-5 text-[#f97316]" />
                  </div>
                  <p className="font-bold text-base mb-1">Explore the Map</p>
                  <p className="text-slate-400 text-xs mb-4 leading-relaxed">
                    Find service providers near you in real-time with smart filters.
                  </p>
                  <Link
                    href="/map"
                    className="block w-full text-center bg-gradient-to-r from-[#f97316] to-[#a855f7] hover:opacity-90 text-white text-sm font-semibold py-2.5 rounded-xl transition-opacity"
                  >
                    Open Map
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
