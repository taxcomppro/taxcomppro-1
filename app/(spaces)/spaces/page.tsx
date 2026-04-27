"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { Loader2, X } from "lucide-react";
import { Mic01Icon, Radio01Icon, UserGroupIcon, Add01Icon } from "hugeicons-react";

interface SpaceHost { id: string; name: string; image: string | null; headline: string | null; }
interface Space { id: string; name: string; description: string | null; roomName: string; isLive: boolean; createdAt: string; host: SpaceHost; }

function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

function LiveWave() {
  return (
    <div className="flex items-end gap-[2px] h-4">
      {[1, 0.5, 0.75, 0.3, 0.9, 0.6, 0.4, 0.8, 0.5, 1].map((h, i) => (
        <span key={i} className="w-[2px] bg-rose-400 rounded-full animate-pulse"
          style={{ height: `${h * 14}px`, animationDelay: `${i * 80}ms` }} />
      ))}
    </div>
  );
}

export default function SpacesPage() {
  const user    = useAppSelector(s => s.auth.user);
  const isAdmin = user?.role === "ADMIN";
  const [spaces, setSpaces]     = useState<Space[]>([]);
  const [loading, setLoading]   = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName]         = useState("");
  const [desc, setDesc]         = useState("");

  useEffect(() => {
    fetch("/api/spaces").then(r => r.json()).then(setSpaces).finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!name.trim() || creating) return;
    setCreating(true);
    const res = await fetch("/api/spaces", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, description: desc }) });
    if (res.ok) { const space = await res.json() as Space; setSpaces(p => [space, ...p]); setShowForm(false); setName(""); setDesc(""); }
    setCreating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06091a] via-[#0d1635] to-[#0a0e26]">
      <div className="relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 pt-14 pb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse" />
                <span className="text-rose-300 text-xs font-bold uppercase tracking-widest">{spaces.length} live now</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">Spaces</h1>
              <p className="text-white/40 text-sm mt-2 max-w-sm">Live audio rooms. Join a conversation or start your own.</p>
            </div>
            {isAdmin && (
              <button onClick={() => setShowForm(v => !v)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-bold transition-all shadow-xl shadow-violet-500/25 shrink-0">
                <Add01Icon className="w-4 h-4" /> Start a Space
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-16 space-y-6">
        {showForm && isAdmin && (
          <div className="relative bg-gradient-to-br from-white/8 to-white/4 border border-white/15 rounded-3xl p-6 backdrop-blur-sm">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all"><X className="w-4 h-4" /></button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center"><Radio01Icon className="w-5 h-5 text-white" /></div>
              <div><h2 className="text-white font-bold text-base">Start a new Space</h2><p className="text-white/40 text-xs">Your room goes live instantly</p></div>
            </div>
            <div className="space-y-3">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="What are we talking about?" className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-violet-500 transition-all text-sm" />
              <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description (optional)…" rows={2} className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-violet-500 transition-all text-sm resize-none" />
              <button onClick={handleCreate} disabled={!name.trim() || creating} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold transition-all shadow-lg disabled:opacity-40">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Radio01Icon className="w-4 h-4" />} Go Live Now
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-violet-400" /></div>
        ) : spaces.length === 0 ? (
          <div className="text-center py-24 space-y-5">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center"><Mic01Icon className="w-10 h-10 text-white/20" /></div>
            <div><p className="text-white/50 text-xl font-bold mb-1">No spaces live right now</p><p className="text-white/25 text-sm">Check back later or ask an admin to start a conversation</p></div>
            {isAdmin && <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-violet-600/30 border border-violet-500/30 text-violet-300 text-sm font-bold hover:bg-violet-600/50 transition-all"><Add01Icon className="w-4 h-4" /> Start the first Space</button>}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {spaces.map(space => (
              <Link key={space.id} href={`/spaces/${space.id}`}
                className="group relative bg-gradient-to-br from-white/6 to-white/3 hover:from-white/10 hover:to-white/5 border border-white/10 hover:border-violet-500/40 rounded-3xl p-5 transition-all duration-200 backdrop-blur-sm overflow-hidden">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-rose-500/20 border border-rose-500/30 rounded-full px-2.5 py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                      <span className="text-rose-300 text-[11px] font-bold uppercase tracking-wide">Live</span>
                    </div>
                    <LiveWave />
                  </div>
                  <span className="text-white/30 text-xs">{timeAgo(space.createdAt)}</span>
                </div>
                <h3 className="text-white font-bold text-base mb-1.5 group-hover:text-violet-200 transition-colors leading-snug">{space.name}</h3>
                {space.description && <p className="text-white/45 text-sm leading-relaxed line-clamp-2 mb-4">{space.description}</p>}
                <div className="flex items-center gap-3 pt-3 border-t border-white/8">
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-violet-500/40" style={{ background: "linear-gradient(135deg,#1e1b4b,#312e81)" }}>
                    {space.host.image ? <img src={space.host.image} alt={space.host.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" /> : <span className="w-full h-full flex items-center justify-center text-white text-xs font-bold">{space.host.name[0]}</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-white/80 text-xs font-semibold truncate">{space.host.name}</div>
                    {space.host.headline && <div className="text-white/35 text-[11px] truncate">{space.host.headline}</div>}
                  </div>
                  <div className="flex items-center gap-1 text-white/35 text-xs"><UserGroupIcon className="w-3.5 h-3.5" /><span>Tap to join</span></div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
