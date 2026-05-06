"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  MapPin, Calendar, Heart, MessageSquare, Star, 
  Search, Clock, Bell, Package, ChevronRight
} from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { bookingsService } from "@/services/bookings.service";
import type { Booking } from "@/types";
import { formatDate } from "@/lib/utils";

export default function UserDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const unsub = bookingsService.subscribeToUserBookings(user.uid, (data) => {
      setBookings(data.slice(0, 5)); // Just show recent 5
      setLoading(false);
    });
    
    return () => unsub();
  }, [user]);

  // Amazon Standard Classes
  const linkText = "text-[#007185] hover:text-[#c40000] hover:underline cursor-pointer";
  const cardBase = "bg-white border border-[#d5d9d9] rounded-[8px] p-5 shadow-sm text-[#0f1111]";

  return (
    <AuthGuard allowedRoles={["user"]}>
      {/* Amazon standard light gray background for account pages */}
      <div className="min-h-screen bg-[#eaeded] flex flex-col">
        <SiteHeader />
        
        <main className="flex-grow mx-auto max-w-[1200px] w-full px-4 py-8 sm:px-6 lg:px-8">
          
          {/* WELCOME BANNER (Minimalist Amazon Style) */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-[28px] font-normal tracking-tight text-[#0f1111]">
                Hello, {user?.displayName?.split(' ')[0] || "User"}
              </h1>
              <p className="text-[14px] text-[#565959] mt-1">
                Manage your service bookings, messages, and discover local providers.
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild className="bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] border border-[#fcd200] rounded-[8px] h-[34px] px-6 text-[13px] font-normal shadow-sm transition-colors">
                <Link href="/map">
                  <MapPin className="mr-2 h-4 w-4" /> Open Smart Map
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN: MAIN ACTIONS & RECENT BOOKINGS */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* QUICK ACTIONS (Amazon "Your Account" Grid Style) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: Package, label: "Your Bookings", desc: "Track, return, or buy things again", href: "/bookings" },
                  { icon: Search, label: "Find Services", desc: "Browse the map for local providers", href: "/map" },
                  { icon: MessageSquare, label: "Your Messages", desc: "Communicate with service providers", href: "/chat" },
                  { icon: Heart, label: "Your Favorites", desc: "View and manage your saved providers", href: "/favorites" },
                ].map((action, i) => (
                  <Link href={action.href} key={i} className="block">
                    <div className="bg-white border border-[#d5d9d9] rounded-[8px] p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors h-full cursor-pointer">
                      <div className="mt-1">
                        <action.icon className="h-8 w-8 text-[#007185]" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="text-[16px] font-normal text-[#0f1111] leading-tight mb-1">{action.label}</h3>
                        <p className="text-[13px] text-[#565959] leading-snug">{action.desc}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* RECENT BOOKINGS (Amazon "Your Orders" Style) */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[20px] font-bold text-[#0f1111]">Your Recent Bookings</h2>
                  <Link href="/bookings" className={`${linkText} text-[13px]`}>View all bookings</Link>
                </div>
                
                <div className="space-y-4">
                  {loading ? (
                    <div className="animate-pulse h-32 bg-white border border-[#d5d9d9] rounded-[8px]" />
                  ) : bookings.length > 0 ? (
                    bookings.map(booking => (
                      <div key={booking.id} className="bg-white border border-[#d5d9d9] rounded-[8px] overflow-hidden text-[#0f1111]">
                        {/* Order Header */}
                        <div className="bg-[#f0f2f2] border-b border-[#d5d9d9] px-4 py-3 flex flex-wrap items-center justify-between gap-4 text-[13px]">
                          <div className="flex gap-8">
                            <div>
                              <span className="text-[#565959] uppercase text-[11px] block mb-0.5">Booking Placed</span>
                              <span>{formatDate(booking.date)}</span>
                            </div>
                            <div>
                              <span className="text-[#565959] uppercase text-[11px] block mb-0.5">Scheduled Time</span>
                              <span>{booking.timeSlot}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[#565959] uppercase text-[11px] block mb-0.5">Booking #</span>
                            <span className={linkText}>{booking.id.slice(0, 12)}</span>
                          </div>
                        </div>
                        
                        {/* Order Body */}
                        <div className="p-4 flex flex-col sm:flex-row justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-[60px] w-[60px] rounded-[4px] border border-[#d5d9d9]">
                              <AvatarImage src={booking.providerImage || ""} />
                              <AvatarFallback className="bg-[#f0f2f2] text-[#565959] font-bold">
                                {booking.providerName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <Link href={`/provider/${booking.providerId}`} className={`${linkText} text-[14px] font-bold block mb-1`}>
                                {booking.providerName}
                              </Link>
                              
                              {/* Amazon Status Text */}
                              <div className="text-[13px] font-bold mt-1">
                                {booking.status === "accepted" && <span className="text-[#007600]">Confirmed</span>}
                                {booking.status === "pending" && <span className="text-[#e77600]">Awaiting Confirmation</span>}
                                {booking.status === "rejected" && <span className="text-[#c40000]">Cancelled by Provider</span>}
                                {booking.status === "completed" && <span className="text-[#0f1111]">Service Completed</span>}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2 min-w-[140px]">
                            <Button asChild className="bg-white hover:bg-gray-50 text-[#0f1111] border border-[#d5d9d9] rounded-[8px] h-[31px] text-[13px] font-normal shadow-sm">
                              <Link href={`/bookings/${booking.id}`}>View order details</Link>
                            </Button>
                            {booking.status === "completed" && (
                              <Button className="bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] border border-[#fcd200] rounded-[8px] h-[31px] text-[13px] font-normal shadow-sm">
                                Write a product review
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={cardBase}>
                      <div className="text-center py-6">
                        <div className="text-[16px] text-[#0f1111] mb-2">Looks like you haven't booked any services yet.</div>
                        <Link href="/map" className={linkText}>Start exploring the map to find providers</Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: RECOMMENDATIONS & UPDATES */}
            <div className="space-y-6">
              
              {/* RECOMMENDED FOR YOU (Amazon Product List Style) */}
              <div className={cardBase}>
                <h2 className="text-[16px] font-bold mb-4 border-b border-[#e7e7e7] pb-2">
                  Recommended for you
                </h2>
                <div className="space-y-4">
                  {/* Dummy Recommendations */}
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3">
                      <div className="h-[70px] w-[70px] bg-[#f8f8f8] border border-[#d5d9d9] rounded-[4px] shrink-0" />
                      <div className="flex flex-col">
                        <Link href="#" className={`${linkText} text-[13px] leading-tight line-clamp-2 mb-1`}>
                          Premium Dental Clinic - Dr. Sarah Ahmed (Specialist)
                        </Link>
                        <div className="flex items-center gap-1 mb-1 text-[12px]">
                          <div className="flex">
                            <Star className="h-3.5 w-3.5 fill-[#ffa41c] text-[#ffa41c]" />
                            <Star className="h-3.5 w-3.5 fill-[#ffa41c] text-[#ffa41c]" />
                            <Star className="h-3.5 w-3.5 fill-[#ffa41c] text-[#ffa41c]" />
                            <Star className="h-3.5 w-3.5 fill-[#ffa41c] text-[#ffa41c]" />
                            <Star className="h-3.5 w-3.5 fill-transparent text-[#ffa41c]" />
                          </div>
                          <span className="text-[#007185]">128</span>
                        </div>
                        <div className="text-[12px] text-[#565959]">1.2 km away</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-[#e7e7e7]">
                   <Link href="/map" className={`${linkText} text-[13px]`}>See more recommendations</Link>
                </div>
              </div>

              {/* MESSAGES / NOTIFICATIONS (Amazon System Alert Style) */}
              <div className="bg-white border border-[#d5d9d9] rounded-[8px] overflow-hidden text-[#0f1111] shadow-sm">
                <div className="bg-[#f0f2f2] px-4 py-3 border-b border-[#d5d9d9]">
                  <h2 className="text-[16px] font-bold">Important Messages</h2>
                </div>
                <div className="p-4">
                  <div className="flex gap-3 items-start">
                    <Bell className="h-5 w-5 text-[#e77600] shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-[13px] mb-1">New Smart Map Features</h3>
                      <p className="text-[13px] text-[#565959] leading-snug mb-2">
                        You can now see the real-time location of your provider when they are on their way to you. Ensure your GPS is enabled.
                      </p>
                      <Link href="#" className={linkText}>Learn more</Link>
                    </div>
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