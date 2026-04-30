"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import {
  MessageSquare, Users, Plus, Loader2, Lock, Pin,
  Pencil, Trash2, X, Check,
} from "lucide-react";

interface Forum {
  id: string; name: string; slug: string; description: string | null;
  image: string | null; isAdminOnly: boolean; isPinned: boolean; badge: string | null;
  createdBy: { name: string; image: string | null };
  _count: { posts: number };
  posts: { createdAt: string }[];
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

/* ─── Create/Edit Forum Modal (Admin) ─── */
function ForumModal({ initial, onSave, onClose }: {
  initial?: Forum | null;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onClose: () => void;
}) {
  const [name,        setName]        = useState(initial?.name ?? "");
  const [slug,        setSlug]        = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [image,       setImage]       = useState(initial?.image ?? "");
  const [badge,       setBadge]       = useState(initial?.badge ?? "");
  const [isAdminOnly, setIsAdminOnly] = useState(initial?.isAdminOnly ?? false);
  const [isPinned,    setIsPinned]    = useState(initial?.isPinned ?? false);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");

  const autoSlug = (n: string) => n.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const handleNameChange = (v: string) => {
    setName(v);
    if (!initial) setSlug(autoSlug(v));
  };

  const handleSave = async () => {
    if (!name.trim() || !slug.trim()) { setError("Name and slug are required"); return; }
    setSaving(true);
    setError("");
    try {
      await onSave({ name, slug, description, image, badge, isAdminOnly, isPinned });
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-black text-[#0a1628] text-lg">{initial ? "Edit Forum" : "Create Forum"}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-xl">{error}</div>}

          {/* Image preview */}
          {image && (
            <div className="h-28 rounded-xl overflow-hidden bg-slate-100">
              <img src={image} alt="" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">Forum Name *</label>
              <input value={name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. IRS Audits & Due Diligence"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#0a1628]" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">Slug *</label>
              <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="irs-audits"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-[#0a1628]" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                placeholder="What is this forum about?"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-[#0a1628]" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">Cover Image URL</label>
              <input value={image} onChange={e => setImage(e.target.value)} placeholder="https://..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#0a1628]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Badge Label</label>
              <input value={badge} onChange={e => setBadge(e.target.value)} placeholder="e.g. MARKETPLACE"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#0a1628]" />
            </div>
            <div className="flex flex-col gap-2 justify-end">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer">
                <input type="checkbox" checked={isAdminOnly} onChange={e => setIsAdminOnly(e.target.checked)} className="rounded" />
                Admin posts only
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer">
                <input type="checkbox" checked={isPinned} onChange={e => setIsPinned(e.target.checked)} className="rounded" />
                Pin to top
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
          <button onClick={onClose} className="text-sm font-semibold text-slate-500 px-4 py-2 rounded-xl hover:bg-slate-50 transition-all">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-[#0a1628] text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#1a3a6b] transition-all disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {saving ? "Saving…" : initial ? "Save Changes" : "Create Forum"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Forum Card ─── */
function ForumCard({ f, isAdmin, onEdit, onDelete }: {
  f: Forum; isAdmin: boolean;
  onEdit: (f: Forum) => void;
  onDelete: (id: string) => void;
}) {
  const lastActivity = f.posts[0]?.createdAt;

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-slate-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300">
      {/* Admin actions */}
      {isAdmin && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={e => { e.preventDefault(); onEdit(f); }}
            className="p-1.5 bg-white/90 rounded-lg hover:bg-white shadow-sm">
            <Pencil className="w-3 h-3 text-slate-500" />
          </button>
          <button onClick={e => { e.preventDefault(); onDelete(f.id); }}
            className="p-1.5 bg-white/90 rounded-lg hover:bg-red-50 shadow-sm">
            <Trash2 className="w-3 h-3 text-red-400" />
          </button>
        </div>
      )}

      <Link href={`/pro-hub/${f.slug}`} className="block">
        {/* Cover */}
        <div className="h-36 bg-gradient-to-br from-[#0a1628] to-[#1a3a6b] relative overflow-hidden">
          {f.image && <img src={f.image} alt={f.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
            {f.isPinned && (
              <span className="flex items-center gap-0.5 text-[9px] font-black bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded-full">
                <Pin className="w-2.5 h-2.5" /> Pinned
              </span>
            )}
            {f.badge && (
              <span className="text-[9px] font-black bg-[#0a1628] text-[#d4a017] px-2 py-0.5 rounded-full">{f.badge}</span>
            )}
            {f.isAdminOnly && (
              <span className="flex items-center gap-0.5 text-[9px] font-black bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                <Lock className="w-2.5 h-2.5" /> Admin Only
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-black text-[#0a1628] text-sm leading-snug group-hover:text-[#1a3a6b] transition-colors mb-1">{f.name}</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2 mb-3">{f.description}</p>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{f._count.posts} discussions</span>
            </div>
            {lastActivity
              ? <span>{timeAgo(lastActivity)}</span>
              : <span className="text-slate-300">No Discussions</span>}
          </div>
        </div>
      </Link>
    </div>
  );
}

/* ─── Page ─── */
export default function ProHubPage() {
  const user    = useAppSelector(s => s.auth.user);
  const isAdmin = user?.role === "ADMIN";

  const [forums,      setForums]      = useState<Forum[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showCreate,  setShowCreate]  = useState(false);
  const [editForum,   setEditForum]   = useState<Forum | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/pro-hub").then(r => r.json()).then(d => setForums(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (data: Record<string, unknown>) => {
    const res = await fetch("/api/pro-hub", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? "Failed"); }
    load();
  };

  const handleEdit = async (data: Record<string, unknown>) => {
    const res = await fetch(`/api/pro-hub/${editForum!.slug}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? "Failed"); }
    load();
  };

  const handleDelete = async (id: string) => {
    const forum = forums.find(f => f.id === id);
    if (!forum || !confirm(`Delete "${forum.name}"? All discussions will be lost.`)) return;
    await fetch(`/api/pro-hub/${forum.slug}`, { method: "DELETE" });
    setForums(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      {/* Hero */}
      <div className="bg-[#0a1628] py-10 px-4 text-center">
        <p className="text-[#d4a017] text-sm font-bold tracking-widest uppercase mb-2">Tax Pro Community</p>
        <h1 className="text-3xl font-black text-white mb-2">Pro Hub</h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          <span className="text-[#d4a017] font-bold">Ask. Learn. Grow.</span> Where Tax Professionals Connect, Learn from Experienced Peers.
        </p>
      </div>

      {/* Content */}
      <div className="max-w-[1100px] mx-auto px-4 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-black text-[#0a1628] text-xl">Discussion Forums</h2>
            <p className="text-slate-400 text-sm mt-0.5">
              {loading ? "Loading…" : `${forums.length} forum${forums.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          {isAdmin && (
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-[#0a1628] text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#1a3a6b] transition-all">
              <Plus className="w-4 h-4" /> Create Forum
            </button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-36 bg-slate-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-full" />
                  <div className="h-3 bg-slate-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : forums.length === 0 ? (
          <div className="py-20 text-center">
            <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="font-bold text-slate-400">No forums yet</p>
            {isAdmin && (
              <button onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 mt-4 bg-[#0a1628] text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#1a3a6b] transition-all">
                <Plus className="w-4 h-4" /> Create First Forum
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {forums.map(f => (
              <ForumCard key={f.id} f={f} isAdmin={isAdmin}
                onEdit={f => setEditForum(f)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreate && (
        <ForumModal onSave={handleCreate} onClose={() => setShowCreate(false)} />
      )}
      {editForum && (
        <ForumModal initial={editForum} onSave={handleEdit} onClose={() => setEditForum(null)} />
      )}
    </div>
  );
}
