"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, MapPin, Briefcase, Globe, Loader2, BadgeCheck } from "lucide-react";

interface Pro {
  id: string; name: string; image: string | null; coverImage: string | null;
  headline: string | null; bio: string | null; location: string | null;
  yearsExperience: number | null; specialties: string[]; certifications: string[];
}

const CERT_FILTERS = ["EA", "CPA", "CFP", "JD", "MBA"];

export default function ProsPage() {
  const [pros, setPros]       = useState<Pro[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ]             = useState("");
  const [cert, setCert]       = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    const res = await fetch(`/api/pros?${params}`);
    const data = await res.json() as Pro[];
    setPros(cert ? data.filter(p => p.certifications.includes(cert)) : data);
    setLoading(false);
  }, [q, cert]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0a1628] to-[#1a3a6b] text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
            <BadgeCheck className="w-4 h-4 text-amber-400" /> Verified Professionals
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-3">Find a Tax Professional</h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">Connect with verified Enrolled Agents, CPAs, and tax specialists.</p>

          {/* Search */}
          <div className="flex items-center gap-3 bg-white rounded-2xl px-5 py-3.5 mt-8 max-w-xl mx-auto shadow-xl">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input value={q} onChange={e => setQ(e.target.value)}
              placeholder="Search by name or specialty…"
              className="flex-1 text-slate-800 text-sm outline-none placeholder-slate-400 font-[inherit]" />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Cert filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button onClick={() => setCert("")}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${cert === "" ? "bg-[#0a1628] text-white border-[#0a1628]" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}>
            All
          </button>
          {CERT_FILTERS.map(c => (
            <button key={c} onClick={() => setCert(cert === c ? "" : c)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${cert === c ? "bg-amber-500 text-white border-amber-500" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}>
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-[#0a1628]" /></div>
        ) : pros.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-slate-400 text-lg font-semibold">No professionals found</p>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pros.map(pro => (
              <Link key={pro.id} href={`/pros/${pro.id}`}
                className="group bg-white rounded-2xl border border-slate-100 hover:border-[#0a1628]/20 hover:shadow-lg transition-all duration-200 overflow-hidden">
                {/* Cover */}
                <div className="h-20 bg-gradient-to-br from-[#0a1628] to-[#1a3a6b] relative">
                  {pro.coverImage && <img src={pro.coverImage} alt="" className="w-full h-full object-cover" />}
                  <div className="absolute -bottom-6 left-5">
                    <div className="w-14 h-14 rounded-xl border-2 border-white bg-[#1a3a6b] overflow-hidden flex items-center justify-center shadow-md">
                      {pro.image
                        ? <img src={pro.image} alt={pro.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        : <span className="text-white font-black text-xl">{pro.name[0]}</span>}
                    </div>
                  </div>
                </div>

                <div className="pt-8 px-5 pb-5">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h2 className="font-bold text-[#0a1628] text-base group-hover:text-[#1a3a6b] transition-colors leading-snug">{pro.name}</h2>
                    {pro.certifications.length > 0 && (
                      <span className="shrink-0 text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{pro.certifications[0]}</span>
                    )}
                  </div>
                  {pro.headline && <p className="text-slate-500 text-xs mb-3 line-clamp-1">{pro.headline}</p>}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {pro.specialties.slice(0, 3).map(s => (
                      <span key={s} className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    {pro.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{pro.location}</span>}
                    {pro.yearsExperience && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{pro.yearsExperience}y exp</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* CTA for members */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <div className="bg-gradient-to-br from-[#0a1628] to-[#1a3a6b] rounded-2xl p-8 text-white text-center">
          <BadgeCheck className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h2 className="text-xl font-black mb-2">Are you a Tax Professional?</h2>
          <p className="text-white/60 text-sm mb-5">Join the directory and get discovered by clients. Applications reviewed by our admin team.</p>
          <Link href="/apply-professional"
            className="inline-flex items-center gap-2 bg-[#f0c040] text-[#0a1628] font-bold text-sm px-6 py-3 rounded-full hover:bg-[#d4a017] transition-all shadow-lg">
            Apply to Become a Professional
          </Link>
        </div>
      </div>
    </div>
  );
}
