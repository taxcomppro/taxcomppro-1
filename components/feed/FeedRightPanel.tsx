"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserGroupIcon, ShoppingBag01Icon, ArrowUpRight01Icon, ArrowRight01Icon, Tick02Icon } from "hugeicons-react";

interface Community {
  id: string; name: string; description: string;
  memberCount: number; slug: string;
}

interface Listing {
  id: string; title: string; category: string; price: number | null;
  user: { name: string };
}

const BG = ["#1a3a6b","#d4a017","#6366f1","#10b981","#f59e0b"];

export default function FeedRightPanel() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [listings, setListings]       = useState<Listing[]>([]);
  const [joinedMap, setJoinedMap]     = useState<Record<string, boolean>>({});
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/pro-hub").then(r => r.json()),
      fetch("/api/marketplace").then(r => r.json()),
    ]).then(([c, l]) => {
      setCommunities(Array.isArray(c) ? c.slice(0, 3) : []);
      setListings(Array.isArray(l) ? l.slice(0, 3) : []);
    }).finally(() => setLoading(false));
  }, []);

  const handleJoin = async (id: string) => {
    try {
      const res = await fetch("/api/pro-hub/join", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ communityId: id }),
      });
      if (res.ok || res.status === 409) setJoinedMap(p => ({ ...p, [id]: true }));
    } catch { /* ignore */ }
  };

  const catColors: Record<string, string> = {
    SERVICE: "bg-blue-100 text-blue-700", PRODUCT: "bg-purple-100 text-purple-700",
    NETWORK: "bg-emerald-100 text-emerald-700", TRAINING: "bg-amber-100 text-amber-700",
  };
  const catLabels: Record<string, string> = {
    SERVICE: "Service", PRODUCT: "Product", NETWORK: "Network", TRAINING: "Training",
  };

  return (
    <aside className="w-full space-y-3">
      {/* Trending topics */}
      <div className="bg-white rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <ArrowUpRight01Icon className="w-4 h-4 text-[#d4a017]" />
          <h3 className="font-bold text-[#0a1628] text-sm">Trending in Tax</h3>
        </div>
        <div className="space-y-2">
          {["IRS 2025 Updates", "Small Business Deductions", "Crypto Tax Guidelines", "Estate Planning", "R&D Tax Credits"].map((t, i) => (
            <div key={t} className="flex items-start gap-2">
              <span className="text-xs text-slate-400 font-bold w-4 shrink-0">{i+1}</span>
              <div>
                <div className="text-xs font-semibold text-[#0a1628] leading-tight">#{t.replace(/ /g,"")}</div>
                <div className="text-[11px] text-slate-400">Tax Professional</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Communities to join */}
      {(loading || communities.length > 0) && (
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <UserGroupIcon className="w-4 h-4 text-[#d4a017]" />
              <h3 className="font-bold text-[#0a1628] text-sm">Communities</h3>
            </div>
            <Link href="/pro-hub" className="text-[11px] font-semibold text-[#d4a017] hover:underline flex items-center gap-0.5">
              See all <ArrowRight01Icon className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-9 h-9 rounded-xl bg-slate-200 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-slate-200 rounded w-2/3" />
                    <div className="h-2.5 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : (
              communities.map((c, i) => (
                <div key={c.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0"
                    style={{ background: BG[i % 5] }}>
                    {c.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-[#0a1628] truncate">{c.name}</div>
                    <div className="text-[11px] text-slate-400">{c.memberCount.toLocaleString()} members</div>
                  </div>
                  {joinedMap[c.id] ? (
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <Tick02Icon className="w-3 h-3" /> Joined
                    </span>
                  ) : (
                    <button onClick={() => handleJoin(c.id)}
                      className="text-[11px] font-bold text-[#0a1628] border border-[#0a1628] px-2.5 py-1 rounded-full hover:bg-[#0a1628] hover:text-white transition-all shrink-0">
                      + Join
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Featured listings */}
      {(loading || listings.length > 0) && (
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag01Icon className="w-4 h-4 text-[#d4a017]" />
              <h3 className="font-bold text-[#0a1628] text-sm">Marketplace</h3>
            </div>
            <Link href="/marketplace" className="text-[11px] font-semibold text-[#d4a017] hover:underline flex items-center gap-0.5">
              See all <ArrowRight01Icon className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="flex items-start gap-3 animate-pulse">
                  <div className="w-9 h-9 rounded-xl bg-slate-200 shrink-0" />
                  <div className="flex-1 space-y-1.5 pt-1">
                    <div className="h-3.5 bg-slate-200 rounded w-full" />
                    <div className="h-3.5 bg-slate-200 rounded w-4/5" />
                    <div className="flex gap-2 mt-2">
                      <div className="h-3.5 bg-slate-200 rounded w-16" />
                      <div className="h-3.5 bg-slate-200 rounded w-10" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              listings.map(l => (
                <div key={l.id} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <ShoppingBag01Icon className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-[#0a1628] line-clamp-2 leading-tight">{l.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${catColors[l.category] ?? "bg-slate-100 text-slate-500"}`}>
                        {catLabels[l.category] ?? l.category}
                      </span>
                      <span className="text-[11px] font-bold text-[#0a1628]">{l.price != null ? `$${l.price}` : "Free"}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
