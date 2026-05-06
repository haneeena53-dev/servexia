"use client";

import Link from "next/link";
import { MapPin, Globe, Send, Camera, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full text-white text-[14px]">
      {/* --- Back to Top Bar --- */}
      <div 
        onClick={scrollToTop}
        className="w-full bg-[#37475a] hover:bg-[#485769] py-4 text-center cursor-pointer transition-colors"
      >
        <span className="text-[13px] font-medium">Back to top</span>
      </div>

      {/* --- Main Links Section --- */}
      <div className="bg-[#232f3e] w-full py-10">
        <div className="mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
            
            {/* Column 1: Get to Know Us */}
            <div>
              <h3 className="font-bold mb-3 text-base">Get to Know Us</h3>
              <ul className="space-y-2.5">
                <li><Link href="/#how" className="text-[#dddddd] hover:underline text-sm">How Servexia Works</Link></li>
                <li><Link href="/#categories" className="text-[#dddddd] hover:underline text-sm">Service Categories</Link></li>
                <li><Link href="/map" className="text-[#dddddd] hover:underline text-sm">Smart Map Features</Link></li>
                <li><Link href="#" className="text-[#dddddd] hover:underline text-sm">About Servexia</Link></li>
              </ul>
            </div>

            {/* Column 2: Make Money with Us (Providers) */}
            <div>
              <h3 className="font-bold mb-3 text-base">Make Money with Us</h3>
              <ul className="space-y-2.5">
                <li><Link href="/register?role=provider" className="text-[#dddddd] hover:underline text-sm">Join as Provider</Link></li>
                <li><Link href="/login" className="text-[#dddddd] hover:underline text-sm">Provider Login</Link></li>
                <li><Link href="#" className="text-[#dddddd] hover:underline text-sm">Resource Center</Link></li>
                <li><Link href="#" className="text-[#dddddd] hover:underline text-sm">Protect and build your brand</Link></li>
              </ul>
            </div>

            {/* Column 3: Connect with Us */}
            <div>
              <h3 className="font-bold mb-3 text-base">Connect with Us</h3>
              <ul className="space-y-2.5">
                <li>
                  <a href="#" className="text-[#dddddd] hover:underline text-sm flex items-center gap-2">
                    <Globe className="h-4 w-4" /> Facebook
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[#dddddd] hover:underline text-sm flex items-center gap-2">
                    <Send className="h-4 w-4" /> Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[#dddddd] hover:underline text-sm flex items-center gap-2">
                    <Camera className="h-4 w-4" /> Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[#dddddd] hover:underline text-sm flex items-center gap-2">
                    <Briefcase className="h-4 w-4" /> LinkedIn
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Newsletter (Adapted for Amazon style) */}
            <div>
              <h3 className="font-bold mb-3 text-base">Stay Updated</h3>
              <p className="text-[#dddddd] text-sm mb-3">
                Get the latest updates on new features and local providers.
              </p>
              <form className="flex flex-col gap-2">
                <Input 
                  type="email" 
                  placeholder="Email address" 
                  className="bg-white text-black border-gray-300 rounded-[3px] focus-visible:ring-[#f08804]"
                />
                <Button 
                  type="button" 
                  className="bg-[#ffd814] hover:bg-[#f7ca00] text-black border border-[#fcd200] rounded-[3px] font-normal"
                >
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* --- Logo & Region Selector --- */}
        <div className="mt-10 border-t border-[#3a4553] pt-8 flex flex-col md:flex-row items-center justify-center gap-6">
          <Link href="/" className="flex items-center gap-1 group">
            <MapPin className="h-7 w-7 text-white" />
            <span className="text-2xl font-bold tracking-tight">Servexia</span>
          </Link>
          
          <div className="flex gap-2 text-[13px]">
            <div className="border border-[#848688] rounded-[3px] px-3 py-1.5 flex items-center gap-2 cursor-pointer hover:border-white transition-colors">
              <Globe className="h-4 w-4" /> English
            </div>
            <div className="border border-[#848688] rounded-[3px] px-3 py-1.5 flex items-center gap-2 cursor-pointer hover:border-white transition-colors">
              <span className="font-bold">EGP</span> - Egyptian Pound
            </div>
            <div className="border border-[#848688] rounded-[3px] px-3 py-1.5 flex items-center gap-2 cursor-pointer hover:border-white transition-colors">
              <MapPin className="h-4 w-4" /> Egypt
            </div>
          </div>
        </div>
      </div>

      {/* --- Footer Bottom (Legal & Copyright) --- */}
      <div className="bg-[#131921] w-full py-8 px-4 flex flex-col items-center">
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-[12px] text-[#dddddd] mb-2 font-medium">
          <Link href="#" className="hover:underline">Conditions of Use</Link>
          <Link href="#" className="hover:underline">Privacy Notice</Link>
          <Link href="#" className="hover:underline">Consumer Health Data Privacy Disclosure</Link>
          <Link href="#" className="hover:underline">Your Ads Privacy Choices</Link>
        </div>
        <p className="text-[12px] text-[#dddddd]">
          &copy; {new Date().getFullYear()}, Servexia.com, Inc. or its affiliates
        </p>
      </div>
    </footer>
  );
}