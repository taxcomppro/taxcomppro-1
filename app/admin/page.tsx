"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import {
  UserGroupIcon, ShoppingBag01Icon, ChartBarLineIcon, UserGroupIcon as CommunityIcon,
  DollarCircleIcon, Clock01Icon, Tick02Icon, Cancel01Icon,
  ArrowRight01Icon, Add01Icon, ListViewIcon,
} from "hugeicons-react";

interface Stats {
  totalUsers: number; newUsersWeek: number;
  totalListings: number; pendingListings: number;
  totalCommunities: number; newCommunitiesWeek: number;
  activeSubscriptions: number;
  recentUsers: { id: string; name: string; email: string; role: string; tier: string; createdAt: string }[];
  recentPending: { id: string; title: string; category: string; price: number | null; createdAt: string; user: { name: string } }[];
}

const catLabels: Record<string, string> = {
  SERVICE: "Service", PRODUCT: "Product", NETWORK: "Network", TRAINING: "Training",
};

const tierColors: Record<string, string> = {
  FREE:             "bg-slate-100 text-slate-500",
  VIP:              "bg-amber-100 text-amber-700",
  MARKETPLACE:      "bg-blue-100 text-blue-700",
  MARKETPLACE_PLUS: "bg-emerald-100 text-emerald-700",
};

function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

function StatCard({ label, value, sub, icon: Icon, iconBg, subColor }: {
  label: string; value: string; sub: string;
  icon: React.ElementType; iconBg: string; subColor?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${iconBg}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-3xl font-black text-[#0a1628]">{value}</div>
      <div className="text-xs text-slate-400 mt-0.5">{label}</div>
      <div className={`text-xs font-semibold mt-2 ${subColor ?? "text-emerald-500"}`}>{sub}</div>
    </div>
  );
}

function SkeletonStat() {
  return (
    <div className="bg-white rounded-2xl p-5 animate-pulse space-y-3">
      <div className="w-11 h-11 rounded-xl bg-slate-200" />
      <div className="h-8 bg-slate-200 rounded w-1/2" />
      <div className="h-3 bg-slate-200 rounded w-3/4" />
      <div className="h-3 bg-slate-200 rounded w-1/2" />
    </div>
  );
}

export default function AdminPage() {
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch("/api/admin/stats")
      .then(r => r.json()).then(setStats)
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
    await fetch(`/api/admin/listings/${id}/status`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setStats(prev => prev
      ? { ...prev, recentPending: prev.recentPending.filter(l => l.id !== id), pendingListings: prev.pendingListings - 1 }
      : prev);
  };

  const statCards = stats ? [
    {
      label: "Total Users", value: stats.totalUsers.toLocaleString(),
      sub: `+${stats.newUsersWeek} this week`, icon: UserGroupIcon,
      iconBg: "bg-blue-50 text-blue-600",
    },
    {
      label: "Listings", value: stats.totalListings.toLocaleString(),
      sub: `${stats.pendingListings} pending`, icon: ShoppingBag01Icon,
      iconBg: "bg-amber-50 text-amber-600",
      subColor: stats.pendingListings > 0 ? "text-amber-500" : "text-emerald-500",
    },
    {
      label: "Active Subs", value: stats.activeSubscriptions.toLocaleString(),
      sub: "paid subscriptions", icon: DollarCircleIcon,
      iconBg: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Communities", value: stats.totalCommunities.toLocaleString(),
      sub: `+${stats.newCommunitiesWeek} new`, icon: CommunityIcon,
      iconBg: "bg-purple-50 text-purple-600",
    },
  ] : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#0a1628]">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Platform overview and management tools</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? [1,2,3,4].map(i => <SkeletonStat key={i} />)
          : statCards.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-[#d4a017] animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">

          {/* Left: Pending + Recent users */}
          <div className="space-y-5">

            {/* Pending approvals */}
            <div className="bg-white rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-[#0a1628]">Pending Approvals</h2>
                <Link href="/admin/approvals"
                  className="text-xs font-semibold text-[#0a1628] flex items-center gap-1 hover:gap-1.5 transition-all">
                  View All <ArrowRight01Icon className="w-3.5 h-3.5" />
                </Link>
              </div>
              {stats?.recentPending.length === 0 ? (
                <div className="text-center py-8">
                  <Tick02Icon className="w-8 h-8 text-emerald-300 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm font-semibold">All caught up! No pending listings.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {stats?.recentPending.map(l => (
                    <div key={l.id} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3.5">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[#0a1628] text-sm truncate">{l.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                          <Clock01Icon className="w-3 h-3" />
                          {l.user.name} · {catLabels[l.category] ?? l.category}
                          {l.price != null ? ` · $${l.price}` : ""} · {timeAgo(l.createdAt)}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => updateStatus(l.id, "APPROVED")}
                          className="flex items-center gap-1 text-xs font-bold bg-emerald-500 text-white px-3 py-1.5 rounded-xl hover:bg-emerald-600 transition-all">
                          <Tick02Icon className="w-3 h-3" /> Approve
                        </button>
                        <button onClick={() => updateStatus(l.id, "REJECTED")}
                          className="flex items-center gap-1 text-xs font-bold bg-red-50 text-red-500 px-3 py-1.5 rounded-xl hover:bg-red-100 transition-all">
                          <Cancel01Icon className="w-3 h-3" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent signups */}
            <div className="bg-white rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-[#0a1628]">Recent Signups</h2>
                <Link href="/admin/users"
                  className="text-xs font-semibold text-[#0a1628] flex items-center gap-1 hover:gap-1.5 transition-all">
                  Manage All <ArrowRight01Icon className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="space-y-1">
                {stats?.recentUsers.map(u => (
                  <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all">
                    <div className="w-9 h-9 rounded-full bg-[#0a1628] text-white font-bold text-sm flex items-center justify-center shrink-0">
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[#0a1628] text-sm truncate">{u.name}</div>
                      <div className="text-xs text-slate-400 truncate">{u.email}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tierColors[u.tier] ?? tierColors.FREE}`}>
                        {u.tier}
                      </span>
                      <span className="text-xs text-slate-400">{timeAgo(u.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Quick actions */}
          <div className="space-y-4">

            {/* Platform stats summary */}
            <div className="bg-white rounded-2xl p-5 space-y-3">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Platform</p>
              {[
                { label: "Pending reviews", value: stats?.pendingListings ?? 0, urgent: (stats?.pendingListings ?? 0) > 0 },
                { label: "New this week",   value: stats?.newUsersWeek ?? 0, urgent: false },
                { label: "New communities", value: stats?.newCommunitiesWeek ?? 0, urgent: false },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between text-sm border-t border-slate-50 pt-2">
                  <span className="text-slate-400 text-xs">{r.label}</span>
                  <span className={`font-black ${r.urgent ? "text-amber-500" : "text-[#0a1628]"}`}>{r.value}</span>
                </div>
              ))}
            </div>

            {/* Content Calendar */}
            <div className="bg-white rounded-2xl p-5 border border-blue-100">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-blue-600 text-xl">📅</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Admin Tool</span>
              </div>
              <h3 className="font-black text-base text-[#0a1628] mb-1">Content Calendar</h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-4">
                View and manage all <strong className="text-[#0a1628]">scheduled posts</strong> across the platform. Publish or delete any post.
              </p>
              <Link href="/admin/content-calendar"
                className="flex items-center justify-center gap-2 bg-blue-600 text-white font-black text-sm px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-all">
                <ChartBarLineIcon className="w-4 h-4" /> Open Calendar
              </Link>
            </div>

            {/* Toolkit Downloads */}
            <div className="bg-white rounded-2xl p-5 border border-amber-100">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-amber-500 text-xl">📦</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Admin Tool</span>
              </div>
              <h3 className="font-black text-base text-[#0a1628] mb-1">Toolkit Downloads</h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-4">
                Upload digital files to <strong className="text-[#0a1628]">Cloudinary</strong> for each toolkit. Users get the link instantly after purchase.
              </p>
              <Link href="/admin/toolkit-assets"
                className="flex items-center justify-center gap-2 bg-amber-500 text-white font-black text-sm px-4 py-2.5 rounded-xl hover:bg-amber-600 transition-all">
                <Add01Icon className="w-4 h-4" /> Manage Files
              </Link>
            </div>

            {/* Create featured listing CTA */}
            <div className="bg-[#0a1628] rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-1">
                <ChartBarLineIcon className="w-4 h-4 text-[#f0c040]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#f0c040]">Admin Action</span>
              </div>
              <h3 className="font-black text-base mb-1">Create Featured Listing</h3>
              <p className="text-white/60 text-xs leading-relaxed mb-4">
                Your listings are <strong className="text-white">instantly approved</strong> and <strong className="text-white">pinned at top</strong>.
              </p>
              <div className="flex flex-col gap-2">
                <Link href="/marketplace/create"
                  className="flex items-center justify-center gap-2 bg-[#f0c040] text-[#0a1628] font-black text-sm px-4 py-2.5 rounded-xl hover:bg-[#d4a017] transition-all">
                  <Add01Icon className="w-4 h-4" /> Create Listing
                </Link>
                <Link href="/my-listings"
                  className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all">
                  <ListViewIcon className="w-4 h-4" /> My Listings
                </Link>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
