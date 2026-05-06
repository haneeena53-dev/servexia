"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Calendar, MessageSquare, Star, 
  TrendingUp, CheckCircle2, AlertCircle, 
  ArrowRight, Store, Clock
} from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { bookingsService } from "@/services/bookings.service";
import { providersService } from "@/services/providers.service";
import type { Booking, ProviderProfile } from "@/types";
import { formatDate } from "@/lib/utils";

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    
    async function loadData() {
      try {
        const profile = await providersService.getProviderById(uid);
        if (profile) setProvider(profile);
        
        const unsub = bookingsService.subscribeToProviderBookings(uid, (data) => {
          setBookings(data);
          setLoading(false);
        });
        
        return () => unsub();
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    }
    
    loadData();
  }, [user]);

  const pendingBookings = bookings.filter(b => b.status === "pending");
  const upcomingBookings = bookings.filter(b => b.status === "accepted");

  // Amazon Base Card Styling
  const cardBase = "bg-white border border-[#d5d9d9] rounded-[4px] p-5 shadow-sm text-[#0f1111]";
  const linkText = "text-[#007185] hover:text-[#c40000] hover:underline text-[13px] cursor-pointer";

  return (
    <AuthGuard allowedRoles={["provider"]}>
      <div className="min-h-screen bg-[#f2f4f8] flex flex-col">
        <SiteHeader />
        
        {/* Amazon style sub-nav (often used in Seller Central) */}
        <div className="bg-white border-b border-[#d5d9d9] w-full px-4 py-2 sm:px-6 lg:px-8 text-[13px] font-bold text-[#565959] flex gap-6 overflow-x-auto hide-scrollbar">
          <Link href="/provider" className="text-[#0f1111] border-b-2 border-[#e77600] pb-1 whitespace-nowrap">Dashboard</Link>
          <Link href="/provider/bookings-manager" className="hover:text-[#0f1111] hover:border-b-2 hover:border-[#565959] pb-1 transition-colors whitespace-nowrap">Orders (Bookings)</Link>
          <Link href="/provider/profile-editor" className="hover:text-[#0f1111] hover:border-b-2 hover:border-[#565959] pb-1 transition-colors whitespace-nowrap">Storefront Settings</Link>
          <Link href="#" className="hover:text-[#0f1111] hover:border-b-2 hover:border-[#565959] pb-1 transition-colors whitespace-nowrap">Performance</Link>
        </div>

        <main className="flex-grow mx-auto max-w-[1200px] w-full px-4 py-6 sm:px-6 lg:px-8">
          
          {/* Dashboard Header Alerts */}
          {provider?.status === "pending" && (
            <div className="mb-6 p-4 bg-[#fff3cd] border-l-4 border-[#ff9900] text-[#0f1111] flex items-start gap-3 shadow-sm rounded-r-[4px]">
              <AlertCircle className="h-5 w-5 text-[#c40000] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-[14px]">Action Required: Account Verification Pending</h3>
                <p className="text-[13px] text-[#0f1111] mt-1">Your profile is currently under review by our team. Your storefront will remain inactive until verification is complete.</p>
                <div className="mt-2 text-[13px]">
                  <Link href="#" className={linkText}>Check verification status &gt;</Link>
                </div>
              </div>
            </div>
          )}

          {/* STORE BANNER (Utilitarian) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-[#d5d9d9]">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-white border border-[#d5d9d9] rounded-[4px] flex items-center justify-center overflow-hidden relative">
                {provider?.profileImage ? (
                  <Image
                    src={provider.profileImage}
                    alt={provider.businessName || "Provider image"}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <Store className="h-6 w-6 text-[#565959]" />
                )}
              </div>
              <div>
                <h1 className="text-[24px] font-bold tracking-tight text-[#0f1111] leading-tight">
                  {provider?.businessName || "Your Business"}
                </h1>
                <div className="flex items-center gap-2 text-[13px] text-[#565959] mt-1">
                  {provider?.status === "approved" ? (
                    <span className="flex items-center gap-1 text-[#007600] font-bold">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Active Status
                    </span>
                  ) : (
                    <span>Inactive</span>
                  )}
                  <span>|</span>
                  <Link href="/provider/profile-editor" className={linkText}>Edit Storefront</Link>
                </div>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0">
               <Button asChild className="bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] border border-[#fcd200] rounded-[8px] h-[31px] px-4 text-[13px] font-normal shadow-sm transition-colors">
                  <Link href="/provider/bookings-manager">Manage Bookings</Link>
               </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN (Main Content) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Performance Metrics Widget */}
              <div className={cardBase}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-[16px]">Performance Metrics</h2>
                  <Link href="#" className={linkText}>View details &gt;</Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#e7e7e7]">
                  <div className="p-4 sm:p-0 sm:pr-4 flex flex-col items-center sm:items-start">
                    <span className="text-[#565959] text-[12px] mb-1">Total Bookings</span>
                    <span className="text-[#007185] text-[24px] font-light">{provider?.totalBookings || 0}</span>
                  </div>
                  <div className="p-4 sm:p-0 sm:px-4 flex flex-col items-center sm:items-start">
                    <span className="text-[#565959] text-[12px] mb-1">Avg. Rating</span>
                    <span className="text-[#0f1111] text-[24px] font-light flex items-center gap-1">
                      {provider?.averageRating.toFixed(1) || "0.0"} <Star className="h-4 w-4 fill-[#ffa41c] text-[#ffa41c] mb-1" />
                    </span>
                  </div>
                  <div className="p-4 sm:p-0 sm:px-4 flex flex-col items-center sm:items-start">
                    <span className="text-[#565959] text-[12px] mb-1">Total Reviews</span>
                    <span className="text-[#0f1111] text-[24px] font-light">{provider?.totalReviews || 0}</span>
                  </div>
                  <div className="p-4 sm:p-0 sm:pl-4 flex flex-col items-center sm:items-start">
                    <span className="text-[#565959] text-[12px] mb-1">Growth (30d)</span>
                    <span className="text-[#007600] text-[24px] font-light flex items-center gap-1">
                      +12% <TrendingUp className="h-4 w-4 mb-1" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Required: Pending Requests */}
              <div className={cardBase}>
                <div className="flex justify-between items-center mb-4 border-b border-[#e7e7e7] pb-3">
                  <h2 className="font-bold text-[16px] flex items-center gap-2">
                    Pending Booking Requests 
                    {pendingBookings.length > 0 && (
                      <span className="bg-[#c40000] text-white text-[11px] px-2 py-0.5 rounded-[12px] font-bold">
                        {pendingBookings.length}
                      </span>
                    )}
                  </h2>
                  <Link href="/provider/bookings-manager" className={linkText}>View all &gt;</Link>
                </div>
                
                <div className="space-y-0">
                  {loading ? (
                    <div className="animate-pulse h-16 bg-gray-100 rounded" />
                  ) : pendingBookings.length > 0 ? (
                    pendingBookings.slice(0, 3).map((booking, idx) => (
                      <div key={booking.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 ${idx !== 0 ? 'border-t border-[#e7e7e7]' : ''}`}>
                        <div>
                          <div className="text-[14px] font-bold text-[#007185] hover:text-[#c40000] hover:underline cursor-pointer mb-1">
                            {booking.userName}
                          </div>
                          <div className="text-[12px] text-[#565959]">
                            Requested on: {formatDate(booking.date)} at {booking.timeSlot}
                          </div>
                        </div>
                        <div>
                           <Button asChild className="bg-white hover:bg-gray-50 text-[#0f1111] border border-[#d5d9d9] rounded-[8px] h-[28px] px-3 text-[12px] font-normal shadow-sm transition-colors">
                              <Link href="/provider/bookings-manager">Review Request</Link>
                           </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-[#565959] text-[13px]">
                      You have 0 pending booking requests at this time.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (Sidebar Widgets) */}
            <div className="space-y-6">
              
              {/* Upcoming Schedule Widget */}
              <div className={cardBase}>
                <h2 className="font-bold text-[16px] mb-3 border-b border-[#e7e7e7] pb-3">Upcoming Schedule</h2>
                <div className="space-y-0">
                  {upcomingBookings.slice(0, 4).map((booking, idx) => (
                    <div key={booking.id} className={`py-3 flex items-start gap-3 ${idx !== 0 ? 'border-t border-[#e7e7e7]' : ''}`}>
                      <div className="mt-0.5">
                        <Calendar className="h-4 w-4 text-[#565959]" />
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-[#0f1111]">{booking.userName}</div>
                        <div className="text-[12px] text-[#565959]">{booking.timeSlot}</div>
                      </div>
                    </div>
                  ))}
                  {upcomingBookings.length === 0 && (
                    <div className="py-4 text-[#565959] text-[13px]">No scheduled appointments.</div>
                  )}
                </div>
                <div className="mt-2 pt-3 border-t border-[#e7e7e7]">
                   <Link href="/provider/bookings-manager?tab=upcoming" className={linkText}>Manage schedule &gt;</Link>
                </div>
              </div>

              {/* Profile Completion Widget */}
              <div className={cardBase}>
                <h2 className="font-bold text-[16px] mb-3">Storefront Completion</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-[4px] border border-[#e7e7e7] bg-[#fafafa] p-2">
                    <div className="relative h-11 w-11 rounded-[4px] overflow-hidden border border-[#d5d9d9] bg-white flex items-center justify-center">
                      {provider?.profileImage ? (
                        <Image
                          src={provider.profileImage}
                          alt={provider.businessName || "Storefront image"}
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      ) : (
                        <Store className="h-5 w-5 text-[#565959]" />
                      )}
                    </div>
                    <div className="text-[12px] text-[#565959]">
                      {provider?.profileImage ? "Profile image added" : "Add profile image to improve trust"}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[12px] mb-1 text-[#0f1111] font-bold">
                      <span>Completion Score</span>
                      <span>85%</span>
                    </div>
                    {/* Progress Bar (Amazon style - usually thin and solid) */}
                    <div className="h-[6px] w-full bg-[#f0f2f2] rounded-full overflow-hidden border border-[#d5d9d9]">
                      <div className="h-full bg-[#007600] w-[85%]" />
                    </div>
                  </div>
                  
                  <div className="text-[12px] text-[#565959] mt-3">
                    <p className="mb-2">Recommendations to improve visibility:</p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#007600]" /> <span>Basic Information</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#007600]" /> <span>Address Verified</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-3.5 w-3.5 border border-[#565959] rounded-full flex items-center justify-center">
                           <span className="w-1 h-1 bg-transparent"></span>
                        </span>
                        <Link href="#" className={linkText}>Add Service Photos</Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </AuthGuard>
  );
}