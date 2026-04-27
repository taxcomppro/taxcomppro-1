"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Clock, Search, Filter, Loader2 } from "lucide-react";

type Status = "PENDING" | "APPROVED" | "REJECTED";

interface Listing {
  id: string; title: string; description: string;
  category: string; price: number | null;
  status: Status; viewCount: number; createdAt: string;
  user: { id: string; name: string; email: string };
}

const statusConfig: Record<Status, { label: string; className: string; icon: React.ElementType }> = {
  PENDING:  { label: "Pending",  className: "bg-amber-100 text-amber-700",    icon: Clock },
  APPROVED: { label: "Approved", className: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-600",         icon: XCircle },
};

const catLabels: Record<string,string> = { SERVICE:"Service", PRODUCT:"Product", NETWORK:"Network", TRAINING:"Training" };

function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

export default function AdminApprovalsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<Status | "ALL">("ALL");
  const [search, setSearch]     = useState("");
  const [acting, setActing]     = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/admin/listings")
      .then(r => r.json())
      .then(d => setListings(Array.isArray(d) ? d : []))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = listings.filter(l => {
    const matchFilter = filter === "ALL" || l.status === filter;
    const matchSearch = l.title.toLowerCase().includes(search.toLowerCase()) || l.user.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const updateStatus = async (id: string, status: Status) => {
    setActing(p => ({ ...p, [id]: true }));
    try {
      const res = await fetch(`/api/admin/listings/${id}/status`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) setListings(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    } catch { /* ignore */ }
    finally { setActing(p => ({ ...p, [id]: false })); }
  };

  const counts = {
    PENDING:  listings.filter(l => l.status === "PENDING").length,
    APPROVED: listings.filter(l => l.status === "APPROVED").length,
    REJECTED: listings.filter(l => l.status === "REJECTED").length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#0a1628]">Listing Approvals</h1>
        <p className="text-slate-500 text-sm mt-0.5">Review and approve marketplace listing submissions</p>
      </div>

      {/* Filter chips */}
      <div className="flex gap-3 flex-wrap">
        {[
          { key: "ALL",      label: "All",      count: listings.length,  color: "bg-slate-100 text-slate-600" },
          { key: "PENDING",  label: "Pending",  count: counts.PENDING,   color: "bg-amber-100 text-amber-700" },
          { key: "APPROVED", label: "Approved", count: counts.APPROVED,  color: "bg-emerald-100 text-emerald-700" },
          { key: "REJECTED", label: "Rejected", count: counts.REJECTED,  color: "bg-red-100 text-red-600" },
        ].map(s => (
          <button key={s.key} onClick={() => setFilter(s.key as Status | "ALL")}
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border-2 transition-all ${
              filter === s.key ? "border-[#0a1628] bg-[#0a1628] text-white" : `border-transparent ${s.color} hover:border-slate-200`
            }`}>
            {s.label}
            <span className={`text-xs font-black px-1.5 py-0.5 rounded-full ${filter === s.key ? "bg-white/20" : "bg-white/70"}`}>
              {s.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Search listings or sellers…" value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full font-[inherit] text-sm pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#0a1628] focus:ring-2 focus:ring-[#0a1628]/10 transition-all" />
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 text-[#d4a017] animate-spin" /></div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left text-xs font-bold text-slate-500 px-5 py-3.5 uppercase tracking-wider">Listing</th>
                <th className="text-left text-xs font-bold text-slate-500 px-5 py-3.5 uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="text-left text-xs font-bold text-slate-500 px-5 py-3.5 uppercase tracking-wider hidden md:table-cell">Price</th>
                <th className="text-left text-xs font-bold text-slate-500 px-5 py-3.5 uppercase tracking-wider">Status</th>
                <th className="text-right text-xs font-bold text-slate-500 px-5 py-3.5 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(l => {
                const sc = statusConfig[l.status];
                const SI = sc.icon;
                return (
                  <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-[#0a1628] text-sm">{l.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />{l.user.name} · {timeAgo(l.createdAt)}
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2.5 py-1 rounded-full">{catLabels[l.category] ?? l.category}</span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-sm font-bold text-[#0a1628]">{l.price != null ? `$${l.price}` : "Free"}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${sc.className}`}>
                        <SI className="w-3 h-3" />{sc.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        {acting[l.id] ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : (
                          <>
                            {l.status !== "APPROVED" && (
                              <button onClick={() => updateStatus(l.id, "APPROVED")}
                                className="flex items-center gap-1.5 text-xs font-bold bg-emerald-500 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-all">
                                <CheckCircle2 className="w-3 h-3" /> Approve
                              </button>
                            )}
                            {l.status !== "REJECTED" && (
                              <button onClick={() => updateStatus(l.id, "REJECTED")}
                                className="flex items-center gap-1.5 text-xs font-bold bg-red-50 text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-all">
                                <XCircle className="w-3 h-3" /> Reject
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <Filter className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p className="font-semibold">{loading ? "Loading…" : "No listings found"}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
