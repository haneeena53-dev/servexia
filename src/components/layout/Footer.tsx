"use client";

import Link from "next/link";
import { MapPin, Globe, Send, Camera, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  return (
    <footer className="w-full bg-[#0f172a] text-white">
      {/* Main footer content */}
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shadow-md">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">Servexia</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-6">
              Discover trusted local service providers on an interactive map. Book instantly, chat in real-time, and read verified reviews.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Globe, label: "Facebook" },
                { icon: Send, label: "Twitter" },
                { icon: Camera, label: "Instagram" },
                { icon: Briefcase, label: "LinkedIn" },
              ].map(({ icon: Icon, label }) => (
                <a key={label} href="#" title={label}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-accent transition-colors flex items-center justify-center">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links columns */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-white">Platform</h3>
            <ul className="space-y-3">
              {[
                { label: "How it works", href: "/#how" },
                { label: "Service categories", href: "/#categories" },
                { label: "Smart map", href: "/map" },
                { label: "About Servexia", href: "#" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-slate-400 hover:text-white text-sm transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-4 text-white">For Providers</h3>
            <ul className="space-y-3">
              {[
                { label: "Join as provider", href: "/register?role=provider" },
                { label: "Provider login", href: "/login" },
                { label: "Resource center", href: "#" },
                { label: "Grow your brand", href: "#" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-slate-400 hover:text-white text-sm transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-white">Stay updated</h3>
            <p className="text-slate-400 text-sm mb-4">
              Get the latest updates on new features and local providers.
            </p>
            <form className="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                placeholder="your@email.com"
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 rounded-xl focus-visible:ring-accent"
              />
              <Button
                type="submit"
                className="bg-accent hover:bg-accent/90 text-white rounded-xl font-medium"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Servexia. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
