"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Camera, MapPin, Save, 
  Briefcase, Info, ArrowLeft,
  Loader2, CheckCircle2 
} from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { providersService } from "@/services/providers.service";
import { storage, firebaseReady } from "@/lib/firebase/config";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import type { Category } from "@/types";
import { toast } from "sonner";

export default function ProfileEditor() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  
  const [formData, setFormData] = useState({
    businessName: "",
    profession: "",
    categoryId: "",
    description: "",
    pricing: "",
    profileImage: null as string | null,
    location: {
      address: "",
      city: "",
      lat: 0,
      lng: 0
    }
  });

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const [cats, profile] = await Promise.all([
          providersService.getCategories(),
          providersService.getProviderById(user.uid)
        ]);
        
        setCategories(cats);
        
        if (profile) {
          const resolvedCategoryId =
            cats.find(
              (cat) => cat.slug === profile.categoryId || cat.id === profile.categoryId
            )?.slug ||
            cats.find(
              (cat) =>
                cat.slug === profile.categoryName ||
                cat.id === profile.categoryName ||
                cat.name.toLowerCase() === profile.categoryName?.toLowerCase()
            )?.slug ||
            profile.categoryId ||
            "";

          setFormData({
            businessName: profile.businessName,
            profession: profile.profession,
            categoryId: resolvedCategoryId,
            description: profile.description,
            pricing: profile.pricing || "",
            profileImage: profile.profileImage || null,
            location: profile.location
          });
        } else {
          setFormData(prev => ({
            ...prev,
            businessName: user.displayName || ""
          }));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      await providersService.saveProviderProfile(user.uid, formData);
      toast.success("Profile updated successfully!");
      router.push("/provider");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        let detectedAddress = "";
        let detectedCity = "";

        if (mapboxToken) {
          try {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?types=address,place,locality,neighborhood&language=en&access_token=${mapboxToken}`
            );

            if (response.ok) {
              const data = await response.json();
              const features = Array.isArray(data?.features) ? data.features : [];

              const addressFeature = features.find((feature: any) => feature.place_type?.includes("address"));
              const localityFeature =
                features.find((feature: any) => feature.place_type?.includes("place")) ||
                features.find((feature: any) => feature.place_type?.includes("locality"));

              detectedAddress = addressFeature?.place_name || "";
              detectedCity = localityFeature?.text || "";

              if (!detectedCity && addressFeature?.context) {
                const cityContext = addressFeature.context.find((item: any) => String(item.id || "").startsWith("place."));
                detectedCity = cityContext?.text || "";
              }
            }
          } catch (error) {
            console.error("Reverse geocoding failed", error);
          }
        }

        setFormData((prev) => ({
          ...prev,
          location: {
            ...prev.location,
            lat,
            lng,
            address: detectedAddress || prev.location.address,
            city: detectedCity || prev.location.city,
          },
        }));

        if (detectedAddress || detectedCity) {
          toast.success("Location, street address, and city were filled automatically");
        } else {
          toast.success("Your real location has been set. Please complete address/city if needed.");
        }

        setLocating(false);
      },
      (error) => {
        console.error(error);
        toast.error("Could not access your location. Please allow location permission.");
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;

    if (!firebaseReady) {
      toast.error("Firebase is not configured in this environment.");
      e.target.value = "";
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type === "image/jpeg" || file.type === "image/png";
    if (!isImage) {
      toast.error("Only JPEG or PNG images are allowed");
      e.target.value = "";
      return;
    }

    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      toast.error("Image size must be 5MB or less");
      e.target.value = "";
      return;
    }

    setUploadingImage(true);
    try {
      const extension = file.type === "image/png" ? "png" : "jpg";
      const fileRef = ref(storage, `providers/${user.uid}/profile-${Date.now()}.${extension}`);
      await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(fileRef);

      setFormData((prev) => ({ ...prev, profileImage: downloadUrl }));
      toast.success("Profile image uploaded successfully");
    } catch (error: any) {
      console.error(error);
      const code = error?.code || "";
      if (code === "storage/unauthorized") {
        toast.error("Upload denied by Storage rules. Please update Firebase Storage permissions.");
      } else if (code === "storage/canceled") {
        toast.error("Upload was canceled");
      } else {
        toast.error(error?.message || "Failed to upload image");
      }
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  // Amazon Standard Input Classes
  const inputBaseClass = "w-full min-h-[31px] px-3 py-1.5 border border-[#a6a6a6] rounded-[3px] focus-visible:ring-0 focus-visible:outline-none focus-visible:border-[#e77600] focus-visible:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] text-[13px] bg-white";
  const labelBaseClass = "block text-[13px] font-bold text-[#0f1111] mb-1";
  const cardBaseClass = "bg-white border border-[#d5d9d9] rounded-[8px] p-6 shadow-sm";

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <SiteHeader />
        <div className="flex items-center justify-center p-20">
          <Loader2 className="h-10 w-10 animate-spin text-[#e77600]" />
        </div>
      </div>
    );
  }

  return (
    <AuthGuard allowedRoles={["provider"]}>
      {/* Amazon Seller Central Gray Background */}
      <div className="min-h-screen bg-[#f2f4f8]">
        <SiteHeader />
        
        <main className="mx-auto max-w-[1200px] w-full px-4 py-8 sm:px-6 lg:px-8">
          
          {/* Top Bar / Breadcrumbs */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <button 
                onClick={() => router.back()}
                className="text-[#007185] hover:text-[#c40000] hover:underline text-[13px] flex items-center gap-1 mb-2 font-medium"
              >
                <ArrowLeft className="h-3 w-3" /> Back to Dashboard
              </button>
              <h1 className="text-[28px] font-bold tracking-tight text-[#0f1111]">Edit Business Profile</h1>
              <p className="text-[13px] text-[#565959] mt-1">This information will be visible to customers on the Servexia map.</p>
            </div>
            
            {/* Amazon Primary Action Button */}
            <Button 
              onClick={handleSubmit} 
              disabled={saving} 
              className="bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] border border-[#fcd200] rounded-[8px] h-[34px] px-6 text-[13px] font-normal shadow-sm transition-colors w-full md:w-auto"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save and continue
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              
              {/* LEFT COLUMN: BASIC INFO */}
              <div className="md:col-span-2 space-y-6">
                
                {/* General Info Card */}
                <div className={cardBaseClass}>
                  <div className="border-b border-[#e7e7e7] pb-3 mb-5">
                    <h2 className="font-bold text-[18px] text-[#0f1111]">General Information</h2>
                  </div>
                  
                  <div className="space-y-5">
                    <div>
                      <Label htmlFor="businessName" className={labelBaseClass}>Business or Personal Name</Label>
                      <Input 
                        id="businessName" 
                        value={formData.businessName}
                        onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                        placeholder="e.g. Dr. Sarah Smith"
                        className={inputBaseClass}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="relative z-[120]">
                        <Label htmlFor="categoryId" className={labelBaseClass}>Category</Label>
                        {/* Custom styling for Select to match Amazon */}
                        <Select 
                          value={formData.categoryId} 
                          onValueChange={(v) => setFormData({...formData, categoryId: v})}
                        >
                          <SelectTrigger className={inputBaseClass}>
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent
                            position="popper"
                            sideOffset={6}
                            className="!z-[2147483647] bg-white opacity-100 border border-[#d5d9d9] shadow-xl"
                          >
                            {categories.map(cat => (
                              <SelectItem key={cat.id} value={cat.slug || cat.id} className="text-[13px]">{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="profession" className={labelBaseClass}>Specific Profession</Label>
                        <Input 
                          id="profession" 
                          value={formData.profession}
                          onChange={(e) => setFormData({...formData, profession: e.target.value})}
                          placeholder="e.g. Dentist"
                          className={inputBaseClass}
                          required
                        />
                      </div>
                    </div>

                    <div className="relative z-0">
                      <Label htmlFor="description" className={labelBaseClass}>About Your Service</Label>
                      <Textarea 
                        id="description" 
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Describe what you offer, your experience, etc."
                        rows={5}
                        className={`${inputBaseClass} resize-y`}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="pricing" className={labelBaseClass}>Pricing Info (Starting from)</Label>
                      {/* Amazon styled prefix input */}
                      <div className="flex">
                        <span className="inline-flex items-center px-3 border border-r-0 border-[#a6a6a6] rounded-l-[3px] bg-[#f3f3f3] text-[#565959] text-[13px]">
                          EGP
                        </span>
                        <Input 
                          id="pricing" 
                          value={formData.pricing}
                          onChange={(e) => setFormData({...formData, pricing: e.target.value})}
                          placeholder="e.g. 150 per hour"
                          className={`${inputBaseClass} rounded-l-none`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Card */}
                <div className={cardBaseClass}>
                  <div className="border-b border-[#e7e7e7] pb-3 mb-5 flex items-center justify-between gap-3">
                    <h2 className="font-bold text-[18px] text-[#0f1111]">Location & Visibility</h2>
                    <Button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={locating}
                      className="bg-white hover:bg-gray-50 text-[#0f1111] border border-[#d5d9d9] rounded-[8px] h-[31px] px-3 text-[12px] font-normal shadow-sm"
                    >
                      {locating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MapPin className="h-4 w-4 mr-2" />}
                      Use my current location
                    </Button>
                  </div>
                  
                  <div className="space-y-5">
                    <div>
                      <Label htmlFor="address" className={labelBaseClass}>Street Address</Label>
                      <Input 
                        id="address" 
                        value={formData.location.address}
                        onChange={(e) => setFormData({
                          ...formData, 
                          location: { ...formData.location, address: e.target.value }
                        })}
                        placeholder="123 Main Street"
                        className={inputBaseClass}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="city" className={labelBaseClass}>City</Label>
                      <Input 
                        id="city" 
                        value={formData.location.city}
                        onChange={(e) => setFormData({
                          ...formData, 
                          location: { ...formData.location, city: e.target.value }
                        })}
                        placeholder="Cairo"
                        className={inputBaseClass}
                        required
                      />
                    </div>

                    <div className="rounded-[4px] border border-[#d5d9d9] bg-[#fafafa] px-3 py-2 text-[12px] text-[#565959]">
                      <span className="font-bold text-[#0f1111]">Current coordinates:</span>{" "}
                      {formData.location.lat.toFixed(6)}, {formData.location.lng.toFixed(6)}
                    </div>
                    
                    {/* Amazon Style Info Box */}
                    <div className="p-4 bg-[#f0f2f2] border border-[#d5d9d9] rounded-[4px] flex items-start gap-3 mt-4">
                      <Info className="h-5 w-5 text-[#007185] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-[13px] font-bold text-[#0f1111] mb-1">Automatic Geolocation</h4>
                        <p className="text-[13px] text-[#565959] leading-relaxed">
                          Click "Use my current location" to save your real GPS coordinates. This helps place you accurately on the customer map.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: MEDIA & STATUS */}
              <div className="space-y-6">
                
                {/* Image Upload Card */}
                <div className={cardBaseClass}>
                  <h3 className="font-bold text-[16px] text-[#0f1111] mb-4">Profile Image</h3>
                  <div className="flex flex-col items-center">
                    <div className="h-32 w-32 rounded-[4px] bg-[#f8f8f8] flex items-center justify-center border border-[#d5d9d9] mb-3 relative overflow-hidden group">
                      {formData.profileImage ? (
                        <img src={formData.profileImage} alt="Profile preview" className="h-full w-full object-cover" />
                      ) : (
                        <Camera className="h-8 w-8 text-[#565959]" />
                      )}
                      <Input
                        ref={imageInputRef}
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => imageInputRef.current?.click()}
                      className="text-[#007185] hover:text-[#c40000] hover:underline text-[13px] cursor-pointer mb-2 flex items-center gap-1 disabled:opacity-60"
                    >
                      {uploadingImage ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                      {uploadingImage ? "Uploading..." : "Upload new image"}
                    </button>
                    <p className="text-[11px] text-center text-[#565959]">
                      Upload a professional photo or business logo. <br/> JPEG or PNG. Max 5MB.
                    </p>
                  </div>
                </div>

                {/* Status Card */}
                <div className={cardBaseClass}>
                  <h3 className="font-bold text-[16px] text-[#0f1111] mb-4">Service Status</h3>
                  <div className="space-y-4">
                    
                    {/* Amazon Green Status */}
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-[#007600]" />
                      <span className="text-[14px] font-bold text-[#007600]">Active</span>
                    </div>
                    
                    <p className="text-[13px] text-[#565959] leading-relaxed">
                      Your profile is currently visible on the map and accepting new bookings.
                    </p>
                    
                    <Button 
                      type="button"
                      variant="outline" 
                      className="w-full bg-white hover:bg-gray-50 text-[#0f1111] border border-[#d5d9d9] rounded-[8px] h-[31px] text-[13px] font-normal shadow-sm mt-2"
                    >
                      Go Offline
                    </Button>
                  </div>
                </div>
              </div>

            </div>
          </form>
        </main>
      </div>
      <Footer />
    </AuthGuard>
  );
}