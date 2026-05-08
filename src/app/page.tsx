"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  MapPin, Search, Star, ShieldCheck, Calendar, MessageSquare,
  Stethoscope, Wrench, Pill, ShoppingBag, UtensilsCrossed, Scissors,
  Dumbbell, GraduationCap, ArrowRight, Sparkles, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";

const categories = [
  { Icon: Stethoscope, name: "Doctors", desc: "Clinics & specialists", color: "from-blue-500 to-cyan-400" },
  { Icon: Wrench, name: "Mechanics", desc: "Auto repair & roadside", color: "from-orange-500 to-amber-400" },
  { Icon: Pill, name: "Pharmacies", desc: "Medication & supplies", color: "from-green-500 to-emerald-400" },
  { Icon: ShoppingBag, name: "Stores", desc: "Local retail & shops", color: "from-purple-500 to-violet-400" },
  { Icon: UtensilsCrossed, name: "Restaurants", desc: "Dining & takeaway", color: "from-red-500 to-rose-400" },
  { Icon: Scissors, name: "Beauty & Spa", desc: "Salons & wellness", color: "from-pink-500 to-fuchsia-400" },
  { Icon: Dumbbell, name: "Fitness", desc: "Gyms & trainers", color: "from-indigo-500 to-blue-400" },
  { Icon: GraduationCap, name: "Tutors", desc: "Lessons & coaching", color: "from-teal-500 to-cyan-400" },
];

const features = [
  { Icon: MapPin, title: "Smart proximity map", desc: "Real-time discovery of trusted services near you, with smart filters and clustering." },
  { Icon: Calendar, title: "Instant bookings", desc: "Pick a slot and confirm in seconds. Live availability and status updates baked in." },
  { Icon: MessageSquare, title: "Built-in chat", desc: "Message providers directly. Share details, photos and confirm before you arrive." },
  { Icon: Star, title: "Verified reviews", desc: "Only people who actually booked can review — so the ratings you read are real." },
  { Icon: ShieldCheck, title: "Approved providers", desc: "Every provider goes through admin review before going live on the platform." },
  { Icon: Sparkles, title: "Personalized for you", desc: "Save favorites, get notified, and discover better matches as you use the app." },
];

const steps = [
  { step: "01", Icon: Search, title: "Discover nearby", desc: "Browse the live map and filter by category, distance, rating and availability." },
  { step: "02", Icon: Calendar, title: "Book instantly", desc: "Pick a time that works. The provider confirms in real time through the app." },
  { step: "03", Icon: Star, title: "Rate & repeat", desc: "Leave a verified review and save your favorites for quick future access." },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-grow">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-hero">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-black/10 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="text-white"
              >
                <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium mb-6 border border-white/20">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  Smart local services platform
                </div>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-5">
                  Trusted services,{" "}
                  <span className="text-amber-300">right around</span>{" "}
                  the corner.
                </h1>
                <p className="text-lg text-white/80 max-w-lg mb-8 leading-relaxed">
                  Servexia connects you with verified local professionals. Discover doctors, mechanics, and shops on an interactive map, book instantly, and chat in real-time.
                </p>
                <div className="flex flex-wrap gap-3 mb-10">
                  <Button asChild size="lg" className="bg-white hover:bg-white/90 text-[oklch(0.48_0.14_195)] font-semibold rounded-2xl px-7 shadow-xl shadow-black/20">
                    <Link href="/register">
                      Get started free <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30 rounded-2xl px-7 backdrop-blur-sm">
                    <a href="#how">How it works</a>
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-6 text-sm text-white/70">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
                    <span>4.9 average rating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-300" />
                    <span>Vetted providers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                    <span>Free to join</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative hidden lg:block"
              >
                <div className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl shadow-black/30 bg-white/10 backdrop-blur-sm p-2">
                  <Image
                    src="/hero-map.jpg"
                    alt="Servexia Map Interface"
                    width={800}
                    height={600}
                    priority
                    className="w-full h-auto object-cover rounded-2xl"
                  />
                </div>
                {/* Floating stat cards */}
                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-3 shadow-xl flex items-center gap-3 animate-float">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Bookings today</p>
                    <p className="font-bold text-slate-900">1,240+</p>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-3 shadow-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Star className="h-5 w-5 text-amber-600 fill-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Average rating</p>
                    <p className="font-bold text-slate-900">4.9 / 5.0</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CATEGORIES SECTION */}
        <section id="categories" className="py-16 lg:py-24 bg-background">
          <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
                Browse by category
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                From healthcare to fitness — find the service you need, right where you are.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {categories.map((c, i) => (
                <motion.div
                  key={c.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  viewport={{ once: true }}
                >
                  <div className="group bg-card hover:shadow-card border border-border rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-primary/20">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <c.Icon className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-bold text-base text-foreground mb-1">{c.name}</h4>
                    <p className="text-xs text-muted-foreground">{c.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="py-16 lg:py-24 bg-gradient-soft">
          <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
                Find. Book. Done.
              </h2>
              <p className="text-muted-foreground text-lg">Three simple steps to get the help you need.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((s, i) => (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-[calc(100%-2rem)] w-[calc(100%-1rem)] h-px bg-gradient-to-r from-primary/30 to-transparent" />
                  )}
                  <div className="bg-card border border-border rounded-3xl p-7 shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-[oklch(0.48_0.14_195)] flex items-center justify-center shadow-lg">
                        <s.Icon className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-4xl font-black text-primary/15">{s.step}</span>
                    </div>
                    <h4 className="font-bold text-xl text-foreground mb-2">{s.title}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="py-16 lg:py-24 bg-background">
          <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
                Why people choose Servexia
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Everything you need to find, book, and manage local services — in one place.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  viewport={{ once: true }}
                  className="bg-card border border-border rounded-2xl p-6 shadow-card hover:shadow-elegant hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="w-11 h-11 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
                    <f.Icon className="h-5 w-5 text-teal-700" />
                  </div>
                  <h4 className="font-bold text-base text-foreground mb-2">{f.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* PROVIDER CTA */}
        <section id="providers" className="py-16 lg:py-24 bg-gradient-soft">
          <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-hero rounded-3xl overflow-hidden shadow-2xl shadow-primary/20">
              <div className="grid lg:grid-cols-2 gap-0">
                <div className="p-10 lg:p-16 flex flex-col justify-center text-white">
                  <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium mb-6 border border-white/20 w-fit">
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    Grow your business
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                    Join the Servexia network of local professionals.
                  </h2>
                  <p className="text-white/80 mb-8 leading-relaxed text-lg max-w-md">
                    Reach more customers in your area, manage your schedule with ease, and build your reputation with verified reviews.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild size="lg" className="bg-white hover:bg-white/90 text-[oklch(0.48_0.14_195)] font-semibold rounded-2xl px-7 shadow-xl shadow-black/20">
                      <Link href="/register?role=provider">Register as Provider</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30 rounded-2xl px-7">
                      <Link href="/login">Provider Login</Link>
                    </Button>
                  </div>
                </div>
                <div className="hidden lg:flex items-center justify-center p-16 bg-black/10">
                  <div className="text-center text-white">
                    <div className="w-32 h-32 rounded-3xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto mb-6 shadow-2xl">
                      <ShieldCheck className="h-16 w-16 text-white" />
                    </div>
                    <p className="text-2xl font-bold mb-1">Start earning today</p>
                    <p className="text-white/70">Join thousands of professionals</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
