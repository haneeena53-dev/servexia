"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  MessageSquare,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { bookingsService } from "@/services/bookings.service";
import type { Booking } from "@/types";
import { cn, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function BookingDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function loadBooking() {
      if (typeof id !== "string") return;

      try {
        const data = await bookingsService.getBookingById(id);
        setBooking(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load booking details");
      } finally {
        setLoading(false);
      }
    }

    loadBooking();
  }, [id]);

  const handleCancel = async () => {
    if (!booking) return;

    setUpdating(true);
    try {
      await bookingsService.updateBookingStatus(booking.id, "rejected");
      setBooking({ ...booking, status: "rejected" });
      toast.success("Booking cancelled successfully");
    } catch (error) {
      console.error(error);
      toast.error("Could not cancel booking");
    } finally {
      setUpdating(false);
    }
  };

  const statusLabel = booking
    ? booking.status === "accepted"
      ? "Confirmed"
      : booking.status === "pending"
        ? "Awaiting Confirmation"
        : booking.status === "completed"
          ? "Completed"
          : "Cancelled"
    : "";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eaeded]">
        <SiteHeader />
        <div className="flex items-center justify-center p-20">
          <Loader2 className="h-10 w-10 animate-spin text-[#e77600]" />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-[#eaeded] flex flex-col">
          <SiteHeader />
          <main className="mx-auto max-w-[1000px] w-full px-4 py-10 sm:px-6 lg:px-8">
            <Card className="p-8 text-center border border-[#d5d9d9] bg-white">
              <AlertCircle className="h-10 w-10 text-[#c40000] mx-auto mb-3" />
              <h1 className="text-[22px] font-bold text-[#0f1111] mb-2">Booking not found</h1>
              <p className="text-[#565959] mb-6">The booking you requested doesn&apos;t exist or you don&apos;t have access to it.</p>
              <Button asChild className="bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] border border-[#fcd200] rounded-[8px]">
                <Link href="/bookings">Back to bookings</Link>
              </Button>
            </Card>
          </main>
          <Footer />
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#eaeded] flex flex-col text-[#0f1111]">
        <SiteHeader />

        <main className="mx-auto max-w-[1100px] w-full px-4 py-8 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="mb-6 inline-flex items-center gap-2 text-[13px] text-[#007185] hover:text-[#c40000] hover:underline"
          >
            <ArrowLeft className="h-3 w-3" /> Back
          </button>

          <div className="grid lg:grid-cols-[1.6fr_0.9fr] gap-6">
            <div className="space-y-6">
              <Card className="overflow-hidden border border-[#d5d9d9] bg-white shadow-sm">
                <div className="flex items-center justify-between gap-4 border-b border-[#d5d9d9] bg-[#f0f2f2] px-5 py-4">
                  <div>
                    <h1 className="text-[22px] font-bold text-[#0f1111]">Booking details</h1>
                    <p className="text-[13px] text-[#565959]">Booking #{booking.id.slice(0, 12)}</p>
                  </div>
                  <div className={cn(
                    "rounded-full border px-3 py-1 text-[12px] font-bold",
                    booking.status === "accepted" && "border-[#b7e1c1] bg-[#f0fff4] text-[#007600]",
                    booking.status === "pending" && "border-[#ffd699] bg-[#fff8e1] text-[#e77600]",
                    booking.status === "completed" && "border-[#d5d9d9] bg-[#f8f8f8] text-[#0f1111]",
                    booking.status === "rejected" && "border-[#f5b7b1] bg-[#fff5f5] text-[#c40000]"
                  )}>
                    {statusLabel}
                  </div>
                </div>

                <div className="p-5 space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4 text-[13px]">
                    <div className="rounded-[8px] border border-[#d5d9d9] p-4">
                      <div className="flex items-center gap-2 text-[#565959] mb-2">
                        <Calendar className="h-4 w-4" /> Date
                      </div>
                      <div className="font-bold text-[15px]">{formatDate(booking.date)}</div>
                    </div>
                    <div className="rounded-[8px] border border-[#d5d9d9] p-4">
                      <div className="flex items-center gap-2 text-[#565959] mb-2">
                        <Clock className="h-4 w-4" /> Time Slot
                      </div>
                      <div className="font-bold text-[15px]">{booking.timeSlot}</div>
                    </div>
                  </div>

                  <div className="rounded-[8px] border border-[#d5d9d9] p-4">
                    <h2 className="font-bold text-[15px] mb-2">Notes</h2>
                    <p className="text-[13px] text-[#565959] leading-relaxed">
                      {booking.notes || "No notes were provided for this booking."}
                    </p>
                  </div>

                  <div className="rounded-[8px] border border-[#d5d9d9] p-4 flex items-center gap-4">
                    <Avatar className="h-14 w-14 rounded-[8px] border border-[#d5d9d9]">
                      <AvatarImage src={booking.providerImage || ""} />
                      <AvatarFallback className="rounded-[8px] bg-[#f0f2f2] text-[#565959] font-bold">
                        {booking.providerName?.[0] || "P"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-[12px] text-[#565959] mb-1">Service provider</p>
                      <Link href={`/providers/${booking.providerId}`} className="text-[15px] font-bold text-[#007185] hover:text-[#c40000] hover:underline">
                        {booking.providerName}
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-5 border border-[#d5d9d9] bg-white shadow-sm sticky top-4">
                <h2 className="text-[18px] font-bold mb-4">Manage booking</h2>

                <div className="space-y-3">
                  <Button asChild className="w-full bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] border border-[#fcd200] rounded-[8px] h-[31px] text-[13px] font-normal shadow-sm">
                    <Link href="/chat">
                      <MessageSquare className="h-4 w-4 mr-2" /> Contact provider
                    </Link>
                  </Button>

                  {(booking.status === "pending" || booking.status === "accepted") && (
                    <Button
                      variant="outline"
                      className="w-full bg-white hover:bg-gray-50 text-[#0f1111] border border-[#d5d9d9] rounded-[8px] h-[31px] text-[13px] font-normal shadow-sm"
                      onClick={handleCancel}
                      disabled={updating}
                    >
                      {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                      Cancel booking
                    </Button>
                  )}
                </div>

                <Separator className="my-5" />

                <div className="space-y-3 text-[13px] text-[#565959]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#007600]" />
                    Secure platform booking
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#007185]" />
                    Managed through NearLink
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </AuthGuard>
  );
}