"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Calendar, MapPin, Clock,
  Search, Filter, Star
} from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { bookingsService } from "@/services/bookings.service";
import type { Booking } from "@/types";
import { formatDate } from "@/lib/utils";

export default function BookingsPage() {
  const { user, role } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const subscribe = role === "provider"
      ? bookingsService.subscribeToProviderBookings(user.uid, (data) => {
          setBookings(data);
          setLoading(false);
        })
      : bookingsService.subscribeToUserBookings(user.uid, (data) => {
          setBookings(data);
          setLoading(false);
        });

    const unsub = subscribe;
    return () => unsub();
  }, [user, role]);

  const upcoming = bookings.filter(b => b.status === "pending" || b.status === "accepted");
  const completed = bookings.filter(b => b.status === "completed");
  const cancelled = bookings.filter(b => b.status === "rejected");

  // Amazon Standard Classes
  const linkText = "text-[#007185] hover:text-[#c40000] hover:underline cursor-pointer";
  const cardBase = "bg-white border border-[#d5d9d9] rounded-[8px] overflow-hidden text-[#0f1111]";
  const btnSecondary = "bg-white hover:bg-gray-50 text-[#0f1111] border border-[#d5d9d9] rounded-[8px] h-[31px] px-4 text-[13px] font-normal shadow-sm transition-colors";
  const btnPrimary = "bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] border border-[#fcd200] rounded-[8px] h-[31px] px-4 text-[13px] font-normal shadow-sm transition-colors";
  const isProviderView = role === "provider";

  const BookingList = ({ items }: { items: Booking[] }) => (
    <div className="space-y-4">
      {items.length > 0 ? (
        items.map(b => (
          <div key={b.id} className={cardBase}>
            {/* Header like Amazon Orders */}
            <div className="bg-[#f0f2f2] border-b border-[#d5d9d9] px-4 py-3 flex flex-wrap items-center justify-between gap-4 text-[13px]">
              <div className="flex gap-8">
                <div>
                  <span className="text-[#565959] uppercase text-[11px] block mb-0.5">Booking Placed</span>
                  <span>{formatDate(b.date)}</span>
                </div>
                <div>
                  <span className="text-[#565959] uppercase text-[11px] block mb-0.5">Time Slot</span>
                  <span>{b.timeSlot}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[#565959] uppercase text-[11px] block mb-0.5">Booking #</span>
                <span className={linkText}>{b.id.slice(0, 12)}</span>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col sm:flex-row justify-between gap-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-[60px] w-[60px] rounded-[4px] border border-[#d5d9d9]">
                  <AvatarImage src={isProviderView ? (b.userAvatar || "") : (b.providerImage || "")} />
                  <AvatarFallback className="bg-[#f0f2f2] text-[#565959] font-bold">
                    {(isProviderView ? b.userName : b.providerName)?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  {isProviderView ? (
                    <div className={`${linkText} text-[14px] font-bold block mb-1`}>
                      {b.userName}
                    </div>
                  ) : (
                    <Link href={`/providers/${b.providerId}`} className={`${linkText} text-[14px] font-bold block mb-1`}>
                      {b.providerName}
                    </Link>
                  )}
                  <div className="text-[13px] text-[#565959]">
                    {isProviderView ? `Service: ${b.providerName}` : `Customer: ${b.userName}`}
                  </div>
                  <div className="text-[13px] font-bold mt-1">
                    {b.status === "accepted" && <span className="text-[#007600]">Confirmed</span>}
                    {b.status === "pending" && <span className="text-[#e77600]">Awaiting Confirmation</span>}
                    {b.status === "rejected" && <span className="text-[#c40000]">Cancelled</span>}
                    {b.status === "completed" && <span className="text-[#0f1111]">Service Completed</span>}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 min-w-[150px]">
                <Button asChild className={btnPrimary}>
                  <Link href={`/bookings/${b.id}`}>Manage Booking</Link>
                </Button>
                <Button asChild className={btnSecondary}>
                  <Link href={`/chat/${b.id}`}>{isProviderView ? "Contact Customer" : "Contact Provider"}</Link>
                </Button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white border border-[#d5d9d9] rounded-[8px] p-12 text-center text-[#565959]">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="text-[14px]">No bookings found in this category.</p>
        </div>
      )}
    </div>
  );

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#eaeded] flex flex-col">
        <SiteHeader />
        
        <main className="flex-grow mx-auto max-w-[1000px] w-full px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-[28px] font-normal text-[#0f1111]">
                {isProviderView ? "Bookings Received" : "Your Bookings"}
              </h1>
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#565959]" />
                <Input 
                  placeholder="Search bookings..." 
                  className="pl-10 h-[34px] w-64 border-[#a6a6a6] rounded-[4px] focus-visible:ring-0 focus-visible:outline-none focus-visible:border-[#e77600] focus-visible:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] text-[13px]" 
                />
              </div>
              <Button className="bg-white hover:bg-gray-50 text-[#0f1111] border border-[#d5d9d9] rounded-[4px] h-[34px] px-3 shadow-sm">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="flex border-b border-[#d5d9d9] w-full bg-transparent p-0 mb-6 h-auto">
              <TabsTrigger 
                value="upcoming" 
                className="px-4 py-3 text-[14px] font-bold text-[#565959] data-[state=active]:text-[#0f1111] data-[state=active]:border-b-[3px] data-[state=active]:border-[#e77600] rounded-none bg-transparent hover:bg-gray-50 shadow-none data-[state=active]:shadow-none"
              >
                {isProviderView ? `Accepted (${upcoming.length})` : `Upcoming (${upcoming.length})`}
              </TabsTrigger>
              <TabsTrigger 
                value="completed" 
                className="px-4 py-3 text-[14px] font-bold text-[#565959] data-[state=active]:text-[#0f1111] data-[state=active]:border-b-[3px] data-[state=active]:border-[#e77600] rounded-none bg-transparent hover:bg-gray-50 shadow-none data-[state=active]:shadow-none"
              >
                Completed
              </TabsTrigger>
              <TabsTrigger 
                value="cancelled" 
                className="px-4 py-3 text-[14px] font-bold text-[#565959] data-[state=active]:text-[#0f1111] data-[state=active]:border-b-[3px] data-[state=active]:border-[#e77600] rounded-none bg-transparent hover:bg-gray-50 shadow-none data-[state=active]:shadow-none"
              >
                Cancelled
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming" className="mt-0">
              <BookingList items={upcoming} />
            </TabsContent>
            
            <TabsContent value="completed" className="mt-0">
              <BookingList items={completed} />
            </TabsContent>
            
            <TabsContent value="cancelled" className="mt-0">
              <BookingList items={cancelled} />
            </TabsContent>
          </Tabs>
        </main>
        
        <Footer />
      </div>
    </AuthGuard>
  );
}
