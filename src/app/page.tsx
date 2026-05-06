"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  MapPin, Search, Star, ShieldCheck, Calendar, MessageSquare, 
  Stethoscope, Wrench, Pill, ShoppingBag, UtensilsCrossed, Scissors, 
  Dumbbell, GraduationCap, ArrowRight, Sparkles 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";

const categories = [
  { Icon: Stethoscope, name: "Doctors", desc: "Clinics & specialists" },
  { Icon: Wrench, name: "Mechanics", desc: "Auto repair & roadside" },
  { Icon: Pill, name: "Pharmacies", desc: "Medication & supplies" },
  { Icon: ShoppingBag, name: "Stores", desc: "Local retail & shops" },
  { Icon: UtensilsCrossed, name: "Restaurants", desc: "Dining & takeaway" },
  { Icon: Scissors, name: "Beauty & Spa", desc: "Salons & wellness" },
  { Icon: Dumbbell, name: "Fitness", desc: "Gyms & trainers" },
  { Icon: GraduationCap, name: "Tutors", desc: "Lessons & coaching" },
];

const features = [
  { Icon: MapPin, title: "Smart proximity map", desc: "Real-time discovery of trusted services near you, with smart filters and clustering." },
  { Icon: Calendar, title: "Instant bookings", desc: "Pick a slot and confirm in seconds. Live availability and status updates baked in." },
  { Icon: MessageSquare, title: "Built-in chat", desc: "Message providers directly. Share details, photos and confirm before you arrive." },
  { Icon: Star, title: "Verified reviews", desc: "Only people who actually booked can review — so the ratings you read are real." },
  { Icon: ShieldCheck, title: "Approved providers", desc: "Every provider goes through admin review before going live on the platform." },
  { Icon: Sparkles, title: "Personalized for you", desc: "Save favorites, get notified, and discover better matches as you use the app." },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

<main className="flex-grow bg-[#eaeded] text-[#0f1111]">
      {/* HERO SECTION (Amazon Style Banner) */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#232f3e] to-[#141b24] pt-12 pb-32 lg:pt-20 lg:pb-48">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8 relative grid lg:grid-cols-2 gap-8 items-center text-white">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.2] mb-4">
              Trusted services, <br />
              <span className="text-[#febd69]">right around the corner.</span>
            </h1>
            <p className="text-base md:text-lg text-gray-300 max-w-xl mb-8">
              Servexia connects you with verified local professionals. Discover
              doctors, mechanics, and shops on an interactive map, book
              instantly, and chat in real-time.
            </p>
            <div className="flex flex-wrap gap-3">
              {/* Amazon Primary Yellow Button */}
              <Button
                asChild
                className="bg-[#ffd814] hover:bg-[#f7ca00] text-black rounded-full px-6 py-6 font-medium shadow-sm transition-colors border border-[#fcd200]"
              >
                <Link href="/register">
                  Get started free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              {/* Amazon Secondary Button */}
              <Button
                asChild
                className="bg-white hover:bg-gray-50 text-black rounded-full px-6 py-6 font-medium shadow-sm border border-gray-300 transition-colors"
              >
                <a href="#how">How it works</a>
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-gray-300 font-medium">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-[#ffa41c] text-[#ffa41c]" /> 4.9
                average rating
              </div>
              <div className="flex items-center gap-1">
                <ShieldCheck className="h-5 w-5 text-[#00a8e1]" /> Vetted
                providers
              </div>
            </div>
          </motion.div>

          {/* Hero Image Area (Clean, no extreme blurs) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative rounded-lg overflow-hidden border border-gray-700 bg-white p-2">
              <Image
                src="/hero-map.jpg"
                alt="Servexia Map Interface"
                width={800}
                height={600}
                priority
                className="w-full h-auto object-cover rounded"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* CATEGORIES SECTION (Amazon Overlapping Cards) */}
      <section id="categories" className="relative mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8 -mt-20 lg:-mt-32 z-10 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="h-full"
            >
              <div className="bg-white p-5 h-full flex flex-col cursor-pointer border border-transparent hover:border-gray-300 shadow-sm transition-all rounded-[4px]">
                <h4 className="font-bold text-xl mb-3 text-[#0f1111]">
                  {c.name}
                </h4>
                <div className="flex-grow flex flex-col items-center justify-center py-6 bg-gray-50 mb-4 rounded-md group">
                  <div className="h-16 w-16 text-[#007185] group-hover:scale-110 transition-transform">
                    {c.Icon && <c.Icon className="h-full w-full" />}
                  </div>
                  <p className="text-sm text-gray-500 mt-4 text-center px-2 line-clamp-2">
                    {c.desc}
                  </p>
                </div>
                {/* Amazon classic blue link */}
                <span className="text-[#007185] hover:text-[#c40000] hover:underline text-sm font-medium mt-auto block">
                  Explore category
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS (Amazon "Discover" Style Row) */}
      <section id="how" className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-white p-6 rounded-[4px] shadow-sm">
          <h3 className="text-2xl font-bold tracking-tight mb-6 text-[#0f1111]">
            Find. Book. Done.
          </h3>
          <div className="grid md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            {[
              {
                step: "1",
                Icon: Search,
                title: "Discover nearby",
                desc: "Browse the live map and filter by category, distance, rating and availability.",
              },
              {
                step: "2",
                Icon: Calendar,
                title: "Book instantly",
                desc: "Pick a time that works. The provider confirms in real time through the app.",
              },
              {
                step: "3",
                Icon: Star,
                title: "Rate & repeat",
                desc: "Leave a verified review and save your favorites for quick future access.",
              },
            ].map((s, i) => (
              <div key={s.step} className="flex flex-col pt-6 md:pt-0 md:px-6 first:md:pl-0 last:md:pr-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-[#f2f4f8] text-[#0f1111] font-bold flex items-center justify-center text-lg border border-gray-200">
                    {s.step}
                  </div>
                  <h4 className="font-bold text-lg text-[#0f1111]">
                    {s.title}
                  </h4>
                </div>
                <p className="text-sm text-[#565959] leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION (Amazon standard grid) */}
      <section className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-white p-6 rounded-[4px] shadow-sm">
          <h3 className="text-2xl font-bold tracking-tight mb-6 text-[#0f1111]">
            Why people choose Servexia
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
            {features?.map((f, i) => (
              <div key={f.title} className="flex gap-4 items-start">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-[#232f3e]">
                  {f.Icon && <f.Icon className="h-6 w-6" />}
                </div>
                <div>
                  <h4 className="font-bold text-base mb-1 text-[#0f1111]">{f.title}</h4>
                  <p className="text-sm text-[#565959]">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROVIDER CTA (Amazon "Sell on Amazon" promotional style) */}
      <section id="providers" className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-white rounded-[4px] shadow-sm border border-gray-200 overflow-hidden flex flex-col lg:flex-row">
          {/* Left Side: Content */}
          <div className="p-8 lg:p-12 lg:w-2/3 bg-gradient-to-br from-white to-gray-50 flex flex-col justify-center">
            <span className="text-sm font-bold text-[#c40000] uppercase tracking-wider mb-2">
              Grow your business
            </span>
            <h2 className="text-3xl font-bold text-[#0f1111] mb-4">
              Join the Servexia network of local professionals.
            </h2>
            <p className="text-base text-[#565959] mb-8 max-w-2xl">
              Reach more customers in your area, manage your schedule with ease,
              and build your reputation with verified reviews and real-time
              messaging.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                asChild
                className="bg-[#ffd814] hover:bg-[#f7ca00] text-black rounded-full px-8 py-5 text-sm font-medium shadow-sm transition-colors border border-[#fcd200]"
              >
                <Link href="/register?role=provider">
                  Register as Provider
                </Link>
              </Button>
              <Button
                asChild
                className="bg-white hover:bg-gray-50 text-black rounded-full px-8 py-5 text-sm font-medium shadow-sm border border-gray-300 transition-colors"
              >
                <Link href="/login">Provider Login</Link>
              </Button>
            </div>
          </div>
          {/* Right Side: Image/Graphic placeholder */}
          <div className="lg:w-1/3 bg-[#f2f4f8] p-8 flex items-center justify-center border-t lg:border-t-0 lg:border-l border-gray-200">
            <div className="text-center">
              <ShieldCheck className="h-24 w-24 mx-auto text-[#00a8e1] mb-4 opacity-80" />
              <p className="font-bold text-[#0f1111]">Start earning today</p>
            </div>
          </div>
        </div>
      </section>
    </main>

      <Footer />
    </div>
  );
}
