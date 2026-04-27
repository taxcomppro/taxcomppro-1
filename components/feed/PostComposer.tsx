"use client";

import { useState, useRef, useCallback } from "react";
import { useAppSelector } from "@/store/hooks";
import { Loader2, X } from "lucide-react";
import { Image01Icon, SentIcon } from "hugeicons-react";
import type { FeedPost } from "@/components/feed/PostCard";

interface Props {
  onPostCreated: (post: FeedPost) => void;
}

export default function PostComposer({ onPostCreated }: Props) {
  const user         = useAppSelector(s => s.auth.user);
  const [content,    setContent]    = useState("");
  const [expanded,   setExpanded]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previews,   setPreviews]   = useState<{ file: File; url: string }[]>([]);
  const [uploading,  setUploading]  = useState(false);
  const textRef  = useRef<HTMLTextAreaElement>(null);
  const fileRef  = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const remaining = 4 - previews.length;
    Array.from(files).slice(0, remaining).forEach(file => {
      setPreviews(p => [...p, { file, url: URL.createObjectURL(file) }]);
    });
  }, [previews.length]);

  const removeImage = (idx: number) => {
    setPreviews(p => {
      URL.revokeObjectURL(p[idx].url);
      return p.filter((_, i) => i !== idx);
    });
  };

  const handleSubmit = async () => {
    if ((!content.trim() && previews.length === 0) || submitting) return;
    setSubmitting(true);
    try {
      let imageUrls: string[] = [];

      // Upload images to Cloudinary via our API route
      if (previews.length > 0) {
        setUploading(true);
        const fd = new FormData();
        previews.forEach(p => fd.append("files", p.file));
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        setUploading(false);
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json() as { urls: string[] };
        imageUrls = data.urls;
      }

      // Create the post
      const res = await fetch("/api/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim(), images: imageUrls }),
      });

      if (res.ok) {
        const post = await res.json() as FeedPost;
        onPostCreated(post);
        setContent("");
        setPreviews([]);
        setExpanded(false);
      }
    } catch { /* ignore */ }
    finally { setSubmitting(false); setUploading(false); }
  };

  const canSubmit = (content.trim().length > 0 || previews.length > 0) && !submitting;

  return (
    <div className="bg-white rounded-2xl p-4">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-[#0a1628] flex items-center justify-center overflow-hidden shrink-0">
          {user?.image
            ? <img src={user.image} alt={user.name ?? ""} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            : <span className="text-white font-bold text-sm">{user?.name?.[0]?.toUpperCase()}</span>}
        </div>

        <div className="flex-1">
          {!expanded ? (
            <button
              onClick={() => { setExpanded(true); setTimeout(() => textRef.current?.focus(), 50); }}
              className="w-full text-left text-slate-400 text-sm bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full px-5 py-3 transition-all">
              Share an insight or update, {user?.name?.split(" ")[0]}…
            </button>
          ) : (
            <div className="space-y-3">
              <textarea
                ref={textRef}
                value={content}
                onChange={e => setContent(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) handleSubmit(); }}
                placeholder="What's on your mind? Share a tax insight, update, or question…"
                rows={4}
                className="w-full font-[inherit] text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 resize-none outline-none focus:border-[#0a1628] focus:ring-2 focus:ring-[#0a1628]/10 transition-all"
              />

              {/* Image previews */}
              {previews.length > 0 && (
                <div className={`grid gap-2 ${previews.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                  {previews.map((p, i) => (
                    <div key={i} className="relative group rounded-xl overflow-hidden bg-slate-100 aspect-video">
                      <img src={p.url} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Toolbar */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                    onChange={e => handleFiles(e.target.files)} />
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={previews.length >= 4}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 px-3 py-2 rounded-lg hover:bg-emerald-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                    <Image01Icon className="w-4 h-4 text-emerald-500" />
                    Photo{previews.length > 0 ? ` (${previews.length}/4)` : ""}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setExpanded(false); setContent(""); setPreviews([]); }}
                    className="text-xs font-semibold text-slate-400 hover:text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition-all">
                    Cancel
                  </button>
                  <button onClick={handleSubmit} disabled={!canSubmit}
                    className="flex items-center gap-2 text-xs font-bold bg-[#0a1628] text-white px-5 py-2.5 rounded-full hover:bg-[#1a3a6b] transition-all disabled:opacity-40">
                    {uploading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
                      : submitting
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Posting…</>
                      : <><SentIcon className="w-4 h-4" /> Post</>}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
