"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
// ملحوظة: عادة أمازون بتخفي الـ Header والـ Footer الأساسيين في صفحة تسجيل الدخول
// لكن لو حابب تسيبهم، أنا شلتهم من العرض هنا عشان نديك إحساس أمازون الحقيقي 
// وممكن ترجعهم لو المشروع بيفرض ده.

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signInWithGoogle } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const returnUrl = searchParams.get("returnUrl") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      toast.success("Welcome back!");
      router.push(returnUrl);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Signed in successfully!");
      router.push(returnUrl);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Google sign in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[350px] mx-auto flex flex-col items-center z-10">
      
      {/* Amazon-style Logo Header */}
      <Link href="/" className="mb-6 flex items-center gap-1 group">
        <MapPin className="h-8 w-8 text-[#0f1111]" />
        <span className="text-[28px] font-bold tracking-tighter text-[#0f1111]">
          Servexia
        </span>
      </Link>

      {/* Login Card */}
      <div className="w-full border border-[#ddd] rounded-[8px] p-6 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.02)] text-[#0f1111]">
        <h1 className="text-[28px] font-normal mb-4">Sign in</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email" className="block text-[13px] font-bold text-[#111]">
              Email or mobile phone number
            </Label>
            {/* Amazon-style Input with Orange Focus */}
            <Input 
              id="email" 
              type="email" 
              className="w-full h-[31px] px-3 py-1 border border-[#a6a6a6] rounded-[3px] focus-visible:ring-0 focus-visible:outline-none focus-visible:border-[#e77600] focus-visible:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] text-[13px]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-[13px] font-bold text-[#111]">
                Password
              </Label>
              <Link href="#" className="text-[13px] text-[#007185] hover:text-[#c40000] hover:underline">
                Forgot your password?
              </Link>
            </div>
            <Input 
              id="password" 
              type="password" 
              className="w-full h-[31px] px-3 py-1 border border-[#a6a6a6] rounded-[3px] focus-visible:ring-0 focus-visible:outline-none focus-visible:border-[#e77600] focus-visible:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] text-[13px]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] border border-[#fcd200] rounded-[8px] h-[34px] text-[13px] font-normal shadow-sm transition-colors" 
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Sign in
          </Button>
        </form>

        <p className="text-[12px] mt-4 leading-relaxed text-[#0f1111]">
          By continuing, you agree to Servexia's{" "}
          <Link href="#" className="text-[#007185] hover:text-[#c40000] hover:underline">
            Conditions of Use
          </Link>{" "}
          and{" "}
          <Link href="#" className="text-[#007185] hover:text-[#c40000] hover:underline">
            Privacy Notice
          </Link>.
        </p>

        {/* Alternate Login (Google) */}
        <div className="mt-6 border-t border-[#e7e7e7] pt-4">
          <Button 
            type="button" 
            variant="outline" 
            className="w-full h-[34px] bg-white hover:bg-gray-50 border-[#d5d9d9] rounded-[8px] text-[13px] font-normal shadow-sm" 
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.83z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/>
              </svg>
            )}
            Continue with Google
          </Button>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full flex items-center mt-6 mb-4">
        <div className="flex-grow border-t border-[#e7e7e7]"></div>
        <span className="px-3 text-[12px] text-[#767676] bg-white">New to Servexia?</span>
        <div className="flex-grow border-t border-[#e7e7e7]"></div>
      </div>

      {/* Create Account Button */}
      <Button 
        asChild 
        className="w-full bg-white hover:bg-gray-50 text-[#0f1111] border border-[#d5d9d9] rounded-[8px] h-[34px] text-[13px] font-normal shadow-sm transition-colors"
      >
        <Link href="/register">Create your Servexia account</Link>
      </Button>

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

export default function LoginPage() {
  return (
    // Amazon auth pages are strictly white with no decorative background elements
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-grow flex items-start justify-center p-4 pt-12 pb-24">
        <Suspense fallback={
          <div className="w-full max-w-[350px] p-8 animate-pulse bg-white border border-gray-200 rounded-[8px]">
            <div className="h-8 w-24 bg-gray-200 mx-auto mb-6 rounded" />
            <div className="h-8 w-32 bg-gray-200 mb-6 rounded" />
            <div className="space-y-4">
              <div className="h-8 w-full bg-gray-200 rounded" />
              <div className="h-8 w-full bg-gray-200 rounded" />
              <div className="h-10 w-full bg-gray-200 rounded mt-6" />
            </div>
          </div>
        }>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}