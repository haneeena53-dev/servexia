"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      toast.error(error.message || "Google sign in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Logo */}
      <Link href="/" className="flex items-center justify-center gap-2.5 mb-8 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[oklch(0.48_0.14_195)] to-[oklch(0.6_0.14_188)] flex items-center justify-center shadow-lg">
          <MapPin className="h-5 w-5 text-white" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-slate-900">Servexia</span>
      </Link>

      {/* Card */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="h-11 rounded-xl border-slate-200 focus-visible:ring-[oklch(0.48_0.14_195)] focus-visible:border-[oklch(0.48_0.14_195)] bg-slate-50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                Password
              </Label>
              <Link href="#" className="text-xs text-[oklch(0.48_0.14_195)] hover:underline font-medium">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="h-11 rounded-xl border-slate-200 focus-visible:ring-[oklch(0.48_0.14_195)] focus-visible:border-[oklch(0.48_0.14_195)] bg-slate-50 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 rounded-xl bg-[oklch(0.48_0.14_195)] hover:bg-[oklch(0.42_0.14_195)] text-white font-semibold shadow-lg shadow-[oklch(0.48_0.14_195)]/20 transition-all"
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Sign in
          </Button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-white text-slate-400 font-medium">or continue with</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full h-11 rounded-xl border-slate-200 hover:bg-slate-50 font-medium text-slate-700"
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

        <p className="text-center text-xs text-slate-400 mt-5 leading-relaxed">
          By continuing, you agree to our{" "}
          <Link href="#" className="text-[oklch(0.48_0.14_195)] hover:underline">Terms</Link>
          {" "}and{" "}
          <Link href="#" className="text-[oklch(0.48_0.14_195)] hover:underline">Privacy Policy</Link>
        </p>
      </div>

      <p className="text-center text-sm text-slate-500 mt-6">
        New to Servexia?{" "}
        <Link href="/register" className="font-semibold text-[oklch(0.48_0.14_195)] hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Subtle background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[oklch(0.48_0.14_195)]/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[oklch(0.72_0.18_55)]/5 blur-3xl" />
      </div>

      <main className="flex-grow flex items-center justify-center px-4 py-16 relative">
        <Suspense fallback={
          <div className="w-full max-w-sm">
            <div className="h-12 w-32 bg-slate-200 mx-auto mb-8 rounded-xl animate-pulse" />
            <div className="bg-white rounded-3xl p-8 space-y-4 shadow-xl border border-slate-100">
              <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
              <div className="h-11 bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-11 bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-11 bg-[oklch(0.48_0.14_195)]/10 rounded-xl animate-pulse" />
            </div>
          </div>
        }>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
