"use client";

import { useEffect, useState } from "react";
import { Loader2, Users, ShoppingBag, MessageSquare, DollarSign, TrendingUp, Crown } from "lucide-react";

interface Stats {
  totalUsers: number; newUsersWeek: number;
  totalListings: number; pendingListings: number;
  totalCommunities: number; newCommunitiesWeek: number;
  activeSubscriptions: number;
  tierCounts: { tier: string; _count: { tier: number } }[];
}

const tierColors: Record<string, string> = {
  FREE: "bg-slate-200", VIP: "bg-amber-400",
  MARKETPLACE: "bg-indigo-400", MARKETPLACE_PLUS: "bg-emerald-400",
};
const tierLabels: Record<string, string> = {
  FREE: "Free", VIP: "VIP", MARKETPLACE: "Marketplace", MARKETPLACE_PLUS: "Plus",
};

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(r => r.json()).then(setStats)
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const totalTierUsers = stats?.tierCounts.reduce((a, t) => a + t._count.tier, 0) ?? 1;

  return (
    <div className="max-w-6xl mx-auto space-y-7">
      <div>
        <h1 className="text-2xl font-black text-[#0a1628]">Analytics</h1>
        <p className="text-slate-500 text-sm mt-0.5">Platform-wide metrics and growth overview</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 text-[#d4a017] animate-spin" /></div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Users",       value: stats?.totalUsers ?? 0,          sub: `+${stats?.newUsersWeek ?? 0} this week`,   icon: Users,        color: "bg-blue-50 text-blue-600" },
              { label: "Total Listings",    value: stats?.totalListings ?? 0,        sub: `${stats?.pendingListings ?? 0} pending`,   icon: ShoppingBag,  color: "bg-amber-50 text-amber-600" },
              { label: "Communities",       value: stats?.totalCommunities ?? 0,     sub: `+${stats?.newCommunitiesWeek ?? 0} new`,   icon: MessageSquare, color: "bg-purple-50 text-purple-600" },
              { label: "Active Subs",       value: stats?.activeSubscriptions ?? 0,  sub: "paying subscribers",                       icon: DollarSign,   color: "bg-emerald-50 text-emerald-600" },
            ].map(s => (
              <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-[#0a1628]">{s.value.toLocaleString()}</div>
                <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                <div className="text-xs text-emerald-500 font-semibold mt-2">{s.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tier distribution */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <Crown className="w-4 h-4 text-[#d4a017]" />
                <h2 className="font-bold text-[#0a1628]">User Tier Distribution</h2>
              </div>
              <div className="space-y-4">
                {stats?.tierCounts.sort((a, b) => b._count.tier - a._count.tier).map(t => {
                  const pct = Math.round((t._count.tier / totalTierUsers) * 100);
                  return (
                    <div key={t.tier}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-slate-700">{tierLabels[t.tier] ?? t.tier}</span>
                        <span className="text-sm font-bold text-[#0a1628]">{t._count.tier.toLocaleString()} <span className="text-slate-400 font-normal text-xs">({pct}%)</span></span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${tierColors[t.tier] ?? "bg-slate-400"}`}
                          style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Growth summary */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="w-4 h-4 text-[#d4a017]" />
                <h2 className="font-bold text-[#0a1628]">This Week's Growth</h2>
              </div>
              <div className="space-y-4">
                {[
                  { label: "New Users",        value: stats?.newUsersWeek ?? 0,        total: stats?.totalUsers ?? 0,        unit: "users" },
                  { label: "New Communities",  value: stats?.newCommunitiesWeek ?? 0,   total: stats?.totalCommunities ?? 0,  unit: "communities" },
                  { label: "Pending Listings", value: stats?.pendingListings ?? 0,      total: stats?.totalListings ?? 0,     unit: "listings need review" },
                ].map(m => (
                  <div key={m.label} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-[#0a1628]">{m.label}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{m.total.toLocaleString()} total {m.unit}</div>
                    </div>
                    <div className="text-2xl font-black text-[#0a1628]">+{m.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#0a1628] to-[#1a3a6b] rounded-2xl p-6 text-center">
            <p className="text-white/60 text-sm mb-1">Full analytics with Stripe revenue, charts, and user cohorts</p>
            <p className="text-white/40 text-xs">Connect Stripe dashboard for detailed revenue analytics</p>
          </div>
        </>
      )}
    </div>
  );
}
