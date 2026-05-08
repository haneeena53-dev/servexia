"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { Button } from "@/components/ui/button";
import {
  MapPin, LogOut, LayoutDashboard, Sun, Moon, Bell,
  Menu, Search, ChevronDown, User, X
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function SiteHeader() {
  const { user, role, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dashboardPath =
    role === "admin" ? "/admin" : role === "provider" ? "/provider" : "/dashboard";

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const isLanding = pathname === "/";

  const navLinks = isLanding
    ? [
        { label: "How it works", href: "#how" },
        { label: "Categories", href: "#categories" },
        { label: "For Providers", href: "#providers" },
        { label: "Get Started", href: "/register" },
      ]
    : [];

  return (
    <header className="w-full z-40 bg-[oklch(0.48_0.14_195)] text-white shadow-sm">
      {/* Main nav bar */}
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-4">

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center shadow-md">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Servexia</span>
          </Link>

          {/* Search bar */}
          <div className="flex-1 hidden sm:flex max-w-xl mx-4 h-10 rounded-xl overflow-hidden bg-white/15 focus-within:bg-white/25 focus-within:ring-2 focus-within:ring-accent/60 transition-all">
            <input
              type="text"
              placeholder="Search Servexia..."
              className="flex-1 px-4 bg-transparent outline-none text-sm placeholder:text-white/60 text-white"
            />
            <button className="bg-[oklch(0.72_0.18_55)] hover:bg-[oklch(0.65_0.18_55)] px-4 flex items-center justify-center transition-colors">
              <Search className="h-4 w-4 text-white" />
            </button>
          </div>

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center gap-1 ml-auto">
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2.5 rounded-xl hover:bg-white/10 transition-colors"
              title="Toggle theme"
            >
              {theme === "dark"
                ? <Sun className="h-5 w-5" />
                : <Moon className="h-5 w-5" />
              }
            </button>

            {/* Notifications */}
            <Link
              href="/notifications"
              className="relative p-2.5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            {/* User account */}
            {user ? (
              <div className="group relative">
                <button className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user.photoURL || ""} />
                    <AvatarFallback className="bg-accent text-white text-xs font-bold">
                      {user.displayName?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden lg:block">
                    {user.displayName?.split(" ")[0] || "Account"}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </button>
                <div className="absolute top-full right-0 mt-2 w-52 bg-white dark:bg-card text-foreground rounded-2xl shadow-xl border border-border hidden group-hover:flex flex-col p-2 z-50">
                  <div className="px-3 py-2 mb-1 border-b border-border">
                    <p className="text-sm font-semibold truncate">{user.displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <Button variant="ghost" className="w-full justify-start rounded-xl" onClick={() => router.push(dashboardPath)}>
                    <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
                  </Button>
                  <Button variant="ghost" className="w-full justify-start rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" /> Sign Out
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link href="/login">
                  <Button variant="ghost" className="text-primary-foreground hover:bg-white/10 rounded-xl">
                    Sign in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-[oklch(0.72_0.18_55)] hover:bg-[oklch(0.65_0.18_55)] text-white rounded-xl shadow-md border-0">
                    Get started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile right icons */}
          <div className="flex md:hidden items-center gap-1 ml-auto">
            <Link href="/notifications" className="relative p-2.5 rounded-xl hover:bg-white/10">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
              )}
            </Link>
            {user ? (
              <button onClick={() => router.push(dashboardPath)} className="p-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user.photoURL || ""} />
                  <AvatarFallback className="bg-accent text-white text-xs font-bold">
                    {user.displayName?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
              </button>
            ) : (
              <Link href="/login" className="text-sm font-semibold px-3">Sign in</Link>
            )}
          </div>
        </div>
      </div>

      {/* Bottom nav links (landing only) */}
      {isLanding && navLinks.length > 0 && (
        <div className="bg-[oklch(0.38_0.12_195)]">
          <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 h-9 overflow-x-auto hide-scrollbar">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-3 py-1 text-sm text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-72 max-w-[85vw] bg-[#0f172a] h-full shadow-2xl flex flex-col z-50 text-white overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold">Servexia</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-xl hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>

            {user && (
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.photoURL || ""} />
                  <AvatarFallback className="bg-accent text-white font-bold">
                    {user.displayName?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{user.displayName}</p>
                  <p className="text-xs text-white/60">{user.email}</p>
                </div>
              </div>
            )}

            <nav className="flex-1 p-4 space-y-1">
              {isLanding && (
                <>
                  <p className="text-xs text-white/40 font-semibold uppercase tracking-wider px-3 mb-2">Navigation</p>
                  {navLinks.map((link) => (
                    <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center px-3 py-2.5 rounded-xl text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                      {link.label}
                    </a>
                  ))}
                  <div className="my-3 border-t border-white/10" />
                </>
              )}
              <p className="text-xs text-white/40 font-semibold uppercase tracking-wider px-3 mb-2">Account</p>
              {user ? (
                <>
                  <button onClick={() => { router.push(dashboardPath); setMobileMenuOpen(false); }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </button>
                  <button onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-white/10 transition-colors">
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                    <User className="h-4 w-4" /> Sign in
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-accent font-semibold hover:bg-white/10 transition-colors">
                    Get started →
                  </Link>
                </>
              )}
            </nav>

            <div className="p-4 border-t border-white/10">
              <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
