"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, Filter, List, Map as MapIcon, ChevronLeft, 
  Stethoscope, Wrench, Pill, ShoppingBag, UtensilsCrossed, 
  Scissors, Dumbbell, GraduationCap, Star, SlidersHorizontal,
  Loader2
} from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMap } from "@/hooks/useMap";
import { providersService } from "@/services/providers.service";
import type { ProviderProfile, Category } from "@/types";
import { cn } from "@/lib/utils";
import Link from "next/link"; // For Amazon style blue links

const MapView = dynamic(
  () => import("@/components/map/MapView").then((module) => module.MapView),
  { ssr: false }
);

const categoryIcons: Record<string, any> = {
  doctors: Stethoscope,
  mechanics: Wrench,
  pharmacies: Pill,
  stores: ShoppingBag,
  restaurants: UtensilsCrossed,
  beauty: Scissors,
  fitness: Dumbbell,
  tutors: GraduationCap,
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function getDistanceKm(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const haversine =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  return earthRadiusKm * c;
}

export default function MapPage() {
  const router = useRouter();
  const { userLocation, loading: geoLoading } = useMap();
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [providersData, categoriesData] = await Promise.all([
          providersService.getAllProviders(),
          providersService.getCategories(),
        ]);
        
        if (providersData.length === 0 && userLocation) {
          const dummyProviders: ProviderProfile[] = [
            {
              id: "dummy-1",
              userId: "u1",
              businessName: "City Medical Clinic",
              profession: "Cardiologist",
              description: "Expert heart care",
              profileImage: null,
              galleryImages: [],
              location: {
                lat: userLocation.lat + 0.005,
                lng: userLocation.lng + 0.005,
                address: "123 Main St",
                city: "Cairo"
              },
              workingHours: {},
              pricing: "100 EGP",
              categoryId: "doctors",
              status: "approved",
              averageRating: 4.8,
              totalReviews: 120,
              totalBookings: 450,
              createdAt: "",
              updatedAt: ""
            },
            {
              id: "dummy-2",
              userId: "u2",
              businessName: "FastFix Auto",
              profession: "Mechanic",
              description: "Quick car repairs",
              profileImage: null,
              galleryImages: [],
              location: {
                lat: userLocation.lat - 0.003,
                lng: userLocation.lng + 0.008,
                address: "456 Oak Ave",
                city: "Cairo"
              },
              workingHours: {},
              pricing: "Varies",
              categoryId: "mechanics",
              status: "approved",
              averageRating: 4.5,
              totalReviews: 85,
              totalBookings: 320,
              createdAt: "",
              updatedAt: ""
            },
            {
              id: "dummy-3",
              userId: "u3",
              businessName: "HealthPlus Pharmacy",
              profession: "Pharmacist",
              description: "24/7 medicine delivery",
              profileImage: null,
              galleryImages: [],
              location: {
                lat: userLocation.lat + 0.01,
                lng: userLocation.lng - 0.005,
                address: "789 Pine Rd",
                city: "Cairo"
              },
              workingHours: {},
              pricing: null,
              categoryId: "pharmacies",
              status: "approved",
              averageRating: 4.9,
              totalReviews: 210,
              totalBookings: 1200,
              createdAt: "",
              updatedAt: ""
            }
          ];
          setProviders(dummyProviders);
        } else {
          setProviders(providersData);
        }
        
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to load map data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (userLocation) {
      loadData();
    }
  }, [userLocation]);

  const filteredProviders = providers.filter(p => {
    const matchesSearch = p.businessName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.profession.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategoryId ? p.categoryId === selectedCategoryId : true;
    return matchesSearch && matchesCategory;
  });

  const providersWithDistance = filteredProviders
    .filter((provider) => Number.isFinite(provider.location.lat) && Number.isFinite(provider.location.lng))
    .map((provider) => ({
      provider,
      distanceKm: userLocation
        ? getDistanceKm(userLocation, {
            lat: provider.location.lat,
            lng: provider.location.lng,
          })
        : Number.POSITIVE_INFINITY,
    }))
    .sort((left, right) => left.distanceKm - right.distanceKm);

  const nearestProviders = providersWithDistance.map((item) => item.provider);
  const distanceByProviderId = providersWithDistance.reduce<Record<string, number>>((acc, item) => {
    acc[item.provider.id] = item.distanceKm;
    return acc;
  }, {});

  const handleSelectProvider = (providerId: string | null) => {
    setSelectedProviderId(providerId);
    if (!providerId) return;
    router.push(`/providers/${providerId}/book`);
  };

  return (
    <AuthGuard>
      <div className="flex flex-col h-screen overflow-hidden bg-white text-[#0f1111]">
        <SiteHeader />
        
        <main className="flex flex-grow overflow-hidden relative">
          {/* SIDEBAR (Amazon Filter Column Style) */}
          <aside className={cn(
            "absolute inset-y-0 left-0 z-20 w-[340px] bg-white border-r border-[#d5d9d9] transition-all duration-300 transform shadow-[2px_0_5px_rgba(0,0,0,0.05)]",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}>
            <div className="h-full flex flex-col">
              
              {/* Search & View Toggle Section */}
              <div className="p-4 border-b border-[#e7e7e7] bg-[#f8f8f8]">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-[9px] h-4 w-4 text-[#565959]" />
                  <Input 
                    placeholder="Search for services..." 
                    className="pl-9 h-[34px] w-full border-[#a6a6a6] rounded-[4px] focus-visible:ring-0 focus-visible:outline-none focus-visible:border-[#e77600] focus-visible:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] text-[13px] bg-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {/* Amazon style Toggle (looks like a segmented control) */}
                <div className="flex bg-white border border-[#d5d9d9] rounded-[4px] overflow-hidden">
                  <button 
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-1.5 text-[13px] font-bold transition-colors",
                      viewMode === "map" ? "bg-[#f0f2f2] text-[#0f1111] shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]" : "text-[#565959] hover:bg-gray-50"
                    )}
                    onClick={() => setViewMode("map")}
                  >
                    <MapIcon className="h-4 w-4" /> Map View
                  </button>
                  <div className="w-[1px] bg-[#d5d9d9]"></div>
                  <button 
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-1.5 text-[13px] font-bold transition-colors",
                      viewMode === "list" ? "bg-[#f0f2f2] text-[#0f1111] shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]" : "text-[#565959] hover:bg-gray-50"
                    )}
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" /> List View
                  </button>
                </div>
              </div>

              {/* Categories Section (Amazon Sidebar Filter Style) */}
              <div className="p-4 border-b border-[#e7e7e7]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[14px] font-bold text-[#0f1111]">Categories</h3>
                  {selectedCategoryId && (
                    <button className="text-[#007185] hover:text-[#c40000] hover:underline text-[12px]" onClick={() => setSelectedCategoryId(null)}>Clear</button>
                  )}
                </div>
                <div className="space-y-1">
                  {categories.map(cat => {
                    const isSelected = selectedCategoryId === cat.slug;
                    return (
                      <div key={cat.id} className="flex items-center">
                        <input 
                          type="checkbox" 
                          id={`cat-${cat.id}`}
                          checked={isSelected}
                          onChange={() => setSelectedCategoryId(isSelected ? null : cat.slug)}
                          className="w-4 h-4 mr-2 accent-[#e77600] border-[#888c8c] rounded-[3px] cursor-pointer"
                        />
                        <label 
                          htmlFor={`cat-${cat.id}`} 
                          className={cn(
                            "text-[13px] cursor-pointer hover:text-[#e77600]",
                            isSelected ? "font-bold text-[#0f1111]" : "text-[#0f1111]"
                          )}
                        >
                          {cat.name}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Results List */}
              <ScrollArea className="flex-grow bg-white">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3 text-[14px] text-[#0f1111]">
                    <span><span className="font-bold">{nearestProviders.length}</span> results</span>
                  </div>
                  
                  <div className="space-y-4">
                    {nearestProviders.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          handleSelectProvider(p.id);
                          if (viewMode === "list") setViewMode("map");
                        }}
                        className={cn(
                          "flex gap-3 cursor-pointer border border-transparent rounded-[4px] p-2 -mx-2 transition-colors",
                          selectedProviderId === p.id ? "bg-[#fcf5ee] border-[#e77600]" : "hover:bg-gray-50"
                        )}
                      >
                        {/* Image/Icon placeholder */}
                        <div className="h-[80px] w-[80px] shrink-0 bg-[#f8f8f8] border border-[#d5d9d9] rounded-[4px] flex items-center justify-center">
                          {(() => {
                            const Icon = categoryIcons[p.categoryId] || MapIcon;
                            return <Icon className="h-8 w-8 text-[#565959]" strokeWidth={1} />;
                          })()}
                        </div>
                        
                        {/* Details */}
                        <div className="flex flex-col flex-grow">
                          <span className="text-[15px] font-bold text-[#007185] hover:text-[#c40000] hover:underline leading-tight mb-1 line-clamp-2">
                            {p.businessName}
                          </span>
                          <span className="text-[12px] text-[#565959] mb-1">{p.profession}</span>
                          
                          {/* Amazon Star Rating */}
                          <div className="flex items-center gap-1 mb-1 text-[12px]">
                            <div className="flex">
                              <Star className="h-3.5 w-3.5 fill-[#ffa41c] text-[#ffa41c]" />
                              <Star className="h-3.5 w-3.5 fill-[#ffa41c] text-[#ffa41c]" />
                              <Star className="h-3.5 w-3.5 fill-[#ffa41c] text-[#ffa41c]" />
                              <Star className="h-3.5 w-3.5 fill-[#ffa41c] text-[#ffa41c]" />
                              <Star className={cn("h-3.5 w-3.5 text-[#ffa41c]", p.averageRating >= 4.8 ? "fill-[#ffa41c]" : "fill-transparent")} />
                            </div>
                            <span className="text-[#007185]">{p.totalReviews}</span>
                          </div>
                          
                          <div className="text-[12px] text-[#565959]">
                            {p.location.city}
                            {Number.isFinite(distanceByProviderId[p.id]) ? ` | ${distanceByProviderId[p.id].toFixed(1)} km away` : ""}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {nearestProviders.length === 0 && !loading && (
                    <div className="text-center py-10 border border-[#d5d9d9] bg-[#f8f8f8] rounded-[4px]">
                      <p className="text-[14px] font-bold text-[#0f1111] mb-1">No results found.</p>
                      <p className="text-[13px] text-[#565959]">Try checking your spelling or use more general terms.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </aside>

          {/* SIDEBAR TOGGLE BUTTON (Amazon Simple Button) */}
          <button
            className={cn(
              "absolute left-4 top-4 z-30 h-9 w-9 bg-white border border-[#d5d9d9] rounded-[4px] shadow-sm flex items-center justify-center text-[#0f1111] hover:bg-gray-50 transition-all duration-300",
              isSidebarOpen && "left-[350px] top-4"
            )}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle Sidebar"
          >
            <ChevronLeft className={cn("h-5 w-5 transition-transform", !isSidebarOpen && "rotate-180")} />
          </button>

          {/* MAIN CONTENT AREA (MAP) */}
          <div className="flex-grow h-full relative bg-[#e5e3df]">
            {loading || geoLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-[#e77600]" />
                  <p className="text-[14px] font-bold text-[#0f1111]">Loading map...</p>
                </div>
              </div>
            ) : (
              <MapView 
                providers={nearestProviders}
                userLocation={userLocation}
                selectedProviderId={selectedProviderId}
                onProviderSelect={handleSelectProvider}
                providerDistances={distanceByProviderId}
              />
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}