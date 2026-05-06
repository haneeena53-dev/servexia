"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Calendar as CalendarIcon, Clock, ArrowLeft, 
  ChevronLeft, ChevronRight, CheckCircle2, Loader2, AlertCircle, Lock
} from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { providersService } from "@/services/providers.service";
import { bookingsService } from "@/services/bookings.service";
import { useAuth } from "@/context/AuthContext";
import type { ProviderProfile } from "@/types";
import { cn, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

const timeSlots = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
];

export default function BookingPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function loadProvider() {
      if (typeof id !== 'string') return;
      try {
        const data = await providersService.getProviderById(id);
        if (data) setProvider(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadProvider();
  }, [id]);

  const handleBooking = async () => {
    if (!user || !provider || !selectedSlot) {
      toast.error("Please select a time slot");
      return;
    }

    setSubmitting(true);
    try {
      await bookingsService.createBooking({
        userId: user.uid,
        userName: user.displayName || "User",
        userAvatar: user.photoURL,
        providerId: provider.id,
        providerName: provider.businessName,
        providerImage: provider.profileImage,
        date: selectedDate,
        timeSlot: selectedSlot,
        status: "pending",
        notes,
      });
      
      toast.success("Booking requested! Waiting for provider approval.");
      router.push("/bookings");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  // Amazon Standard Classes
  const inputBaseClass = "w-full min-h-[31px] px-3 py-1.5 border border-[#a6a6a6] rounded-[3px] focus-visible:ring-0 focus-visible:outline-none focus-visible:border-[#e77600] focus-visible:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] text-[13px] bg-white";
  const linkText = "text-[#007185] hover:text-[#c40000] hover:underline cursor-pointer transition-colors";

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Minimal Header for Loading State */}
        <header className="border-b border-[#d5d9d9] bg-[#f8f8f8] py-4 px-6 flex justify-between items-center">
           <div className="text-[24px] font-bold tracking-tight text-[#0f1111]">
             NearLink <span className="font-normal text-[#565959]">Checkout</span>
           </div>
           <Lock className="h-5 w-5 text-[#565959]" />
        </header>
        <div className="flex-grow flex items-center justify-center p-20">
          <Loader2 className="h-10 w-10 animate-spin text-[#e77600]" />
        </div>
      </div>
    );
  }

  if (!provider) return null;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white text-[#0f1111]">
        
        {/* Amazon Minimal Checkout Header */}
        <header className="border-b border-[#d5d9d9] bg-gradient-to-b from-[#f8f8f8] to-white py-4 px-6 flex justify-between items-center">
           <Link href="/" className="text-[24px] font-bold tracking-tight text-[#0f1111]">
             NearLink <span className="font-normal text-[#565959]">Checkout</span>
           </Link>
           <Lock className="h-5 w-5 text-[#565959]" />
        </header>

        <main className="mx-auto max-w-[1000px] w-full px-4 py-8">
          <button 
            className={`${linkText} flex items-center gap-1 mb-6 text-[13px]`}
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-3 w-3" /> Return to service details
          </button>

          <h1 className="text-[28px] font-normal mb-6 leading-tight">Review your booking</h1>

          <div className="grid md:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: BOOKING STEPS */}
            <div className="md:col-span-8 space-y-4">
              
              {/* Step 1: Schedule */}
              <div className="border border-[#d5d9d9] rounded-[8px] overflow-hidden">
                <div className="bg-[#f0f2f2] px-5 py-3 border-b border-[#d5d9d9]">
                   <h2 className="text-[18px] font-bold text-[#0f1111]">1 &nbsp; Choose your appointment time</h2>
                </div>
                
                <div className="p-5 bg-white">
                  <div className="max-w-md">
                    <Label className="block text-[14px] font-bold mb-2 text-[#0f1111]">Select Date</Label>
                    <input 
                      type="date" 
                      className={inputBaseClass + " h-[34px] mb-6"}
                      value={selectedDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                    
                    <Label className="block text-[14px] font-bold mb-2 text-[#0f1111]">Available Slots for {formatDate(selectedDate)}</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {timeSlots.map(slot => (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={cn(
                            "py-2 rounded-[4px] border text-[13px] transition-colors focus:outline-none",
                            selectedSlot === slot
                              ? "bg-[#fcf5ee] border-[#e77600] text-[#0f1111] shadow-[0_0_3px_rgba(228,121,17,0.5)] font-bold"
                              : "bg-white border-[#d5d9d9] text-[#0f1111] hover:bg-gray-50"
                          )}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Notes */}
              <div className="border border-[#d5d9d9] rounded-[8px] overflow-hidden">
                 <div className="bg-[#f0f2f2] px-5 py-3 border-b border-[#d5d9d9]">
                   <h2 className="text-[18px] font-bold text-[#0f1111]">2 &nbsp; Add instructions or notes</h2>
                 </div>
                 <div className="p-5 bg-white">
                    <p className="text-[13px] text-[#565959] mb-3">
                      Provide any specific details the provider should know before arriving (e.g. exact issue, building number).
                    </p>
                    <Textarea 
                      placeholder="Enter your notes here..."
                      rows={3}
                      className={inputBaseClass}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                 </div>
              </div>

              {/* Step 3: Provider Info (Readonly) */}
              <div className="border border-[#d5d9d9] rounded-[8px] overflow-hidden">
                 <div className="bg-white px-5 py-4 flex gap-4 items-center">
                    <h2 className="text-[18px] font-bold text-[#0f1111] w-8">3</h2>
                    <div className="flex-grow flex items-center justify-between">
                      <div>
                        <div className="text-[14px] font-bold text-[#0f1111]">Service Provider</div>
                        <div className="text-[13px] text-[#565959]">{provider.businessName} - {provider.profession}</div>
                      </div>
                      <div className={linkText + " text-[13px]"}>Change</div>
                    </div>
                 </div>
              </div>

            </div>

            {/* RIGHT COLUMN: ORDER SUMMARY (Amazon Buy Box) */}
            <div className="md:col-span-4">
              <div className="border border-[#d5d9d9] rounded-[8px] p-4 bg-white sticky top-4">
                
                {/* Primary Action Button */}
                <Button 
                  className={cn(
                    "w-full rounded-[8px] h-[31px] text-[13px] font-normal shadow-sm mb-4",
                    selectedSlot 
                      ? "bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] border border-[#fcd200]" 
                      : "bg-[#e7e9ec] text-[#565959] border-[#adb1b8] cursor-not-allowed opacity-70"
                  )}
                  onClick={handleBooking}
                  disabled={submitting || !selectedSlot}
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Confirm Booking
                </Button>
                
                <p className="text-[11px] text-center text-[#565959] mb-4 leading-tight border-b border-[#d5d9d9] pb-4">
                  By placing your order, you agree to NearLink's <span className={linkText}>privacy notice</span> and <span className={linkText}>conditions of use</span>.
                </p>

                <h3 className="font-bold text-[16px] text-[#0f1111] mb-3">Booking Summary</h3>
                
                <div className="space-y-2 text-[13px] mb-4 text-[#0f1111]">
                  <div className="flex justify-between">
                    <span>Service:</span>
                    <span className="text-right max-w-[150px] truncate">{provider.businessName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="text-right">{formatDate(selectedDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span className={cn("text-right", !selectedSlot && "text-[#c40000]")}>
                      {selectedSlot || "Please select a time"}
                    </span>
                  </div>
                </div>
                
                <div className="border-t border-[#d5d9d9] pt-3 mb-4">
                  <div className="flex justify-between items-baseline text-[#B12704] font-bold">
                    <span className="text-[16px]">Estimated Cost:</span>
                    <span className="text-[20px]">{provider.pricing || "TBD"}</span>
                  </div>
                </div>
                
                {/* Amazon Info Box */}
                <div className="bg-[#f0f2f2] p-3 rounded-[4px] border border-[#d5d9d9] flex gap-2">
                  <AlertCircle className="h-4 w-4 text-[#007185] shrink-0 mt-0.5" />
                  <p className="text-[11px] text-[#0f1111] leading-snug">
                    <span className="font-bold">No charge today.</span> You will pay the provider directly after the service is completed.
                  </p>
                </div>

              </div>
            </div>
            
          </div>
        </main>
        
        {/* Minimal Footer for Checkout Pages */}
        <footer className="border-t border-[#d5d9d9] bg-white py-8 mt-auto">
          <div className="max-w-[1000px] mx-auto px-4 text-center text-[11px] text-[#565959]">
            <div className="flex justify-center gap-4 mb-2">
              <span className={linkText}>Conditions of Use</span>
              <span className={linkText}>Privacy Notice</span>
              <span className={linkText}>Help</span>
            </div>
            <p>© {new Date().getFullYear()}, NearLink.com, Inc. or its affiliates</p>
          </div>
        </footer>

      </div>
    </AuthGuard>
  );
}