"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { listingSchema, type ListingInput } from "@/lib/schemas";
import { FileText, Tag, DollarSign, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";

const CATEGORIES = [
  { value: "SERVICE",  label: "Service",  desc: "Consulting, advice, or professional work" },
  { value: "PRODUCT",  label: "Product",  desc: "Downloadable guides, templates, or tools" },
  { value: "NETWORK",  label: "Network",  desc: "Referral networks or professional groups" },
  { value: "TRAINING", label: "Training", desc: "Courses, webinars, or CE credit programs" },
];

export default function CreateListingPage() {
  const router     = useRouter();
  const authUser   = useAppSelector(s => s.auth.user);
  const isAdmin    = authUser?.role === "ADMIN";
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(false);
  const [error, setError]           = useState("");
  const [tagInput, setTagInput]     = useState("");
  const [tags, setTags]             = useState<string[]>([]);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ListingInput>({
    resolver: zodResolver(listingSchema),
    defaultValues: { category: "SERVICE" },
  });

  const selectedCat = watch("category");

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 8) {
      setTags(p => [...p, t]);
      setTagInput("");
    }
  };

  const onSubmit = async (data: ListingInput) => {
    setSubmitting(true); setError("");
    try {
      const res = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, tags }),
      });
      if (!res.ok) { setError((await res.json()).error ?? "Failed to create listing"); return; }
      setSuccess(true);
      setTimeout(() => router.push("/marketplace"), 2000);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setSubmitting(false); }
  };

  if (success) return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-12 text-center max-w-md mx-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isAdmin ? "bg-amber-100" : "bg-emerald-100"}`}>
          <CheckCircle2 className={`w-8 h-8 ${isAdmin ? "text-amber-500" : "text-emerald-500"}`} />
        </div>
        <h2 className="text-xl font-black text-[#0a1628] mb-2">
          {isAdmin ? "Live & Featured! ⭐" : "Listing Submitted!"}
        </h2>
        <p className="text-slate-500 text-sm">
          {isAdmin
            ? "Your listing is now live and pinned at the top of the marketplace."
            : "Your listing is under review. We'll notify you once it's approved."}
        </p>
        <p className="text-slate-400 text-xs mt-2">Redirecting to Marketplace…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="max-w-2xl mx-auto px-4 space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/marketplace"
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all">
            <ArrowLeft className="w-4 h-4 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-[#0a1628]">Create Listing</h1>
            <p className="text-slate-500 text-sm">
              {isAdmin
                ? "Your listing will be instantly live and featured at the top"
                : "Your listing will be reviewed before going live"}
            </p>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Category */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <label className="block text-sm font-bold text-[#0a1628] mb-3">Category</label>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map(c => (
                <button key={c.value} type="button"
                  onClick={() => setValue("category", c.value as ListingInput["category"])}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${selectedCat === c.value ? "border-[#d4a017] bg-[#d4a017]/5" : "border-slate-200 hover:border-slate-300"}`}>
                  <div className="font-bold text-[#0a1628] text-sm">{c.label}</div>
                  <div className="text-slate-400 text-xs mt-0.5">{c.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title, Description, Price */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#0a1628] mb-1.5">Listing Title *</label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="e.g. IRS Audit Defense Consultation"
                  className={`w-full font-[inherit] text-sm pl-10 pr-4 py-3 border rounded-xl outline-none transition-all ${errors.title ? "border-red-400" : "border-slate-200 focus:border-[#0a1628] focus:ring-2 focus:ring-[#0a1628]/10"}`}
                  {...register("title")} />
              </div>
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0a1628] mb-1.5">Description *</label>
              <textarea placeholder="Describe your listing in detail…" rows={5}
                className={`w-full font-[inherit] text-sm px-4 py-3 border rounded-xl outline-none transition-all resize-none ${errors.description ? "border-red-400" : "border-slate-200 focus:border-[#0a1628] focus:ring-2 focus:ring-[#0a1628]/10"}`}
                {...register("description")} />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0a1628] mb-1.5">Price (USD) — leave blank for free</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="number" min="0" step="0.01" placeholder="0.00"
                  className="w-full font-[inherit] text-sm pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-[#0a1628] focus:ring-2 focus:ring-[#0a1628]/10 transition-all"
                  {...register("price", { valueAsNumber: true })} />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <label className="block text-sm font-bold text-[#0a1628] mb-1.5">Tags (optional, up to 8)</label>
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="e.g. irs, audit, cpa" value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  className="w-full font-[inherit] text-sm pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-[#0a1628] focus:ring-2 focus:ring-[#0a1628]/10 transition-all" />
              </div>
              <button type="button" onClick={addTag}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm rounded-xl transition-all">
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map(t => (
                  <span key={t} className="inline-flex items-center gap-1.5 bg-[#0a1628] text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                    {t}
                    <button type="button" onClick={() => setTags(p => p.filter(x => x !== t))}
                      className="text-white/60 hover:text-white ml-0.5">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={submitting}
            className={`w-full font-black text-base py-4 rounded-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:transform-none flex items-center justify-center gap-2 ${isAdmin ? "bg-gradient-to-r from-[#f0c040] to-[#d4a017] text-[#0a1628] hover:shadow-[0_0_24px_rgba(212,160,23,.5)]" : "bg-[#0a1628] text-white hover:bg-[#1a3a6b]"}`}>
            {submitting
              ? <><Loader2 className="w-5 h-5 animate-spin" />Submitting…</>
              : isAdmin ? "Publish as Featured Listing ⭐" : "Submit Listing for Review"}
          </button>
        </form>
      </div>
    </div>
  );
}
