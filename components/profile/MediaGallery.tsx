"use client";

import { useState, useRef } from "react";
import { Plus, X, Loader2, Image as ImageIcon } from "lucide-react";

interface MediaGalleryProps {
  photos: string[];
  onChange: (photos: string[]) => void;
}

export default function MediaGallery({ photos, onChange }: MediaGalleryProps) {
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    const fd = new FormData();
    files.slice(0, 8).forEach(f => fd.append("files", f));
    fd.append("type", "media");
    const res = await fetch("/api/upload/profile", { method: "POST", body: fd });
    if (res.ok) {
      const { urls } = await res.json() as { urls: string[] };
      onChange([...photos, ...urls].slice(0, 12));
    }
    setUploading(false);
    e.target.value = "";
  };

  const remove = (url: string) => onChange(photos.filter(p => p !== url));

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {photos.map(p => (
          <div key={p} className="relative aspect-square rounded-xl overflow-hidden group">
            <img src={p} alt="" className="w-full h-full object-cover" />
            <button onClick={() => remove(p)}
              className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        {photos.length < 12 && (
          <button onClick={() => ref.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-slate-200 hover:border-[#0a1628] hover:bg-slate-50 flex flex-col items-center justify-center gap-1 transition-all text-slate-400 hover:text-[#0a1628]">
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /><span className="text-[10px] font-bold">Add</span></>}
          </button>
        )}
      </div>
      {photos.length === 0 && !uploading && (
        <div onClick={() => ref.current?.click()}
          className="mt-2 p-8 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center gap-2 cursor-pointer hover:border-[#0a1628] hover:bg-slate-50 transition-all">
          <ImageIcon className="w-8 h-8 text-slate-300" />
          <p className="text-xs font-semibold text-slate-400">Click to upload photos &amp; media</p>
          <p className="text-[10px] text-slate-300">Up to 12 photos</p>
        </div>
      )}
      <input ref={ref} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
    </div>
  );
}
