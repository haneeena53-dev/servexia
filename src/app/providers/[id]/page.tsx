"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  Star, MapPin, Clock, MessageSquare, 
  Share2, Heart, ArrowLeft, CheckCircle2,
  Lock, Phone, ChevronRight
} from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { providersService } from "@/services/providers.service";
import { useAuth } from "@/context/AuthContext";
import type { ProviderProfile } from "@/types";
import { cn, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function ProviderProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    async function loadProvider() {
      if (typeof id !== 'string') return;
      try {
        const data = await providersService.getProviderById(id);
        if (data) {
          setProvider(data);
          setActiveImage(data.profileImage || (data.galleryImages && data.galleryImages[0]) || null);
        } else {
          toast.error("Provider not found");
          router.push("/map");
        }
      } catch (error) {
        console.error("Failed to load provider:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProvider();
  }, [id, router]);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "Removed from your List" : "Added to your List");
  };

  // Amazon Base Classes
  const linkText = "text-[#007185] hover:text-[#c40000] hover:underline cursor-pointer transition-colors";
  const hrClass = "my-5 border-t border-[#e7e7e7]";

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <SiteHeader />
        <div className="mx-auto max-w-[1500px] px-4 py-8">
          <Skeleton className="h-[400px] w-full rounded-[4px] mb-8 bg-[#f0f2f2]" />
        </div>
      </div>
    );
  }

  if (!provider) return null;

  const allImages = [
    ...(provider.profileImage ? [provider.profileImage] : []),
    ...(provider.galleryImages || [])
  ];

  return (
    <div className="min-h-screen bg-white text-[#0f1111]">
      <SiteHeader />
      
      {/* Category Bar / Sub-nav (Amazon Style) */}
      <div className="w-full bg-[#232f3e] text-white px-4 py-2 text-[13px] flex items-center gap-4 overflow-x-auto">
        <span className="font-bold cursor-pointer hover:border-white border border-transparent px-1">All Services</span>
        <span className="cursor-pointer hover:border-white border border-transparent px-1">Best Sellers</span>
        <span className="cursor-pointer hover:border-white border border-transparent px-1">Today's Deals</span>
        <span className="cursor-pointer hover:border-white border border-transparent px-1">New Releases</span>
      </div>

      <main className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6 lg:px-8">
        
        {/* BREADCRUMBS */}
        <div className="flex items-center gap-1 text-[12px] text-[#565959] mb-6">
          <Link href="/" className="hover:underline">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/map" className="hover:underline">Local Services</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/category/${provider.categoryId}`} className="hover:underline capitalize">{provider.categoryId}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#0f1111]">{provider.businessName}</span>
        </div>

        {/* 3-COLUMN PRODUCT LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 relative">
          
          {/* LEFT COLUMN: IMAGES */}
          <div className="md:col-span-5 lg:col-span-4 flex gap-4">
            {/* Thumbnails (Vertical on left) */}
            <div className="flex flex-col gap-2 w-[40px] shrink-0">
              {allImages.length > 0 ? allImages.slice(0, 5).map((img, idx) => (
                <button 
                  key={idx}
                  onMouseEnter={() => setActiveImage(img)}
                  className={cn(
                    "w-[40px] h-[40px] rounded-[4px] border overflow-hidden",
                    activeImage === img ? "border-[#e77600] shadow-[0_0_3px_rgba(228,121,17,0.5)]" : "border-[#a6a6a6] hover:border-[#e77600]"
                  )}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              )) : (
                <div className="w-[40px] h-[40px] rounded-[4px] border border-[#e77600] bg-[#f0f2f2] flex items-center justify-center text-[10px] font-bold text-[#565959]">
                  {provider.businessName[0]}
                </div>
              )}
            </div>
            
            {/* Main Image */}
            <div className="flex-grow aspect-square relative border border-[#e7e7e7] rounded-[4px] bg-[#f8f8f8] flex items-center justify-center overflow-hidden">
              {activeImage ? (
                <img src={activeImage} alt={provider.businessName} className="max-w-full max-h-full object-contain" />
              ) : (
                <div className="text-[40px] font-bold text-[#d5d9d9]">{provider.businessName[0]}</div>
              )}
            </div>
          </div>

          {/* MIDDLE COLUMN: DETAILS */}
          <div className="md:col-span-7 lg:col-span-5 space-y-2">
            <h1 className="text-[24px] font-normal leading-tight text-[#0f1111]">
              {provider.businessName}
            </h1>
            <div className="text-[14px]">
              Visit the <Link href="#" className={linkText}>{provider.profession} Store</Link>
            </div>
            
            {/* Ratings Row */}
            <div className="flex items-center gap-4 text-[14px]">
              <div className="flex items-center gap-1 cursor-pointer group">
                <span className="font-normal">{provider.averageRating.toFixed(1)}</span>
                <div className="flex">
                  <Star className="h-4 w-4 fill-[#ffa41c] text-[#ffa41c]" />
                  <Star className="h-4 w-4 fill-[#ffa41c] text-[#ffa41c]" />
                  <Star className="h-4 w-4 fill-[#ffa41c] text-[#ffa41c]" />
                  <Star className="h-4 w-4 fill-[#ffa41c] text-[#ffa41c]" />
                  <Star className={cn("h-4 w-4 text-[#ffa41c]", provider.averageRating >= 4.8 ? "fill-[#ffa41c]" : "fill-transparent")} />
                </div>
                <span className={cn(linkText, "ml-2")}>{provider.totalReviews} ratings</span>
              </div>
              <span className="text-[#565959]">|</span>
              <span className={linkText}>Search this page</span>
            </div>

            <div className={hrClass} />

            {/* Price section */}
            <div className="mb-2">
              <span className="text-[13px] text-[#565959] block mb-1">Starting Price</span>
              <div className="flex items-baseline gap-1 text-[#B12704]">
                <span className="text-[14px] font-normal align-top mt-1">EGP</span>
                <span className="text-[28px] font-medium leading-none">
                  {provider.pricing ? provider.pricing.replace(/[^0-9]/g, '') || "150" : "150"}
                </span>
                <span className="text-[14px] font-normal">.00</span>
              </div>
              <div className="text-[14px] mt-1">
                <span className="text-[#007185] hover:text-[#c40000] hover:underline cursor-pointer">Free Consultation</span> available for first-time customers.
              </div>
            </div>

            {/* Service Details Table/List */}
            <div className="mt-4">
              <div className="text-[14px] font-bold mb-2">Service Details</div>
              <table className="w-full text-[14px] border-spacing-y-2">
                <tbody>
                  <tr>
                    <td className="py-1 font-bold text-[#0f1111] w-32">Category</td>
                    <td className="py-1 text-[#0f1111] capitalize">{provider.categoryId}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-bold text-[#0f1111]">Profession</td>
                    <td className="py-1 text-[#0f1111]">{provider.profession}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-bold text-[#0f1111]">Location</td>
                    <td className="py-1 text-[#0f1111]">{provider.location.city}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className={hrClass} />

            {/* Bullet Points (About this item) */}
            <div>
              <h2 className="text-[16px] font-bold mb-2">About this service</h2>
              <ul className="list-disc pl-5 text-[14px] space-y-1.5 text-[#0f1111]">
                <li><span className="font-bold">Verified Professional:</span> Certified {provider.profession} with established local presence.</li>
                <li><span className="font-bold">Experience:</span> Over 10+ years of proven expertise in the field.</li>
                <li><span className="font-bold">Location:</span> Centrally located in {provider.location.city}, at {provider.location.address}.</li>
                <li><span className="font-bold">Service Quality:</span> Top-rated provider with an average rating of {provider.averageRating.toFixed(1)} stars from {provider.totalReviews} genuine customer reviews.</li>
              </ul>
            </div>
          </div>

          {/* RIGHT COLUMN: BUY BOX */}
          <div className="md:col-span-12 lg:col-span-3">
            <div className="border border-[#d5d9d9] rounded-[8px] p-4 bg-white shadow-sm sticky top-4">
              
              <div className="flex items-baseline gap-1 text-[#B12704] mb-2">
                <span className="text-[12px] font-normal align-top">EGP</span>
                <span className="text-[24px] font-medium leading-none">
                  {provider.pricing ? provider.pricing.replace(/[^0-9]/g, '') || "150" : "150"}
                </span>
                <span className="text-[12px] font-normal">.00</span>
              </div>
              
              <div className="text-[13px] text-[#565959] mb-4">
                No payment required now. Pay directly after service completion.
              </div>

              {/* Delivery / Location */}
              <div className="text-[13px] mb-4 flex items-start gap-1.5">
                <MapPin className="h-4 w-4 text-[#0f1111] shrink-0 mt-0.5" />
                <div>
                  <span className={linkText}>Available in {provider.location.city}</span>
                  <div className="font-bold text-[#0f1111] mt-1">Book today, available tomorrow</div>
                  <div className="text-[#565959] mt-0.5">Order within 4 hrs 30 mins</div>
                </div>
              </div>

              {/* In Stock */}
              <h4 className="text-[#007600] text-[18px] font-normal mb-4">Available for booking</h4>

              {/* Actions */}
              <div className="space-y-2 mb-4">
                <Button 
                  asChild 
                  className="w-full bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] border border-[#fcd200] rounded-[20px] h-[32px] text-[13px] font-normal shadow-sm"
                >
                  <Link href={`/providers/${provider.id}/book`}>Book Appointment</Link>
                </Button>
                
                <Button 
                  className="w-full bg-[#ffa41c] hover:bg-[#fa8900] text-[#0f1111] border border-[#FF8F00] rounded-[20px] h-[32px] text-[13px] font-normal shadow-sm"
                >
                  <MessageSquare className="h-4 w-4 mr-2" /> Message Provider
                </Button>
              </div>

              {/* Secure Transaction */}
              <div className="flex items-center gap-2 text-[13px] text-[#565959] mb-4">
                <Lock className="h-4 w-4 text-[#a6a6a6]" />
                <span className={linkText}>Secure transaction</span>
              </div>

              {/* Seller Info */}
              <div className="text-[13px] grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[#565959] mb-4">
                <div>Sold by</div>
                <div className={linkText}>{provider.businessName}</div>
                <div>Fulfilled by</div>
                <div className="text-[#0f1111]">Servexia Platform</div>
              </div>

              <div className="border-t border-[#d5d9d9] my-4" />

              {/* Add to List */}
              <Button 
                variant="outline"
                className="w-full bg-[#e7e9ec] hover:bg-[#d3d6d8] text-[#0f1111] border-[#adb1b8] rounded-[4px] h-[30px] text-[13px] font-normal shadow-[0_1px_0_rgba(255,255,255,0.6)_inset]"
                onClick={toggleFavorite}
              >
                {isFavorite ? "Remove from List" : "Add to List"}
              </Button>
            </div>
          </div>
        </div>

        {/* BELOW THE FOLD CONTENT */}
        <div className={hrClass} />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8">
            
            {/* Product Description */}
            <section id="description" className="mb-8">
              <h2 className="text-[20px] font-bold text-[#cc6600] mb-3">Product Description</h2>
              <div className="text-[14px] text-[#0f1111] leading-relaxed max-w-3xl space-y-4">
                <p>{provider.description}</p>
                <p>
                  As a leading provider in {provider.location.city}, {provider.businessName} takes pride in delivering exceptional service. 
                  Whether you require a standard consultation or emergency assistance, our team is equipped to handle your needs efficiently and professionally.
                </p>
              </div>
            </section>

            <div className={hrClass} />

            {/* Provider Details (Table Style) */}
            <section className="mb-8">
              <h2 className="text-[20px] font-bold text-[#cc6600] mb-3">Provider Information</h2>
              <div className="bg-white border border-[#d5d9d9] rounded-[4px] max-w-xl">
                <div className="grid grid-cols-3 border-b border-[#d5d9d9] text-[14px]">
                  <div className="p-3 bg-[#f0f2f2] font-bold text-[#0f1111] border-r border-[#d5d9d9]">Working Hours</div>
                  <div className="p-3 col-span-2 text-[#0f1111]">Mon - Sat: 9:00 AM - 6:00 PM</div>
                </div>
                <div className="grid grid-cols-3 border-b border-[#d5d9d9] text-[14px]">
                  <div className="p-3 bg-[#f0f2f2] font-bold text-[#0f1111] border-r border-[#d5d9d9]">Phone Support</div>
                  <div className="p-3 col-span-2 text-[#0f1111] flex items-center gap-2">
                    <Phone className="h-4 w-4" /> +1 (234) 567-890
                  </div>
                </div>
                <div className="grid grid-cols-3 text-[14px]">
                  <div className="p-3 bg-[#f0f2f2] font-bold text-[#0f1111] border-r border-[#d5d9d9]">License Status</div>
                  <div className="p-3 col-span-2 text-[#0f1111] flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-[#007600]" /> Verified and Active
                  </div>
                </div>
              </div>
            </section>

            <div className={hrClass} />

            {/* Customer Reviews Section */}
            <section id="reviews" className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Left: Review Summary */}
                <div className="md:col-span-1">
                  <h2 className="text-[20px] font-bold text-[#0f1111] mb-2">Customer Reviews</h2>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      <Star className="h-5 w-5 fill-[#ffa41c] text-[#ffa41c]" />
                      <Star className="h-5 w-5 fill-[#ffa41c] text-[#ffa41c]" />
                      <Star className="h-5 w-5 fill-[#ffa41c] text-[#ffa41c]" />
                      <Star className="h-5 w-5 fill-[#ffa41c] text-[#ffa41c]" />
                      <Star className={cn("h-5 w-5 text-[#ffa41c]", provider.averageRating >= 4.8 ? "fill-[#ffa41c]" : "fill-transparent")} />
                    </div>
                    <span className="text-[18px] font-normal">{provider.averageRating.toFixed(1)} out of 5</span>
                  </div>
                  <div className="text-[14px] text-[#565959] mb-4">{provider.totalReviews} global ratings</div>
                  
                  {/* Rating Bars */}
                  <div className="space-y-2 text-[13px] text-[#007185] cursor-pointer mb-6">
                    {[{star: "5", pct: "85%"}, {star: "4", pct: "10%"}, {star: "3", pct: "3%"}, {star: "2", pct: "1%"}, {star: "1", pct: "1%"}].map((row) => (
                      <div key={row.star} className="flex items-center gap-2 hover:underline group">
                        <span className="w-[45px] text-right">{row.star} star</span>
                        <div className="h-[18px] w-full bg-[#f0f2f2] rounded-[2px] border border-[#d5d9d9] overflow-hidden">
                          <div className="h-full bg-[#ffa41c] border-r border-[#de7921]" style={{ width: row.pct }} />
                        </div>
                        <span className="w-[30px] text-right text-[#565959] group-hover:underline">{row.pct}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[#d5d9d9] pt-4">
                    <h3 className="font-bold text-[16px] text-[#0f1111] mb-2">Review this service</h3>
                    <p className="text-[13px] text-[#565959] mb-3">Share your thoughts with other customers</p>
                    <Button className="w-full bg-white hover:bg-gray-50 text-[#0f1111] border border-[#d5d9d9] rounded-[8px] h-[31px] text-[13px] font-normal shadow-sm">
                      Write a customer review
                    </Button>
                  </div>
                </div>

                {/* Right: Review List */}
                <div className="md:col-span-2 space-y-6">
                  <h3 className="font-bold text-[16px] text-[#0f1111]">Top reviews from Egypt</h3>
                  
                  {[1, 2, 3].map((r) => (
                    <div key={r} className="text-[#0f1111]">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-8 w-8 rounded-full bg-[#d5d9d9] flex items-center justify-center text-white">
                          <img src="/api/placeholder/32/32" alt="User" className="rounded-full" />
                        </div>
                        <span className="text-[13px] font-normal">Amazon Customer</span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex">
                          {[1,2,3,4,5].map(s => <Star key={s} className={cn("h-3 w-3", s <= 5-r ? "fill-[#ffa41c] text-[#ffa41c]" : "fill-transparent text-[#ffa41c]")} />)}
                        </div>
                        <span className="text-[13px] font-bold">Highly recommended service!</span>
                      </div>
                      
                      <div className="text-[11px] text-[#565959] mb-2">
                        Reviewed in Egypt on {formatDate(new Date())}
                      </div>
                      <div className="text-[11px] text-[#c40000] font-bold mb-2">
                        Verified Purchase
                      </div>
                      
                      <p className="text-[13px] leading-relaxed mb-3">
                        Excellent service! The professional was very punctual and knowledgeable. They solved my issue in less time than expected. I highly recommend them to anyone looking for quality work in the area. Will definitely book again.
                      </p>
                      
                      <div className="text-[13px] text-[#565959] flex items-center gap-2">
                        <span>4 people found this helpful</span>
                        <span className="text-[#d5d9d9]">|</span>
                        <Button variant="outline" className="h-[29px] px-3 text-[13px] rounded-[8px]">Helpful</Button>
                        <span className="text-[#d5d9d9]">|</span>
                        <span className={linkText}>Report</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}