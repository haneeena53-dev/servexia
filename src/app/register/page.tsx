"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Loader2, User, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { AppRole } from "@/types";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp } = useAuth();
  
  const initialRole = (searchParams.get("role") as AppRole) || "user";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<AppRole>(initialRole);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Passwords must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, displayName, role);
      toast.success(
        role === "provider" 
          ? "Account created! Now set up your provider profile." 
          : "Welcome to Servexia!"
      );
      
      if (role === "provider") {
        router.push("/provider/profile-editor");
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  // Amazon standard input styling
  const inputBaseClass = "w-full h-[31px] px-3 py-1 border border-[#a6a6a6] rounded-[3px] focus-visible:ring-0 focus-visible:outline-none focus-visible:border-[#e77600] focus-visible:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] text-[13px]";
  const labelBaseClass = "block text-[13px] font-bold text-[#111] mb-1";

  return (
    <div className="w-full max-w-[350px] mx-auto flex flex-col items-center z-10">
      
      {/* Amazon-style Minimal Logo */}
      <Link href="/" className="mb-6 flex items-center gap-1 group">
        <MapPin className="h-8 w-8 text-[#0f1111]" />
        <span className="text-[28px] font-bold tracking-tighter text-[#0f1111]">
          Servexia
        </span>
      </Link>

      {/* Register Card */}
      <div className="w-full border border-[#ddd] rounded-[8px] p-6 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.02)] text-[#0f1111]">
        <h1 className="text-[28px] font-normal mb-4 leading-tight">Create account</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Amazon-style Role Selector (Looks like shipping/payment options) */}
          <div className="space-y-2 mb-2">
            <Label className={labelBaseClass}>I am a...</Label>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setRole("user")}
                className={cn(
                  "relative flex items-center p-2 border rounded-[8px] cursor-pointer transition-colors",
                  role === "user" 
                    ? "border-[#e77600] bg-[#fcf5ee]" 
                    : "border-[#d5d9d9] hover:bg-gray-50"
                )}
              >
                <div className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    checked={role === "user"} 
                    readOnly
                    className="accent-[#e77600] h-4 w-4"
                  />
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-[#0f1111] flex items-center gap-1">
                      <User className="h-3.5 w-3.5" /> Customer
                    </span>
                  </div>
                </div>
              </div>

              <div
                onClick={() => setRole("provider")}
                className={cn(
                  "relative flex items-center p-2 border rounded-[8px] cursor-pointer transition-colors",
                  role === "provider" 
                    ? "border-[#e77600] bg-[#fcf5ee]" 
                    : "border-[#d5d9d9] hover:bg-gray-50"
                )}
              >
                <div className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    checked={role === "provider"} 
                    readOnly
                    className="accent-[#e77600] h-4 w-4"
                  />
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-[#0f1111] flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5" /> Provider
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="displayName" className={labelBaseClass}>Your name</Label>
            <Input 
              id="displayName" 
              type="text" 
              placeholder="First and last name"
              className={inputBaseClass}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="email" className={labelBaseClass}>Email</Label>
            <Input 
              id="email" 
              type="email" 
              className={inputBaseClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password" className={labelBaseClass}>Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="At least 6 characters"
              className={inputBaseClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="text-[12px] text-[#0f1111] mt-1 flex items-center">
              <span className="text-[#007185] mr-1 text-base leading-none">i</span> 
              Passwords must be at least 6 characters.
            </p>
          </div>
          
          <Button 
            type="submit" 
            className="w-full mt-4 bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] border border-[#fcd200] rounded-[8px] h-[34px] text-[13px] font-normal shadow-sm transition-colors" 
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Continue
          </Button>

          <div className="mt-4 text-[12px] text-[#0f1111] leading-relaxed">
            By creating an account, you agree to Servexia's{" "}
            <Link href="#" className="text-[#007185] hover:text-[#c40000] hover:underline">
              Conditions of Use
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-[#007185] hover:text-[#c40000] hover:underline">
              Privacy Notice
            </Link>.
          </div>

          <div className="mt-6 pt-4 border-t border-[#e7e7e7]">
            <p className="text-[13px] text-[#0f1111] font-bold">
              Already have an account?{" "}
              <Link href="/login" className="text-[#007185] hover:text-[#c40000] hover:underline font-normal flex items-center inline-flex">
                Sign in <span className="text-[10px] ml-1">▶</span>
              </Link>
            </p>
          </div>
        </form>
      </div>

      {/* Minimal Footer for Auth Pages */}
      <div className="mt-10 border-t border-[#e7e7e7] pt-8 w-full max-w-[400px] flex flex-col items-center justify-center gap-2">
        <div className="flex gap-6 text-[11px] text-[#007185]">
          <Link href="#" className="hover:text-[#c40000] hover:underline">Conditions of Use</Link>
          <Link href="#" className="hover:text-[#c40000] hover:underline">Privacy Notice</Link>
          <Link href="#" className="hover:text-[#c40000] hover:underline">Help</Link>
        </div>
        <p className="text-[11px] text-[#565959]">
          © {new Date().getFullYear()}, Servexia.com, Inc. or its affiliates
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    // Clean white background like Amazon
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-grow flex items-start justify-center p-4 pt-8 pb-24">
        <Suspense fallback={
          <div className="w-full max-w-[350px] p-8 animate-pulse bg-white border border-gray-200 rounded-[8px]">
            <div className="h-8 w-24 bg-gray-200 mx-auto mb-6 rounded" />
            <div className="h-8 w-40 bg-gray-200 mb-6 rounded" />
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="h-10 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
            <div className="space-y-4">
              <div className="h-10 w-full bg-gray-200 rounded" />
              <div className="h-10 w-full bg-gray-200 rounded" />
              <div className="h-10 w-full bg-gray-200 rounded" />
            </div>
          </div>
        }>
          <RegisterForm />
        </Suspense>
      </main>
    </div>
  );
}