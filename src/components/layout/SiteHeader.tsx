"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  LogOut,
  LayoutDashboard,
  Sun,
  Moon,
  Bell,
  Menu,
  Search,
  ChevronDown,
  User
} from "lucide-react";
import { useState } from "react";

export function SiteHeader() {
  const { user, role, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dashboardPath =
    role === "admin"
      ? "/admin"
      : role === "provider"
      ? "/provider"
      : "/dashboard";

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const isLanding = pathname === "/";

  // Amazon signature hover style for nav items
  const navItemClass = "flex flex-col justify-center px-2 py-1 border border-transparent hover:border-white rounded-[2px] cursor-pointer transition-none text-white";

  return (
    <header className="w-full z-40 bg-[#131921] text-white">
      {/* --- Top Navigation Bar --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between px-2 py-2 md:h-16 gap-2 md:gap-4">
        
        {/* Mobile: Top Row (Menu, Logo, Auth, Bell) */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-1">
            <button 
              className="md:hidden p-2 text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
            
            {/* Logo */}
            <Link href="/" className={`${navItemClass} flex-row items-center gap-1 !py-2 md:!py-1`}>
              <MapPin className="h-6 w-6 text-white" />
              <span className="text-xl font-bold tracking-tight mt-1">
                Servexia
              </span>
            </Link>
          </div>

          {/* Mobile Right Icons */}
          <div className="flex md:hidden items-center gap-2">
            {!user ? (
              <Link href="/login" className="text-sm font-bold flex items-center gap-1">
                Sign in <User className="h-5 w-5" />
              </Link>
            ) : (
              <button onClick={() => router.push(dashboardPath)} className="text-sm flex items-center">
                <User className="h-5 w-5" />
              </button>
            )}
            <button 
              onClick={() => router.push("/notifications")}
              className="relative p-2"
            >
              <Bell className="h-6 w-6 text-white" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#f08804] text-xs font-bold text-black">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Deliver To (Hidden on small mobile) */}
        <div className={`hidden sm:flex ${navItemClass}`}>
          <div className="text-[11px] text-gray-300 ml-4">Deliver to</div>
          <div className="flex items-center font-bold text-[14px] leading-tight">
            <MapPin className="h-4 w-4 mr-1" />
            Egypt
          </div>
        </div>

        {/* --- Search Bar --- */}
        <div className="flex flex-1 h-10 rounded-md overflow-hidden bg-white focus-within:ring-2 focus-within:ring-[#f08804]">
          <select className="hidden md:block bg-gray-100 text-black text-xs px-2 border-r border-gray-300 outline-none hover:bg-gray-200 cursor-pointer">
            <option>All</option>
            <option>Providers</option>
            <option>Categories</option>
          </select>
          <input 
            type="text" 
            placeholder="Search Servexia..." 
            className="flex-1 px-3 text-black text-sm outline-none w-full"
          />
          <button className="bg-[#febd69] hover:bg-[#f3a847] px-3 md:px-4 flex items-center justify-center text-black transition-colors">
            <Search className="h-5 w-5" />
          </button>
        </div>

        {/* --- Desktop Right Actions --- */}
        <div className="hidden md:flex items-center gap-1">
          {/* Theme Toggle (Adapted for Amazon Style) */}
          <div 
            className={`${navItemClass} flex-row items-center !py-2`}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title="Toggle Theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </div>

          {/* Account & Auth */}
          {user ? (
            <div className={`${navItemClass} group relative`}>
              <div className="text-[11px] text-gray-300">Hello, User</div>
              <div className="flex items-center font-bold text-[14px] leading-tight">
                Account & Dashboard
                <ChevronDown className="h-3 w-3 ml-1 text-gray-400 group-hover:text-white" />
              </div>
              
              {/* Dropdown Menu (Hover) */}
              <div className="absolute top-full right-0 mt-1 w-48 bg-white text-black rounded-md shadow-lg hidden group-hover:flex flex-col p-2 z-50">
                 <Button variant="ghost" className="w-full justify-start" onClick={() => router.push(dashboardPath)}>
                    <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
                 </Button>
                 <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" /> Sign Out
                 </Button>
              </div>
            </div>
          ) : (
            <Link href="/login" className={navItemClass}>
              <div className="text-[11px] text-gray-300">Hello, sign in</div>
              <div className="flex items-center font-bold text-[14px] leading-tight">
                Accounts & Lists
                <ChevronDown className="h-3 w-3 ml-1 text-gray-400" />
              </div>
            </Link>
          )}

          {/* Notifications (Amazon Cart Style) */}
          <Link href="/notifications" className={`${navItemClass} flex-row items-end pb-1`}>
            <div className="relative flex items-end">
              <Bell className="h-8 w-8 text-white" />
              <span className="absolute top-0 left-1/2 -translate-x-1/2 font-bold text-[#f08804] text-[13px]">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </div>
            <span className="font-bold text-[14px] mt-auto">Alerts</span>
          </Link>
        </div>
      </div>

      {/* --- Bottom Navigation Bar (Categories & Links) --- */}
      <div className="bg-[#232f3e] px-2 py-1 flex items-center gap-2 overflow-x-auto text-sm font-medium hide-scrollbar">
        <button className="flex items-center gap-1 px-2 py-1 border border-transparent hover:border-white rounded-[2px] text-white whitespace-nowrap">
          <Menu className="h-5 w-5" />
          All
        </button>
        
        {isLanding && (
          <>
            <a href="#how" className="px-2 py-1 border border-transparent hover:border-white rounded-[2px] text-white whitespace-nowrap">
              How it works
            </a>
            <a href="#categories" className="px-2 py-1 border border-transparent hover:border-white rounded-[2px] text-white whitespace-nowrap">
              Categories
            </a>
            <a href="#providers" className="px-2 py-1 border border-transparent hover:border-white rounded-[2px] text-white whitespace-nowrap">
              For Providers
            </a>
            <Link href="/register" className="px-2 py-1 border border-transparent hover:border-white rounded-[2px] text-white whitespace-nowrap">
              Get Started
            </Link>
          </>
        )}
      </div>

      {/* Mobile Sidebar Overlay (Optional Enhancement for Mobile Menu) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-xl flex flex-col z-50 text-black overflow-y-auto">
            <div className="bg-[#232f3e] text-white p-4 flex items-center gap-3 text-lg font-bold">
              <User className="h-7 w-7" />
              {user ? `Hello, User` : "Hello, sign in"}
            </div>
            <div className="p-4 flex flex-col gap-4 text-sm">
              <div className="font-bold text-lg border-b pb-2">Navigation</div>
              <a href="#how" onClick={() => setMobileMenuOpen(false)}>How it works</a>
              <a href="#categories" onClick={() => setMobileMenuOpen(false)}>Categories</a>
              <a href="#providers" onClick={() => setMobileMenuOpen(false)}>For providers</a>
              
              <div className="border-t my-2 pt-4 font-bold text-lg border-b pb-2">Account</div>
              {user ? (
                <>
                  <Link href={dashboardPath} onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                  <button className="text-left text-red-600" onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}>Sign Out</button>
                </>
              ) : (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Sign in</Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}