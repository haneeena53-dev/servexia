"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Loader2, User, Briefcase, Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
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
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, displayName, role);
      toast.success(role === "provider" ? "Account created! Set up your profile." : "Welcome to Servexia!");
      router.push(role === "provider" ? "/provider/profile-editor" : "/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "h-11 rounded-xl border-slate-200 focus-visible:ring-[oklch(0.48_0.14_195)] focus-visible:border-[oklch(0.48_0.14_195)] bg-slate-50";

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Logo */}
      <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[oklch(0.48_0.14_195)] to-[oklch(0.6_0.14_188)] flex items-center justify-center shadow-lg">
          <MapPin className="h-5 w-5 text-white" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-slate-900">Servexia</span>
      </Link>

      {/* Card */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Create account</h1>
          <p className="text-slate-500 text-sm mt-1">Join thousands of users on Servexia</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">I am a...</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "user" as AppRole, label: "Customer", Icon: User, desc: "Find services" },
                { value: "provider" as AppRole, label: "Provider", Icon: Briefcase, desc: "Offer services" },
              ].map(({ value, label, Icon, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  className={cn(
                    "flex flex-col items-start gap-1 p-3 rounded-xl border-2 transition-all text-left",
                    role === value
                      ? "border-[oklch(0.48_0.14_195)] bg-[oklch(0.48_0.14_195)]/5"
                      : "border-slate-200 hover:border-slate-300 bg-slate-50"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    role === value ? "bg-[oklch(0.48_0.14_195)] text-white" : "bg-slate-200 text-slate-600"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={cn("text-sm font-semibold", role === value ? "text-[oklch(0.48_0.14_195)]" : "text-slate-700")}>
                    {label}
                  </span>
                  <span className="text-xs text-slate-400">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="displayName" className="text-sm font-semibold text-slate-700">Full name</Label>
            <Input
              id="displayName"
              type="text"
              placeholder="Mohamed Ahmed"
              className={inputClass}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                className={cn(inputClass, "pr-10")}
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
            className="w-full h-11 rounded-xl bg-[oklch(0.48_0.14_195)] hover:bg-[oklch(0.42_0.14_195)] text-white font-semibold shadow-lg shadow-[oklch(0.48_0.14_195)]/20 transition-all mt-2"
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Create account
          </Button>

          <p className="text-center text-xs text-slate-400 leading-relaxed">
            By creating an account, you agree to our{" "}
            <Link href="#" className="text-[oklch(0.48_0.14_195)] hover:underline">Terms</Link>
            {" "}and{" "}
            <Link href="#" className="text-[oklch(0.48_0.14_195)] hover:underline">Privacy Policy</Link>
          </p>
        </form>
      </div>

      <p className="text-center text-sm text-slate-500 mt-6">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[oklch(0.48_0.14_195)] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[oklch(0.48_0.14_195)]/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[oklch(0.72_0.18_55)]/5 blur-3xl" />
      </div>

      <main className="flex-grow flex items-center justify-center px-4 py-12 relative">
        <Suspense fallback={
          <div className="w-full max-w-sm">
            <div className="h-12 w-32 bg-slate-200 mx-auto mb-8 rounded-xl animate-pulse" />
            <div className="bg-white rounded-3xl p-8 space-y-4 shadow-xl border border-slate-100">
              <div className="h-6 w-40 bg-slate-200 rounded animate-pulse" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-20 bg-slate-100 rounded-xl animate-pulse" />
                <div className="h-20 bg-slate-100 rounded-xl animate-pulse" />
              </div>
              <div className="h-11 bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-11 bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-11 bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-11 bg-[oklch(0.48_0.14_195)]/10 rounded-xl animate-pulse" />
            </div>
          </div>
        }>
          <RegisterForm />
        </Suspense>
      </main>
    </div>
  );
}
