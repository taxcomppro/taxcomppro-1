"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { Loader2 } from "lucide-react";
import {
  Search01Icon, ShoppingBag01Icon, StarIcon, Add01Icon, EyeIcon,
  FilterIcon, BookOpen01Icon, GlobeIcon, Briefcase01Icon, School01Icon,
  UserCircleIcon, Rocket01Icon, ArrowRight01Icon,
} from "hugeicons-react";

type Category = "ALL" | "SERVICE" | "PRODUCT" | "NETWORK" | "TRAINING";

interface Listing {
  id: string; slug: string | null; title: string; description: string;
  category: string; price: number | null; tags: string[];
  isFeatured: boolean; viewCount: number; createdAt: string;
  user: { id: string; name: string; image: string | null; headline: string | null; role: string; tier: string };
}

/* ─── Per-category config ──────────────────────────────────── */
const CAT_CONFIG: Record<string, {
  label: string; icon: React.ElementType;
  pill: string; accent: string;
}> = {
  SERVICE:  { label: "Service",  icon: Briefcase01Icon, pill: "bg-blue-100 text-blue-700",    accent: "text-blue-600" },
  PRODUCT:  { label: "Product",  icon: ShoppingBag01Icon, pill: "bg-amber-100 text-amber-700",  accent: "text-amber-600" },
  NETWORK:  { label: "Network",  icon: GlobeIcon,       pill: "bg-emerald-100 text-emerald-700", accent: "text-emerald-600" },
  TRAINING: { label: "Training", icon: School01Icon,    pill: "bg-purple-100 text-purple-700",  accent: "text-purple-600" },
};
const DEFAULT_CFG = { label: "Other", icon: BookOpen01Icon, pill: "bg-slate-100 text-slate-600", accent: "text-slate-600" };

const CATS: Category[] = ["ALL", "SERVICE", "PRODUCT", "NETWORK", "TRAINING"];

/* ─── Skeleton card ────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-5 animate-pulse space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-200 shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 bg-slate-200 rounded w-16" />
          <div className="h-4 bg-slate-200 rounded w-2/3" />
        </div>
        <div className="h-6 w-16 bg-slate-200 rounded-full shrink-0" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3 bg-slate-200 rounded w-full" />
        <div className="h-3 bg-slate-200 rounded w-4/5" />
      </div>
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-200" />
          <div className="h-3 w-20 bg-slate-200 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-3 w-12 bg-slate-200 rounded" />
          <div className="h-6 w-16 bg-slate-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/* ─── Listing card ─────────────────────────────────────────── */
function ListingCard({ l, authed }: { l: Listing; authed: boolean }) {
  const cfg      = CAT_CONFIG[l.category] ?? DEFAULT_CFG;
  const Icon     = cfg.icon;
  const slugOrId = l.slug ?? l.id;
  const href     = authed ? `/${slugOrId}` : `/login?redirect=/${slugOrId}`;

  return (
    <Link href={href} className="group bg-white rounded-2xl p-5 flex flex-col gap-3 transition-all hover:-translate-y-0.5 block">

      {/* Row 1: icon + title + price */}
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.pill}`}>
          <Icon className="w-[18px] h-[18px]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.pill}`}>{cfg.label}</span>
            {l.isFeatured && (
              <span className="text-[10px] font-bold text-[#d4a017] flex items-center gap-0.5">
                <StarIcon className="w-3 h-3" /> Featured
              </span>
            )}
          </div>
          <h3 className="font-black text-[#0a1628] text-sm leading-snug line-clamp-1 group-hover:text-[#1a3a6b] transition-colors">
            {l.title}
          </h3>
        </div>
        {/* Price — top right, always visible */}
        <div className="shrink-0 text-right">
          <div className="font-black text-[#0a1628] text-lg leading-none">
            {l.price != null ? `$${l.price}` : "Free"}
          </div>
        </div>
      </div>

      {/* Row 2: description */}
      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{l.description}</p>

      {/* Row 3: tags + seller + views + arrow */}
      <div className="flex items-center justify-between gap-3">
        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          {l.tags.slice(0, 3).map(t => (
            <span key={t} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">#{t}</span>
          ))}
        </div>

        {/* Seller + views + CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-[#0a1628] overflow-hidden flex items-center justify-center">
              {l.user.image
                ? <img src={l.user.image} alt={l.user.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                : <span className="text-white font-bold text-[10px]">{l.user.name?.[0]?.toUpperCase()}</span>}
            </div>
            <span className="text-xs font-semibold text-slate-600 max-w-[80px] truncate">{l.user.name}</span>
          </div>
          <span className="flex items-center gap-0.5 text-[11px] text-slate-400">
            <EyeIcon className="w-3 h-3" />{l.viewCount}
          </span>
          <span className="flex items-center gap-1 text-xs font-bold text-[#0a1628] group-hover:gap-1.5 transition-all">
            View <ArrowRight01Icon className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ─── Sidebar ──────────────────────────────────────────────── */
function MarketplaceSidebar({
  user, cat, setCat, canSell,
}: {
  user: { name: string | null; image?: string | null; headline?: string | null; tier: string } | null;
  cat: Category; setCat: (c: Category) => void; canSell: boolean;
}) {
  return (
    <div className="space-y-2.5">

      {/* Profile mini-card */}
      {user && (
        <div className="bg-white rounded-2xl overflow-hidden">
          {/* cover — same height as FeedLeftPanel */}
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
          </div>
        </div>
      )}

      {/* Create listing CTA */}
      {canSell ? (
        <Link href="/marketplace/create"
          className="flex items-center justify-center gap-2 bg-[#0a1628] text-white font-bold text-sm px-4 py-3 rounded-xl hover:bg-[#1a3a6b] transition-all w-full">
          <Add01Icon className="w-4 h-4" /> Create Listing
        </Link>
      ) : user ? (
        <Link href="/upgrade"
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#f0c040] to-[#d4a017] text-[#0a1628] font-bold text-sm px-4 py-3 rounded-xl transition-all w-full hover:shadow-md">
          <Rocket01Icon className="w-4 h-4" /> Upgrade to Sell
        </Link>
      ) : (
        <Link href="/register"
          className="flex items-center justify-center gap-2 bg-[#0a1628] text-white font-bold text-sm px-4 py-3 rounded-xl hover:bg-[#1a3a6b] transition-all w-full">
          <UserCircleIcon className="w-4 h-4" /> Sign up to Sell
        </Link>
      )}

      {/* Category filter */}
      <div className="bg-white rounded-2xl p-3">
        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 px-2">Browse By</p>
        <div className="space-y-0.5">
          {CATS.map(c => {
            const cfg  = c === "ALL" ? null : CAT_CONFIG[c];
            const Icon = cfg?.icon ?? FilterIcon;
            return (
              <button key={c} onClick={() => setCat(c)}
                className={`flex items-center gap-2.5 w-full text-left text-sm font-semibold px-3 py-2.5 rounded-xl transition-all ${cat === c ? "bg-[#0a1628] text-white" : "text-slate-600 hover:bg-slate-50 hover:text-[#0a1628]"}`}>
                {c === "ALL"
                  ? <ShoppingBag01Icon className="w-4 h-4" />
                  : <Icon className="w-4 h-4" />}
                {c === "ALL" ? "All Categories" : cfg!.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* My Listings link (for sellers) */}
      {canSell && (
        <Link href="/my-listings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-white hover:text-[#0a1628] transition-all">
          <ShoppingBag01Icon className="w-4 h-4 text-slate-400" />
          My Listings
        </Link>
      )}
    </div>
  );
}

/* ─── Main page ────────────────────────────────────────────── */
function MarketplaceContent() {
  const user = useAppSelector(s => s.auth.user);
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading]   = useState(true);
  const [cat, setCat]           = useState<Category>("ALL");
  const [search, setSearch]     = useState(searchParams.get("search") ?? "");
  const [query, setQuery]       = useState(searchParams.get("search") ?? "");

  const canSell = !!(user && (
    user.role === "ADMIN" || user.role === "PROFESSIONAL" ||
    user.tier === "MARKETPLACE" || user.tier === "MARKETPLACE_PLUS"
  ));

  useEffect(() => {
    const params = new URLSearchParams();
    if (cat !== "ALL") params.set("category", cat);
    if (query) params.set("search", query);
    setLoading(true);
    fetch(`/api/marketplace?${params}`)
      .then(r => r.json())
      .then(data => setListings(Array.isArray(data) ? data : []))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [cat, query]);

  useEffect(() => {
    const t = setTimeout(() => setQuery(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="min-h-screen bg-slate-100 pt-4 pb-12">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 items-start">

          {/* Fixed sidebar */}
          <div className="hidden lg:block self-start sticky top-[100px] h-fit max-h-[calc(100vh-100px)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <MarketplaceSidebar
              user={user ? { ...user, image: user.image ?? null, headline: user.headline ?? null } : null}
              cat={cat} setCat={setCat} canSell={canSell}
            />
          </div>

          {/* Main content */}
          <div className="space-y-4">

            {/* Page header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-[#0a1628]">Marketplace</h1>
                <p className="text-slate-500 text-sm mt-0.5">
                  {loading ? "Loading…" : `${listings.length} listing${listings.length !== 1 ? "s" : ""}`}
                </p>
              </div>
              {canSell && (
                <Link href="/marketplace/create"
                  className="flex items-center gap-2 bg-[#0a1628] text-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-[#1a3a6b] transition-all shrink-0 lg:hidden">
                  <Add01Icon className="w-4 h-4" /> Create Listing
                </Link>
              )}
            </div>

            {/* Search bar */}
            <div className="bg-white rounded-xl px-4 py-3 flex items-center gap-3">
              <Search01Icon className="w-4 h-4 text-slate-400 shrink-0" />
              <input type="text" placeholder="Search services, products, trainers…"
                value={search} onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent font-[inherit] text-sm text-slate-700 outline-none placeholder-slate-400" />
              {search && (
                <button onClick={() => { setSearch(""); setQuery(""); }}
                  className="text-slate-400 hover:text-slate-600 text-xs font-semibold">Clear</button>
              )}
            </div>

            {/* Mobile category chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {CATS.map(c => (
                <button key={c} onClick={() => setCat(c)}
                  className={`text-xs font-semibold px-3.5 py-2 rounded-full transition-all shrink-0 ${cat === c ? "bg-[#0a1628] text-white" : "bg-white text-slate-600"}`}>
                  {c === "ALL" ? "All" : CAT_CONFIG[c]?.label}
                </button>
              ))}
            </div>

            {/* Featured banner — removed */}

            {/* Cards / Skeleton / Empty */}
            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : listings.length === 0 ? (
              <div className="bg-white rounded-2xl py-24 text-center">
                <ShoppingBag01Icon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="font-bold text-slate-400 text-lg">No listings found</p>
                <p className="text-slate-400 text-sm mt-1">
                  {query ? "Try a different search term" : "Be the first to list your services!"}
                </p>
                {canSell && (
                  <Link href="/marketplace/create"
                    className="inline-flex items-center gap-2 mt-5 bg-[#0a1628] text-white font-bold text-sm px-6 py-3 rounded-full hover:bg-[#1a3a6b] transition-all">
                    <Add01Icon className="w-4 h-4" /> Create First Listing
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {listings.map(l => <ListingCard key={l.id} l={l} authed={!!user} />)}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-100" />}>
      <MarketplaceContent />
    </Suspense>
  );
}
