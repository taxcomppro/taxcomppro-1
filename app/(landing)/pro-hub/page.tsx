"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { Loader2 } from "lucide-react";
import {
  Search01Icon, UserGroupIcon, Message01Icon, Tick02Icon,
  Add01Icon, Cancel01Icon, LockIcon, GlobeIcon, ArrowRight01Icon,
  UserCircleIcon,
} from "hugeicons-react";

interface Community {
  id: string; name: string; slug: string; description: string;
  icon: string | null; isPublic: boolean; memberCount: number;
  isMember: boolean;
  creator: { id: string; name: string; image: string | null };
  _count: { members: number; posts: number };
}

const PALETTE = [
  "from-blue-600 to-indigo-700", "from-emerald-500 to-teal-700",
  "from-amber-500 to-orange-600", "from-purple-600 to-violet-700",
  "from-rose-500 to-pink-700",   "from-cyan-500 to-blue-600",
  "from-green-500 to-emerald-700","from-[#1a3a6b] to-[#0a1628]",
];

/* ─── Create Community Modal ───────────────────────────────── */
function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: (c: Community) => void }) {
  const [name, setName]         = useState("");
  const [desc, setDesc]         = useState("");
  const [icon, setIcon]         = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setSaving(true);
    try {
      const res = await fetch("/api/pro-hub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: desc, icon: icon || null, isPublic }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed"); return; }
      onCreated(data);
      onClose();
    } catch { setError("Something went wrong."); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="font-black text-[#0a1628] text-lg">Create Community</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-all">
            <Cancel01Icon className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Community Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required
              placeholder="e.g. IRS Audit Defense Network"
              className="w-full font-[inherit] text-sm px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-[#0a1628] focus:ring-2 focus:ring-[#0a1628]/10 transition-all" />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Description *</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} required rows={3}
              placeholder="What is this community about?"
              className="w-full font-[inherit] text-sm px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-[#0a1628] focus:ring-2 focus:ring-[#0a1628]/10 transition-all resize-none" />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Icon (emoji or URL)</label>
            <input type="text" value={icon} onChange={e => setIcon(e.target.value)}
              placeholder="e.g. ⚖️ or https://…"
              className="w-full font-[inherit] text-sm px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-[#0a1628] focus:ring-2 focus:ring-[#0a1628]/10 transition-all" />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setIsPublic(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${isPublic ? "border-[#0a1628] bg-[#0a1628]/5 text-[#0a1628]" : "border-slate-200 text-slate-500"}`}>
              <GlobeIcon className="w-4 h-4" /> Public
            </button>
            <button type="button" onClick={() => setIsPublic(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${!isPublic ? "border-[#0a1628] bg-[#0a1628]/5 text-[#0a1628]" : "border-slate-200 text-slate-500"}`}>
              <LockIcon className="w-4 h-4" /> Private
            </button>
          </div>

          <button type="submit" disabled={saving || !name || !desc}
            className="w-full bg-[#0a1628] text-white font-black text-sm py-3.5 rounded-xl hover:bg-[#1a3a6b] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Creating…</> : "Create Community"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─── Skeleton card ─────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden animate-pulse">
      <div className="h-24 bg-slate-200" />
      <div className="pt-10 px-4 pb-4 space-y-3">
        <div className="h-4 bg-slate-200 rounded w-2/3" />
        <div className="h-3 bg-slate-200 rounded w-1/3" />
        <div className="h-3 bg-slate-200 rounded w-full" />
        <div className="h-3 bg-slate-200 rounded w-4/5" />
        <div className="flex justify-between items-center pt-1">
          <div className="h-3 w-16 bg-slate-200 rounded" />
          <div className="h-8 w-20 bg-slate-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/* ─── Community card ────────────────────────────────────────── */
function CommunityCard({ c, idx, onJoin, joining, joined }: {
  c: Community; idx: number;
  onJoin: (id: string) => void; joining: boolean; joined: boolean;
}) {
  const gradient = PALETTE[idx % PALETTE.length];
  const isEmoji  = c.icon && c.icon.length <= 4;

  return (
    <div className="bg-white rounded-2xl overflow-hidden hover:-translate-y-0.5 transition-all group">
      {/* Banner */}
      <div className={`bg-gradient-to-br ${gradient} h-24 relative`}>
        <div className="w-14 h-14 rounded-2xl border-4 border-white bg-white shadow-md flex items-center justify-center absolute -bottom-7 left-4 overflow-hidden">
          {isEmoji
            ? <span className="text-2xl">{c.icon}</span>
            : c.icon
              ? <img src={c.icon} alt={c.name} className="w-full h-full object-cover" />
              : <span className="text-[#0a1628] font-black text-2xl">{c.name[0]}</span>}
        </div>
        {!c.isPublic && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/30 text-white text-[10px] font-bold px-2 py-1 rounded-full">
            <LockIcon className="w-2.5 h-2.5" /> Private
          </div>
        )}
      </div>

      {/* Content */}
      <div className="pt-10 px-4 pb-4">
        <h3 className="font-black text-[#0a1628] text-base leading-snug group-hover:text-[#1a3a6b] transition-colors">{c.name}</h3>
        <p className="text-[11px] text-slate-400 mt-0.5 mb-2">by {c.creator.name}</p>
        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4">{c.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1 font-medium">
              <UserGroupIcon className="w-3.5 h-3.5" />{c.memberCount.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Message01Icon className="w-3.5 h-3.5" />{c._count.posts}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {joined ? (
              <Link href={`/pro-hub/${c.slug}`}
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-all">
                <Tick02Icon className="w-3.5 h-3.5" /> Enter
              </Link>
            ) : (
              <button onClick={() => onJoin(c.id)} disabled={joining}
                className="text-xs font-bold bg-[#0a1628] text-white px-4 py-2 rounded-full hover:bg-[#1a3a6b] transition-all disabled:opacity-50">
                {joining ? "Joining…" : "Join"}
              </button>
            )}
            <Link href={`/pro-hub/${c.slug}`}
              className="text-slate-400 hover:text-[#0a1628] transition-colors">
              <ArrowRight01Icon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────────── */
export default function ProHubPage() {
  const user    = useAppSelector(s => s.auth.user);
  const isAdmin = user?.role === "ADMIN";

  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [query,       setQuery]       = useState("");
  const [joining,     setJoining]     = useState<Record<string, boolean>>({});
  const [joined,      setJoined]      = useState<Record<string, boolean>>({});
  const [showCreate,  setShowCreate]  = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const p = new URLSearchParams();
    if (query) p.set("search", query);
    setLoading(true);
    fetch(`/api/pro-hub?${p}`)
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d) ? d : [];
        setCommunities(list);
        const serverJoined: Record<string, boolean> = {};
        list.forEach((c: Community) => { if (c.isMember) serverJoined[c.id] = true; });
        setJoined(prev => ({ ...serverJoined, ...prev }));
      })
      .catch(() => setCommunities([]))
      .finally(() => setLoading(false));
  }, [query]);

  useEffect(() => {
    const t = setTimeout(() => setQuery(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleJoin = async (id: string) => {
    if (!user) { window.location.href = "/login?redirect=/pro-hub"; return; }
    setJoining(p => ({ ...p, [id]: true }));
    try {
      const res = await fetch("/api/pro-hub/join", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ communityId: id }),
      });
      if (res.ok || res.status === 409) {
        setJoined(p => ({ ...p, [id]: true }));
        if (res.ok) setCommunities(prev => prev.map(c => c.id === id ? { ...c, memberCount: c.memberCount + 1 } : c));
      }
    } catch { /* ignore */ } finally { setJoining(p => ({ ...p, [id]: false })); }
  };

  const joinedCount = Object.values(joined).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-100 pt-4 pb-12">
      {showCreate && isAdmin && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreated={c => setCommunities(prev => [{
            ...c as unknown as Community,
            creator:  { id: user?.id ?? "", name: user?.name ?? "Admin", image: user?.image ?? null },
            _count:   { members: 1, posts: 0 },
            isMember: true,
          }, ...prev])}
        />
      )}

      <div className="max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 items-start">

          {/* ── Fixed sidebar ──────────────────────────── */}
          <div className="hidden lg:block self-start sticky top-[100px] h-fit max-h-[calc(100vh-100px)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] space-y-2.5">

            {/* Profile mini-card */}
            {user && (
              <div className="bg-white rounded-2xl overflow-hidden">
                <div className="h-20 bg-gradient-to-br from-[#0a1628] via-[#1a3a6b] to-[#0d2a50] relative">
                  <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                  <div className="absolute -bottom-9 left-4">
                    <div className="w-[72px] h-[72px] rounded-full bg-[#0a1628] border-[3px] border-white overflow-hidden flex items-center justify-center shadow-md">
                      {user.image
                        ? <img src={user.image} alt={user.name ?? ""} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        : <span className="text-white font-black text-2xl">{user.name?.[0]?.toUpperCase()}</span>}
                    </div>
                  </div>
                </div>
                <div className="px-4 pt-12 pb-4">
                  <div className="font-black text-[#0a1628] text-sm">{user.name}</div>
                  {user.headline
                    ? <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">{user.headline}</div>
                    : <div className="text-xs text-slate-400 italic mt-0.5">No headline</div>}
                  {/* Joined communities count */}
                  <div className="mt-3 flex gap-2">
                    <div className="flex-1 bg-slate-50 rounded-xl py-2 text-center">
                      <div className="text-[10px] text-slate-400">Joined</div>
                      <div className="text-sm font-black text-[#0a1628]">{joinedCount}</div>
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-xl py-2 text-center">
                      <div className="text-[10px] text-slate-400">Total</div>
                      <div className="text-sm font-black text-[#0a1628]">{communities.length}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Create community CTA */}
            {isAdmin ? (
              <button onClick={() => setShowCreate(true)}
                className="flex items-center justify-center gap-2 bg-[#0a1628] text-white font-bold text-sm px-4 py-3 rounded-xl hover:bg-[#1a3a6b] transition-all w-full">
                <Add01Icon className="w-4 h-4" /> Create Community
              </button>
            ) : !user ? (
              <Link href="/login"
                className="flex items-center justify-center gap-2 bg-[#0a1628] text-white font-bold text-sm px-4 py-3 rounded-xl hover:bg-[#1a3a6b] transition-all w-full">
                <UserCircleIcon className="w-4 h-4" /> Sign In to Join
              </Link>
            ) : null}

            {/* About + stats */}
            <div className="bg-white rounded-2xl p-4 space-y-3">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">About Pro Hub</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Professional communities for tax experts. Join groups, discuss strategies, and grow your network.
              </p>
              {[
                { label: "Communities", value: communities.length },
                { label: "Members",     value: communities.reduce((a, c) => a + (c.memberCount ?? 0), 0).toLocaleString() },
                { label: "Discussions", value: communities.reduce((a, c) => a + (c._count?.posts ?? 0), 0).toLocaleString() },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between text-sm border-t border-slate-50 pt-2">
                  <span className="text-slate-400 text-xs">{s.label}</span>
                  <span className="font-black text-[#0a1628] text-sm">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Main content ──────────────────────────── */}
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-[#0a1628]">Pro Hub</h1>
                <p className="text-slate-500 text-sm mt-0.5">
                  {loading ? "Loading…" : `${communities.length} active communit${communities.length !== 1 ? "ies" : "y"}`}
                </p>
              </div>
              {isAdmin && (
                <button onClick={() => setShowCreate(true)}
                  className="flex items-center gap-2 bg-[#0a1628] text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#1a3a6b] transition-all shrink-0 lg:hidden">
                  <Add01Icon className="w-4 h-4" /> Create
                </button>
              )}
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl px-4 py-3 flex items-center gap-3">
              <Search01Icon className="w-4 h-4 text-slate-400 shrink-0" />
              <input type="text" placeholder="Search communities…"
                value={search} onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent font-[inherit] text-sm text-slate-700 outline-none placeholder-slate-400" />
              {search && (
                <button onClick={() => { setSearch(""); setQuery(""); }}
                  className="text-slate-400 hover:text-slate-600 text-xs font-semibold">Clear</button>
              )}
            </div>

            {/* Grid / Skeleton / Empty */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : communities.length === 0 ? (
              <div className="bg-white rounded-2xl py-24 text-center">
                <UserGroupIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="font-bold text-slate-400 text-lg">No communities yet</p>
                <p className="text-slate-400 text-sm mt-1">
                  {query ? "Try a different search" : isAdmin ? "Create the first community!" : "Check back soon"}
                </p>
                {isAdmin && (
                  <button onClick={() => setShowCreate(true)}
                    className="inline-flex items-center gap-2 mt-5 bg-[#0a1628] text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#1a3a6b] transition-all">
                    <Add01Icon className="w-4 h-4" /> Create First Community
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {communities.map((c, i) => (
                  <CommunityCard key={c.id} c={c} idx={i}
                    onJoin={handleJoin} joining={!!joining[c.id]} joined={!!joined[c.id]} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
