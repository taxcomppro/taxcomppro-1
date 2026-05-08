"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, Trash2, Download, CheckCircle2, Loader2, FileIcon, AlertCircle } from "lucide-react";
import { getAllToolkits } from "@/lib/toolkits";

interface Asset {
  fileUrl: string; fileName: string; fileSize: number | null; uploadedAt: string; updatedAt: string;
}
interface ToolkitRow {
  toolkitId: string; name: string; emoji: string; price: number; asset: Asset | null;
}

function fmtSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function ToolkitAssetsPage() {
  const [rows,    setRows]    = useState<ToolkitRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [deleting,  setDeleting]  = useState<Record<string, boolean>>({});
  const [toast,   setToast]   = useState<{ msg: string; ok: boolean } | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetch("/api/admin/toolkit-assets")
      .then(r => r.json())
      .then(setRows)
      .catch(() => showToast("Failed to load assets", false))
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async (toolkitId: string, file: File) => {
    setUploading(p => ({ ...p, [toolkitId]: true }));
    try {
      // Step 1: Upload to Cloudinary
      const fd = new FormData();
      fd.append("file", file);
      fd.append("toolkitId", toolkitId);
      const uploadRes = await fetch("/api/admin/toolkit-assets/upload", { method: "POST", body: fd });
      if (!uploadRes.ok) throw new Error((await uploadRes.json()).error ?? "Upload failed");
      const { fileUrl, fileName, fileSize } = await uploadRes.json() as { fileUrl: string; fileName: string; fileSize: number };

      // Step 2: Save to DB
      const saveRes = await fetch("/api/admin/toolkit-assets", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ toolkitId, fileUrl, fileName, fileSize }),
      });
      if (!saveRes.ok) throw new Error("Failed to save asset");
      const asset = await saveRes.json() as Asset;

      setRows(prev => prev.map(r => r.toolkitId === toolkitId ? { ...r, asset } : r));
      showToast(`✅ "${fileName}" uploaded successfully!`);
    } catch (e: unknown) {
      showToast((e as Error).message ?? "Upload failed", false);
    } finally {
      setUploading(p => ({ ...p, [toolkitId]: false }));
    }
  };

  const handleDelete = async (toolkitId: string) => {
    if (!confirm("Remove this download file?")) return;
    setDeleting(p => ({ ...p, [toolkitId]: true }));
    try {
      await fetch("/api/admin/toolkit-assets", {
        method:  "DELETE",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ toolkitId }),
      });
      setRows(prev => prev.map(r => r.toolkitId === toolkitId ? { ...r, asset: null } : r));
      showToast("File removed.");
    } catch {
      showToast("Failed to remove", false);
    } finally {
      setDeleting(p => ({ ...p, [toolkitId]: false }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-full shadow-xl text-sm font-bold transition-all ${toast.ok ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
          {toast.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#0a1628]">Toolkit Digital Downloads</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Upload the downloadable files for each toolkit. Users will receive a download link after purchase.
          Supports ZIP, PDF, MP4, or any file type.
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-800 leading-relaxed">
          Files are uploaded to <strong>Cloudinary</strong> under the <code>toolkit-downloads/</code> folder.
          Each new upload <strong>replaces</strong> the previous file for that toolkit.
          The download link is immediately available to users who purchased that toolkit.
        </div>
      </div>

      {/* Toolkit rows */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-[#d4a017] animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map(row => (
            <div key={row.toolkitId} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 flex items-start gap-4">

                {/* Emoji + info */}
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
                  {row.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-[#0a1628] text-sm">{row.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">${row.price} · ID: <code className="bg-slate-100 px-1 rounded">{row.toolkitId}</code></div>

                  {/* Current file */}
                  {row.asset ? (
                    <div className="mt-3 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-emerald-800 truncate">{row.asset.fileName}</p>
                        <p className="text-[10px] text-emerald-600 mt-0.5">
                          {fmtSize(row.asset.fileSize)} · Updated {new Date(row.asset.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <a href={`/api/download/toolkit/${row.toolkitId}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline shrink-0">
                        <Download className="w-3.5 h-3.5" /> Preview
                      </a>
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
                      <FileIcon className="w-4 h-4 text-amber-400 shrink-0" />
                      <p className="text-xs text-amber-700 font-semibold">No file uploaded yet — users cannot download after purchase.</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={el => { fileInputs.current[row.toolkitId] = el; }}
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) { handleUpload(row.toolkitId, f); e.target.value = ""; }
                    }}
                  />
                  <button
                    onClick={() => fileInputs.current[row.toolkitId]?.click()}
                    disabled={uploading[row.toolkitId]}
                    className="flex items-center gap-2 bg-[#0a1628] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#1a3a6b] transition-all disabled:opacity-50"
                  >
                    {uploading[row.toolkitId]
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…</>
                      : <><Upload className="w-3.5 h-3.5" /> {row.asset ? "Replace File" : "Upload File"}</>
                    }
                  </button>
                  {row.asset && (
                    <button
                      onClick={() => handleDelete(row.toolkitId)}
                      disabled={deleting[row.toolkitId]}
                      className="flex items-center gap-2 bg-red-50 text-red-500 text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-red-100 transition-all disabled:opacity-50"
                    >
                      {deleting[row.toolkitId]
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Trash2 className="w-3.5 h-3.5" />
                      }
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Upload progress bar */}
              {uploading[row.toolkitId] && (
                <div className="h-1 bg-slate-100">
                  <div className="h-full bg-gradient-to-r from-[#f0c040] to-[#d4a017] animate-pulse w-full" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
