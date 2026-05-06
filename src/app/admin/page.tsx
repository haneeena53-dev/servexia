"use client";

import { useState, useEffect } from "react";
import { 
  Shield, Users, Briefcase, Calendar, 
  CheckCircle2, Clock, BarChart3, Search, Filter, Loader2, 
  ChevronRight
} from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { db, firebaseReady } from "@/lib/firebase/config";
import { collection, query, where, getDocs, limit, orderBy, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import type { ProviderProfile, Category, UserProfile, Booking, ProviderStatus } from "@/types";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function toMillis(value: unknown) {
  if (!value) return 0;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  if (typeof value === "object") {
    const candidate = value as { seconds?: number; toDate?: () => Date };
    if (typeof candidate.toDate === "function") return candidate.toDate().getTime();
    if (typeof candidate.seconds === "number") return candidate.seconds * 1000;
  }
  return 0;
}

function formatStoredDate(value: unknown) {
  const millis = toMillis(value);
  return millis ? formatDate(new Date(millis)) : "—";
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    providers: 0,
    bookings: 0,
    pendingApprovals: 0
  });
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [pendingProviders, setPendingProviders] = useState<ProviderProfile[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryIcon, setCategoryIcon] = useState("briefcase");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [processingProviderId, setProcessingProviderId] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      if (!firebaseReady) {
        setStats({ users: 0, providers: 0, bookings: 0, pendingApprovals: 0 });
        setUsersList([]);
        setPendingProviders([]);
        setRecentBookings([]);
        setCategories([]);
        setLoadError("Firebase is not configured in this environment.");
        setLoading(false);
        return;
      }

      setLoadError(null);
      try {
        const usersQuery = query(collection(db, "users"));
        const providersQuery = query(collection(db, "providers"));
        const bookingsQuery = query(collection(db, "bookings"), orderBy("createdAt", "desc"), limit(5));
        const categoriesQuery = query(collection(db, "categories"), orderBy("order", "asc"));
        const pendingQuery = query(collection(db, "providers"), where("status", "==", "pending"));

        const errors: string[] = [];

        const usersSnap = await getDocs(usersQuery).catch((error) => {
          console.error("Failed to load users", error);
          errors.push("users");
          return null;
        });
        const providersSnap = await getDocs(providersQuery).catch((error) => {
          console.error("Failed to load providers", error);
          errors.push("providers");
          return null;
        });
        const bookingsSnap = await getDocs(bookingsQuery).catch((error) => {
          console.error("Failed to load bookings", error);
          errors.push("bookings");
          return null;
        });
        const categoriesSnap = await getDocs(categoriesQuery).catch((error) => {
          console.error("Failed to load categories", error);
          errors.push("categories");
          return null;
        });
        const pendingSnap = await getDocs(pendingQuery).catch((error) => {
          console.error("Failed to load pending providers", error);
          errors.push("pending approvals");
          return null;
        });

        const users = (usersSnap?.docs || []).map((d) => {
          const data = d.data() as Partial<UserProfile>;
          return {
            uid: d.id,
            email: data.email || "",
            displayName: data.displayName || "User",
            avatarUrl: data.avatarUrl ?? null,
            role: data.role || "user",
            createdAt: data.createdAt || "",
          };
        }).sort((left, right) => toMillis(right.createdAt) - toMillis(left.createdAt));
        const providers = (providersSnap?.docs || []).map((d) => ({ id: d.id, ...d.data() } as ProviderProfile));
        const bookings = (bookingsSnap?.docs || []).map((d) => ({ id: d.id, ...d.data() } as Booking));
        const categoriesData = (categoriesSnap?.docs || []).map((d) => ({ id: d.id, ...d.data() } as Category));
        const pending = (pendingSnap?.docs || []).map((d) => ({ id: d.id, ...d.data() } as ProviderProfile));

        setUsersList(users.slice(0, 5));
        setCategories(categoriesData);
        setPendingProviders(pending.slice(0, 5));
        setRecentBookings(bookings.slice(0, 5));
        setStats({
          users: users.length,
          providers: providers.filter((provider) => provider.status === "approved").length,
          bookings: bookings.length,
          pendingApprovals: pending.length,
        });

        if (errors.length > 0) {
          const message = `Some datasets failed to load: ${errors.join(", ")}. Check Firestore rules/indexes.`;
          setLoadError(message);
          toast.error(message);
        }
      } catch (error) {
        console.error(error);
        setLoadError("Failed to load admin data. Check Firestore connection and permissions.");
        toast.error("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firebaseReady) {
      toast.error("Firebase is not configured in this environment.");
      return;
    }

    const trimmedName = categoryName.trim();
    if (!trimmedName) {
      toast.error("Category name is required");
      return;
    }

    const slug = trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (categories.some((category) => category.slug === slug)) {
      toast.error("This category already exists");
      return;
    }

    setCreatingCategory(true);
    try {
      const nextOrder = categories.reduce((max, category) => Math.max(max, category.order || 0), 0) + 1;
      const docRef = await addDoc(collection(db, "categories"), {
        name: trimmedName,
        slug,
        description: categoryDescription.trim(),
        icon: categoryIcon.trim() || "briefcase",
        active: true,
        order: nextOrder,
      });

      setCategories((prev) => [
        ...prev,
        {
          id: docRef.id,
          name: trimmedName,
          slug,
          description: categoryDescription.trim(),
          icon: categoryIcon.trim() || "briefcase",
          active: true,
          order: nextOrder,
        },
      ].sort((left, right) => left.order - right.order));

      setCategoryName("");
      setCategoryDescription("");
      setCategoryIcon("briefcase");
      toast.success("Category added successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add category");
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleProviderDecision = async (providerId: string, status: ProviderStatus) => {
    if (status !== "approved" && status !== "rejected") return;

    if (!firebaseReady) {
      toast.error("Firebase is not configured in this environment.");
      return;
    }

    setProcessingProviderId(providerId);
    try {
      await updateDoc(doc(db, "providers", providerId), {
        status,
        updatedAt: serverTimestamp(),
        reviewedAt: serverTimestamp(),
        reviewedBy: user?.uid || null,
      });

      setPendingProviders((prev) => prev.filter((provider) => provider.id !== providerId));
      setStats((prev) => ({
        ...prev,
        pendingApprovals: Math.max(0, prev.pendingApprovals - 1),
        providers: status === "approved" ? prev.providers + 1 : prev.providers,
      }));

      toast.success(status === "approved" ? "Provider approved" : "Provider rejected");
    } catch (error) {
      console.error(error);
      toast.error(`Failed to ${status === "approved" ? "approve" : "reject"} provider`);
    } finally {
      setProcessingProviderId(null);
    }
  };

  // Amazon Standard Classes
  const cardBase = "bg-white border border-[#d5d9d9] rounded-[4px] p-5 shadow-sm text-[#0f1111]";
  const linkText = "text-[#007185] hover:text-[#c40000] hover:underline cursor-pointer transition-colors";
  const inputBaseClass = "w-full min-h-[31px] px-3 py-1.5 border border-[#a6a6a6] rounded-[3px] focus-visible:ring-0 focus-visible:outline-none focus-visible:border-[#e77600] focus-visible:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] text-[13px] bg-white";
  const btnPrimary = "bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] border border-[#fcd200] rounded-[8px] h-[31px] px-4 text-[13px] font-normal shadow-sm transition-colors";
  const btnSecondary = "bg-white hover:bg-gray-50 text-[#0f1111] border border-[#d5d9d9] rounded-[8px] h-[31px] px-4 text-[13px] font-normal shadow-sm transition-colors";
  const systemAlerts = [
    {
      title: "Pending approvals",
      message: stats.pendingApprovals > 0
        ? `${stats.pendingApprovals} provider application(s) need review.`
        : "No pending provider approvals right now.",
      tone: stats.pendingApprovals > 0 ? "warning" : "info",
    },
    {
      title: "Catalog size",
      message: `${categories.length} active categor${categories.length === 1 ? "y" : "ies"} available to providers.`,
      tone: "info",
    },
  ];

  return (
    <AuthGuard allowedRoles={["admin"]}>
      <div className="min-h-screen bg-[#f2f4f8] flex flex-col text-[#0f1111]">
        <SiteHeader />
        
        {/* AWS-style Subnav */}
        <div className="bg-[#232f3e] text-white px-6 py-2 text-[13px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#e77600]" />
            <span className="font-bold">Administration Console</span>
          </div>
          <div className="flex items-center gap-4 text-[12px]">
            <span className="text-[#00a8e1]">Live data: {stats.users} users</span>
            <span className="text-gray-400">|</span>
            <span>{stats.providers} approved providers</span>
          </div>
        </div>

        <main className="flex-grow mx-auto max-w-[1200px] w-full px-4 py-6 sm:px-6 lg:px-8">

          {loadError ? (
            <div className="mb-4 rounded-[4px] border border-[#ff9900] bg-[#fff3cd] px-4 py-3 text-[13px] text-[#0f1111]">
              {loadError}
            </div>
          ) : null}
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h1 className="text-[28px] font-normal tracking-tight leading-tight">Platform Overview</h1>
            <Button className={btnSecondary}>
              <BarChart3 className="h-4 w-4 mr-2" /> Download Reports
            </Button>
          </div>

          {/* STATS WIDGET (Grouped Amazon Style) */}
          <div className={cardBase + " mb-6 p-0"}>
            <div className="bg-[#f0f2f2] px-5 py-3 border-b border-[#d5d9d9]">
               <h2 className="text-[16px] font-bold">Metrics Summary</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#d5d9d9]">
              {[
                { label: "Total Users", value: stats.users, note: "Live user documents" },
                { label: "Active Providers", value: stats.providers, note: "Approved provider documents" },
                { label: "Bookings", value: stats.bookings, note: "Recent booking documents" },
                { label: "Pending Approvals", value: stats.pendingApprovals, note: "Pending provider review" },
              ].map((stat, i) => (
                <div key={i} className="p-5 flex flex-col justify-center">
                  <span className="text-[12px] text-[#565959] mb-1 font-bold">{stat.label}</span>
                  <span className="text-[28px] font-light text-[#0f1111] leading-none mb-2">{stat.value.toLocaleString()}</span>
                  <span className="text-[12px] font-bold text-[#565959]">
                    {stat.note}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* MAIN MANAGEMENT AREA */}
            <div className="lg:col-span-2 space-y-6">
              
              <Tabs defaultValue="approvals" className="w-full">
                <TabsList className="flex border-b border-[#d5d9d9] w-full bg-transparent p-0 mb-4 h-auto">
                  <TabsTrigger value="approvals" className="px-4 py-3 text-[14px] font-bold text-[#565959] data-[state=active]:text-[#0f1111] data-[state=active]:border-b-[3px] data-[state=active]:border-[#e77600] rounded-none bg-transparent hover:bg-gray-50 shadow-none data-[state=active]:shadow-none">
                    Pending Approvals ({stats.pendingApprovals})
                  </TabsTrigger>
                  <TabsTrigger value="users" className="px-4 py-3 text-[14px] font-bold text-[#565959] data-[state=active]:text-[#0f1111] data-[state=active]:border-b-[3px] data-[state=active]:border-[#e77600] rounded-none bg-transparent hover:bg-gray-50 shadow-none data-[state=active]:shadow-none">
                    User Management
                  </TabsTrigger>
                </TabsList>
                
                {/* APPROVALS TAB */}
                <TabsContent value="approvals" className="mt-0 space-y-0 border border-[#d5d9d9] bg-white rounded-[4px] overflow-hidden">
                  <div className="bg-[#f0f2f2] px-4 py-3 border-b border-[#d5d9d9] flex justify-between items-center text-[13px]">
                    <span className="font-bold text-[#0f1111]">Provider Applications</span>
                    <span className={linkText}>View all</span>
                  </div>
                  
                  {pendingProviders.length > 0 ? (
                    pendingProviders.map((p, idx) => (
                      <div key={p.id} className={cn(
                        "p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4",
                        idx !== 0 && "border-t border-[#e7e7e7]"
                      )}>
                        <div className="flex items-start gap-4">
                          <Avatar className="h-[40px] w-[40px] rounded-[4px] border border-[#d5d9d9] shrink-0">
                            <AvatarImage src={p.profileImage || ""} />
                            <AvatarFallback className="bg-[#f0f2f2] text-[#565959] font-bold rounded-[4px]">
                              {p.businessName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className={linkText + " font-bold text-[14px] leading-tight mb-1"}>{p.businessName}</h4>
                            <p className="text-[12px] text-[#0f1111] mb-0.5">Category: {p.categoryId}</p>
                            <p className="text-[12px] text-[#565959]">Submitted: {formatStoredDate(p.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            className={btnSecondary}
                            onClick={() => handleProviderDecision(p.id, "rejected")}
                            disabled={processingProviderId === p.id}
                          >
                            {processingProviderId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reject"}
                          </Button>
                          <Button
                            className={btnPrimary}
                            onClick={() => handleProviderDecision(p.id, "approved")}
                            disabled={processingProviderId === p.id}
                          >
                            {processingProviderId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve"}
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <CheckCircle2 className="h-8 w-8 text-[#007600] mx-auto mb-2" />
                      <h3 className="font-bold text-[14px] text-[#0f1111]">Queue is empty</h3>
                      <p className="text-[#565959] text-[13px] mt-1">All provider applications have been processed.</p>
                    </div>
                  )}
                </TabsContent>
                
                {/* USERS TAB */}
                <TabsContent value="users" className="mt-0 border border-[#d5d9d9] bg-white rounded-[4px] overflow-hidden">
                  <div className="p-4 border-b border-[#d5d9d9] bg-white flex gap-2">
                    <div className="relative flex-grow max-w-sm">
                      <Search className="absolute left-3 top-[9px] h-4 w-4 text-[#565959]" />
                      <Input placeholder="Find users by name or email" className={inputBaseClass + " pl-9"} />
                    </div>
                    <Button className={btnSecondary}><Filter className="h-4 w-4" /></Button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[13px]">
                      <thead className="bg-[#f0f2f2] border-b border-[#d5d9d9] text-[#0f1111]">
                        <tr>
                          <th className="px-4 py-2 font-bold">User Details</th>
                          <th className="px-4 py-2 font-bold">Role</th>
                          <th className="px-4 py-2 font-bold">Joined Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e7e7e7]">
                        {usersList.length > 0 ? usersList.map((item) => (
                          <tr key={item.uid} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-bold text-[#0f1111]">{item.displayName}</div>
                              <div className="text-[12px] text-[#565959]">{item.email}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="bg-[#f0f2f2] border border-[#d5d9d9] text-[#0f1111] px-2 py-0.5 rounded-[4px] text-[11px] font-bold capitalize">{item.role}</span>
                            </td>
                            <td className="px-4 py-3 text-[#565959]">{formatStoredDate(item.createdAt)}</td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={3} className="px-4 py-8 text-center text-[#565959]">No users found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </Tabs>

              {/* CATEGORY MANAGEMENT */}
              <div className={cardBase + " p-0"}>
                <div className="bg-[#f0f2f2] px-5 py-3 border-b border-[#d5d9d9] flex justify-between items-center">
                  <h2 className="text-[16px] font-bold">Category Management</h2>
                </div>

                <div className="p-5">
                  <form onSubmit={handleCreateCategory} className="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-[13px] font-bold text-[#0f1111] mb-1">Category Name</label>
                      <Input
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        placeholder="e.g. Tutors"
                        className={inputBaseClass}
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-bold text-[#0f1111] mb-1">Icon Identifier</label>
                      <Input
                        value={categoryIcon}
                        onChange={(e) => setCategoryIcon(e.target.value)}
                        placeholder="e.g. briefcase"
                        className={inputBaseClass}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[13px] font-bold text-[#0f1111] mb-1">Description</label>
                      <Input
                        value={categoryDescription}
                        onChange={(e) => setCategoryDescription(e.target.value)}
                        placeholder="Brief description of the category"
                        className={inputBaseClass}
                      />
                    </div>
                    <div className="md:col-span-2 pt-2 border-t border-[#e7e7e7] flex justify-end">
                      <Button type="submit" disabled={creatingCategory} className={btnPrimary}>
                        {creatingCategory ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Add Category
                      </Button>
                    </div>
                  </form>

                  <div>
                    <h3 className="text-[14px] font-bold text-[#0f1111] mb-2">Active Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {categories.length > 0 ? categories.map((category) => (
                        <span key={category.id} className="bg-[#f0f2f2] border border-[#d5d9d9] text-[#0f1111] px-3 py-1 rounded-[4px] text-[12px] font-bold capitalize">
                          {category.name}
                        </span>
                      )) : (
                        <p className="text-[13px] text-[#565959]">No categories configured yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR: LIVE DATA */}
            <div className="space-y-6">
              
              {/* SYSTEM SNAPSHOT */}
              <div className="space-y-3">
                <h3 className="font-bold text-[16px] text-[#0f1111] mb-2">System Snapshot</h3>

                {systemAlerts.map((alert) => (
                  <div
                    key={alert.title}
                    className={cn(
                      "p-3 rounded-[4px] flex items-start gap-3 text-[13px] text-[#0f1111] shadow-sm border",
                      alert.tone === "warning"
                        ? "bg-[#fff3cd] border-[#ff9900]"
                        : "bg-[#f0f2f2] border-[#d5d9d9]"
                    )}
                  >
                    {alert.tone === "warning" ? (
                      <CheckCircle2 className="h-4 w-4 text-[#c40000] shrink-0 mt-0.5" />
                    ) : (
                      <BarChart3 className="h-4 w-4 text-[#007185] shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold block mb-0.5">{alert.title}</span>
                      <span className="text-[#565959]">{alert.message}</span>
                    </div>
                  </div>
                ))}

                <div className={cardBase}>
                  <h3 className="font-bold text-[16px] mb-3 border-b border-[#e7e7e7] pb-2">Live Counts</h3>
                  <div className="grid grid-cols-2 gap-3 text-[13px]">
                    <div className="bg-[#f0f2f2] border border-[#d5d9d9] rounded-[4px] p-3">
                      <div className="text-[#565959] text-[12px] font-bold">Users</div>
                      <div className="text-[22px] font-light">{stats.users}</div>
                    </div>
                    <div className="bg-[#f0f2f2] border border-[#d5d9d9] rounded-[4px] p-3">
                      <div className="text-[#565959] text-[12px] font-bold">Approved Providers</div>
                      <div className="text-[22px] font-light">{stats.providers}</div>
                    </div>
                    <div className="bg-[#f0f2f2] border border-[#d5d9d9] rounded-[4px] p-3">
                      <div className="text-[#565959] text-[12px] font-bold">Bookings</div>
                      <div className="text-[22px] font-light">{stats.bookings}</div>
                    </div>
                    <div className="bg-[#f0f2f2] border border-[#d5d9d9] rounded-[4px] p-3">
                      <div className="text-[#565959] text-[12px] font-bold">Categories</div>
                      <div className="text-[22px] font-light">{categories.length}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RECENT BOOKINGS */}
              <div className={cardBase + " p-0"}>
                <div className="bg-[#f0f2f2] px-4 py-3 border-b border-[#d5d9d9]">
                  <h3 className="font-bold text-[14px]">Recent Bookings</h3>
                </div>
                <div className="p-4 space-y-4">
                  {recentBookings.length > 0 ? recentBookings.map((booking) => (
                    <div key={booking.id} className="flex gap-3 text-[12px]">
                      <div className="w-[2px] bg-[#d5d9d9] shrink-0" />
                      <div>
                        <p className="font-bold text-[#0f1111]">{booking.providerName || booking.providerId}</p>
                        <p className="text-[#565959] mt-0.5">{booking.userName || booking.userId} · {booking.status}</p>
                        <p className="text-[#565959] mt-0.5">{formatStoredDate(booking.createdAt)}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-[13px] text-[#565959] p-4">No bookings found.</div>
                  )}
                  <div className="pt-2 border-t border-[#e7e7e7]">
                    <span className={linkText + " text-[13px]"}>Open bookings manager</span>
                  </div>
                </div>
              </div>

              {/* USER SNAPSHOT */}
              <div className={cardBase + " p-0"}>
                <div className="bg-[#f0f2f2] px-4 py-3 border-b border-[#d5d9d9]">
                  <h3 className="font-bold text-[14px]">Recent Users</h3>
                </div>
                <div className="p-4 space-y-4">
                  {usersList.length > 0 ? usersList.map((item) => (
                    <div key={item.uid} className="flex gap-3 text-[12px] items-start">
                      <div className="w-[2px] bg-[#d5d9d9] shrink-0" />
                      <div>
                        <p className="font-bold text-[#0f1111]">{item.displayName}</p>
                        <p className="text-[#565959] mt-0.5">{item.email} · {item.role}</p>
                        <p className="text-[#565959] mt-0.5">{formatStoredDate(item.createdAt)}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-[13px] text-[#565959] p-4">No users found.</div>
                  )}
                  <div className="pt-2 border-t border-[#e7e7e7]">
                    <span className={linkText + " text-[13px]"}>View user directory</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </AuthGuard>
  );
}