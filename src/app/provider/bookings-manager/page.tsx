"use client";

import { useState, useEffect } from "react";
import { 
  Calendar, Clock, CheckCircle2, XCircle, 
  ChevronRight, MessageSquare, User, Filter,
  Search, ArrowLeft, Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // أضفت الـ Link عشان كان ناقص
import { SiteHeader } from "@/components/layout/SiteHeader";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { bookingsService } from "@/services/bookings.service";
import type { Booking } from "@/types";
import { cn, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function ProviderBookingsManager() {
  const { user } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = bookingsService.subscribeToProviderBookings(user.uid, (data) => {
      setBookings(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const handleStatusUpdate = async (bookingId: string, status: any) => {
    try {
      await bookingsService.updateBookingStatus(bookingId, status);
      toast.success(`Booking ${status} successfully`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update booking status");
    }
  };

  const pending = bookings.filter(b => b.status === "pending");
  const upcoming = bookings.filter(b => b.status === "accepted");
  const history = bookings.filter(b => b.status === "completed" || b.status === "rejected");

  // Amazon Standard Classes
  const btnPrimary = "bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] border border-[#fcd200] rounded-[8px] h-[31px] px-4 text-[13px] font-normal shadow-sm transition-colors";
  const btnSecondary = "bg-white hover:bg-gray-50 text-[#0f1111] border border-[#d5d9d9] rounded-[8px] h-[31px] px-4 text-[13px] font-normal shadow-sm transition-colors";

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <div className="bg-white border border-[#d5d9d9] rounded-[8px] overflow-hidden shadow-sm mb-4 text-[#0f1111]">
      {/* Card Header (Amazon style grey header for orders) */}
      <div className="bg-[#f2f4f8] border-b border-[#d5d9d9] px-5 py-3 flex flex-wrap items-center justify-between gap-4 text-[13px]">
        <div className="flex flex-wrap gap-8">
          <div>
            <span className="text-[#565959] uppercase block text-[11px] font-bold mb-0.5">Booking Date</span>
            <span>{formatDate(booking.date)}</span>
          </div>
          <div>
            <span className="text-[#565959] uppercase block text-[11px] font-bold mb-0.5">Time</span>
            <span>{booking.timeSlot}</span>
          </div>
          <div>
            <span className="text-[#565959] uppercase block text-[11px] font-bold mb-0.5">Booking ID</span>
            <span className="text-[#0f1111] uppercase">{booking.id.slice(0, 10)}...</span>
          </div>
        </div>
        <div>
          {/* Status Badge in Header */}
          {booking.status === "completed" && <span className="text-[#007600] font-bold flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Completed</span>}
          {booking.status === "rejected" && <span className="text-[#c40000] font-bold flex items-center gap-1"><XCircle className="h-4 w-4" /> Rejected</span>}
          {booking.status === "accepted" && <span className="text-[#e77600] font-bold">Upcoming</span>}
          {booking.status === "pending" && <span className="text-[#0f1111] font-bold">Action Required</span>}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col md:flex-row justify-between gap-6">
        
        {/* Customer Info */}
        <div className="flex gap-4">
          <Avatar className="h-[60px] w-[60px] rounded-[4px] border border-[#d5d9d9]">
            <AvatarImage src={booking.userAvatar || ""} />
            <AvatarFallback className="bg-[#f0f2f2] text-[#565959] font-bold text-lg rounded-[4px]">
              {booking.userName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-bold text-[16px] text-[#007185] hover:text-[#c40000] hover:underline cursor-pointer mb-1">
              {booking.userName}
            </h3>
            {booking.notes ? (
              <div className="text-[13px] text-[#0f1111] mt-2">
                <span className="font-bold">Customer Notes: </span>
                &quot;{booking.notes}&quot;
              </div>
            ) : (
              <div className="text-[13px] text-[#565959] mt-2 italic">
                No additional notes provided.
              </div>
            )}
          </div>
        </div>

        {/* Actions (Vertical stack on right side like Amazon Order Actions) */}
        <div className="flex flex-col gap-2 min-w-[150px] border-t md:border-t-0 md:border-l border-[#e7e7e7] pt-4 md:pt-0 md:pl-6">
          {booking.status === "pending" ? (
            <>
              <Button className={btnPrimary} onClick={() => handleStatusUpdate(booking.id, "accepted")}>
                Accept Request
              </Button>
              <Button className={btnSecondary} onClick={() => handleStatusUpdate(booking.id, "rejected")}>
                Reject
              </Button>
            </>
          ) : booking.status === "accepted" ? (
            <>
              <Button className={btnPrimary} onClick={() => handleStatusUpdate(booking.id, "completed")}>
                Mark as Complete
              </Button>
              <Button className={btnSecondary} asChild>
                <Link href={`/chat/${booking.id}`}>Contact Customer</Link>
              </Button>
            </>
          ) : (
             <Button className={btnSecondary} disabled>
               Archive
             </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <AuthGuard allowedRoles={["provider"]}>
      <div className="min-h-screen bg-[#f2f4f8] flex flex-col">
        <SiteHeader />
        
        <main className="flex-grow mx-auto max-w-[1200px] w-full px-4 py-8 sm:px-6 lg:px-8">
          
          <button 
            onClick={() => router.push("/provider")}
            className="text-[#007185] hover:text-[#c40000] hover:underline text-[13px] flex items-center gap-1 mb-4 font-medium"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Dashboard
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-[28px] font-bold tracking-tight text-[#0f1111]">Manage Bookings</h1>
            </div>
            
            {/* Amazon Style Search Box */}
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-[9px] h-4 w-4 text-[#565959]" />
                <Input 
                  placeholder="Search by customer name" 
                  className="pl-9 h-[34px] w-full md:w-[300px] border-[#a6a6a6] rounded-[4px] focus-visible:ring-0 focus-visible:outline-none focus-visible:border-[#e77600] focus-visible:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] text-[13px]" 
                />
              </div>
              <Button className="bg-white hover:bg-gray-50 text-[#0f1111] border border-[#d5d9d9] rounded-[4px] h-[34px] px-3 shadow-sm">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Amazon Style Tabs */}
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="flex border-b border-[#d5d9d9] w-full bg-transparent p-0 mb-6 h-auto">
              <TabsTrigger 
                value="pending" 
                className="px-4 py-3 text-[14px] font-bold text-[#565959] data-[state=active]:text-[#0f1111] data-[state=active]:border-b-[3px] data-[state=active]:border-[#e77600] rounded-none bg-transparent hover:bg-gray-50 shadow-none data-[state=active]:shadow-none"
              >
                Requests ({pending.length})
              </TabsTrigger>
              <TabsTrigger 
                value="upcoming" 
                className="px-4 py-3 text-[14px] font-bold text-[#565959] data-[state=active]:text-[#0f1111] data-[state=active]:border-b-[3px] data-[state=active]:border-[#e77600] rounded-none bg-transparent hover:bg-gray-50 shadow-none data-[state=active]:shadow-none"
              >
                Upcoming ({upcoming.length})
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="px-4 py-3 text-[14px] font-bold text-[#565959] data-[state=active]:text-[#0f1111] data-[state=active]:border-b-[3px] data-[state=active]:border-[#e77600] rounded-none bg-transparent hover:bg-gray-50 shadow-none data-[state=active]:shadow-none"
              >
                History
              </TabsTrigger>
            </TabsList>
            
            {/* Tab Contents */}
            <TabsContent value="pending" className="mt-0">
              {pending.length > 0 ? (
                pending.map(b => <BookingCard key={b.id} booking={b} />)
              ) : (
                <div className="bg-white border border-[#d5d9d9] rounded-[4px] p-8 text-center text-[#565959] text-[14px]">
                  0 pending requests found.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="upcoming" className="mt-0">
              {upcoming.length > 0 ? (
                upcoming.map(b => <BookingCard key={b.id} booking={b} />)
              ) : (
                <div className="bg-white border border-[#d5d9d9] rounded-[4px] p-8 text-center text-[#565959] text-[14px]">
                  0 upcoming bookings found.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="history" className="mt-0">
              {history.length > 0 ? (
                history.map(b => <BookingCard key={b.id} booking={b} />)
              ) : (
                <div className="bg-white border border-[#d5d9d9] rounded-[4px] p-8 text-center text-[#565959] text-[14px]">
                  0 past bookings found.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
        
        <Footer />
      </div>
    </AuthGuard>
  );
}