"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import {
  LayoutDashboard, ShoppingBag, Plus, ExternalLink, Trash2,
  CheckCircle2, Clock, XCircle, Star, Eye, TrendingUp,
  AlertCircle, Loader2, Settings, ChevronRight, Package,
} from "lucide-react";

/* ─── Types ─── */
interface Listing {
  id: string; title: string; category: string; status: string;
  price: number | null; images: string[]; tags: string[];
  viewCount: number; isFeatured: boolean; createdAt: string; slug: string | null;
}

interface StripeStatus {
  connected: boolean; onboarded: boolean; accountId: string | null;
  accountDetails: { email: string | null; chargesEnabled: boolean; payoutsEnabled: boolean } | null;
}

/* ─── Helpers ─── */
const CAT_COLORS: Record<string, string> = {
  SERVICE:  "bg-blue-100 text-blue-700",
  PRODUCT:  "bg-amber-100 text-amber-700",
  NETWORK:  "bg-emerald-100 text-emerald-700",
  TRAINING: "bg-purple-100 text-purple-700",
};

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { icon: React.ReactNode; label: string; cls: string }> = {
    APPROVED: { icon: <CheckCircle2 className="w-3 h-3" />, label: "Approved", cls: "bg-emerald-50 text-emerald-700" },
    PENDING:  { icon: <Clock className="w-3 h-3" />,        label: "Pending",  cls: "bg-amber-50 text-amber-700"   },
    REJECTED: { icon: <XCircle className="w-3 h-3" />,      label: "Rejected", cls: "bg-red-50 text-red-600"       },
  };
  const c = cfg[status] ?? cfg.PENDING;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${c.cls}`}>
      {c.icon}{c.label}
    </span>
  );
}

/* ─── Stripe Connect Card ─── */
function StripeCard({ status, onDisconnect }: { status: StripeStatus | null; onDisconnect: () => void }) {
  const [connecting,    setConnecting]    = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const res = await fetch("/api/seller/stripe-connect", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert("Failed to start Stripe onboarding. Check your STRIPE_SECRET_KEY.");
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Disconnect your Stripe account? You won\'t receive direct payments.")) return;
    setDisconnecting(true);
    await fetch("/api/seller/stripe-connect", { method: "DELETE" });
    onDisconnect();
    setDisconnecting(false);
  };

  const handleResumeOnboarding = async () => {
    setConnecting(true);
    try {
      const res = await fetch("/api/seller/stripe-connect", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setConnecting(false);
    }
  };

  if (!status) return <div className="bg-white rounded-2xl p-5 animate-pulse h-32 border border-slate-100" />;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-50">
        <div className="w-9 h-9 rounded-xl bg-[#6772e5]/10 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#6772e5]">
            <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
          </svg>
        </div>
        <div className="flex-1">
          <div className="font-black text-[#0a1628] text-sm">Stripe Connect</div>
          <div className="text-[11px] text-slate-400">Receive payments directly in your bank account</div>
        </div>
        {status.connected && status.onboarded && (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> Active
          </span>
        )}
        {status.connected && !status.onboarded && (
          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
            <AlertCircle className="w-3 h-3" /> Incomplete
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Connected details */}
        {status.connected && status.accountDetails && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Email",   value: status.accountDetails.email ?? "—" },
              { label: "Charges", value: status.accountDetails.chargesEnabled ? "Enabled" : "Disabled" },
              { label: "Payouts", value: status.accountDetails.payoutsEnabled ? "Enabled" : "Disabled" },
              { label: "Account", value: (status.accountId?.slice(0, 20) ?? "—") + "…" },
            ].map(s => (
              <div key={s.label} className="bg-slate-50 rounded-xl px-3 py-2">
                <div className="text-[10px] text-slate-400 font-semibold">{s.label}</div>
                <div className="text-xs font-bold text-[#0a1628] truncate">{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          {!status.connected ? (
            <button onClick={handleConnect} disabled={connecting}
              className="inline-flex items-center gap-2 bg-[#6772e5] hover:bg-[#5469d4] text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all disabled:opacity-60">
              {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
              {connecting ? "Starting…" : "Connect Stripe Account"}
            </button>
          ) : (
            <>
              {!status.onboarded && (
                <button onClick={handleResumeOnboarding} disabled={connecting}
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all disabled:opacity-60">
                  {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertCircle className="w-4 h-4" />}
                  {connecting ? "Loading…" : "Complete Onboarding"}
                </button>
              )}
              <button onClick={handleDisconnect} disabled={disconnecting}
                className="inline-flex items-center gap-2 text-red-500 bg-red-50 hover:bg-red-100 font-bold text-sm px-4 py-2.5 rounded-xl transition-all disabled:opacity-60">
                {disconnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {disconnecting ? "Disconnecting…" : "Disconnect"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Listing Row ─── */
function ListingRow({ l, onDelete }: { l: Listing; onDelete: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete "${l.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    const res = await fetch(`/api/seller/listings/${l.id}`, { method: "DELETE" });
    if (res.ok) onDelete(l.id);
    else setDeleting(false);
  };

  const slugOrId = l.slug ?? l.id;

  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors group">
      {/* Thumb */}
      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
        {l.images?.[0]
          ? <img src={l.images[0]} alt={l.title} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-slate-300 text-2xl font-black">{l.title[0]}</div>}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-[#0a1628] text-sm truncate max-w-[200px]">{l.title}</span>
          {l.isFeatured && (
            <span className="flex items-center gap-0.5 text-[9px] font-black text-[#d4a017] bg-amber-50 px-1.5 py-0.5 rounded-full">
              <Star className="w-2.5 h-2.5" /> Featured
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${CAT_COLORS[l.category] ?? "bg-slate-100 text-slate-500"}`}>{l.category}</span>
          <StatusBadge status={l.status} />
          <span className="flex items-center gap-0.5 text-[10px] text-slate-400"><Eye className="w-3 h-3" />{l.viewCount}</span>
        </div>
      </div>

      {/* Price */}
      <div className="text-sm font-black text-[#0a1628] shrink-0 tabular-nums hidden sm:block">
        {l.price != null ? `$${l.price.toLocaleString()}` : <span className="text-emerald-600 text-xs">Free</span>}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link href={`/${slugOrId}`} target="_blank"
          className="p-2 rounded-lg hover:bg-slate-200 transition-colors" title="View">
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
        </Link>
        <button onClick={handleDelete} disabled={deleting}
          className="p-2 rounded-lg hover:bg-red-50 transition-colors" title="Delete">
          {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" /> : <Trash2 className="w-3.5 h-3.5 text-red-400" />}
        </button>
      </div>
    </div>
  );
}

/* ─── Page (inner — needs Suspense for useSearchParams) ─── */
function SellerDashboardInner() {
  const user = useAppSelector(s => s.auth.user);
  const searchParams = useSearchParams();
  const stripeMsg = searchParams.get("stripe");

  const [mounted,      setMounted]      = useState(false);
  const [listings,     setListings]     = useState<Listing[]>([]);
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [stripeLoading,setStripeLoading]= useState(true);

  useEffect(() => { setMounted(true); }, []);

  const ALLOWED = ["MARKETPLACE", "MARKETPLACE_PLUS", "ADMIN"];
  const canSell = user && (ALLOWED.includes(user.tier ?? "") || user.role === "ADMIN");

  const loadListings = useCallback(() => {
    fetch("/api/listings/my").then(r => r.json()).then(d => {
      setListings(Array.isArray(d) ? d : []);
    }).finally(() => setLoading(false));
  }, []);

  const loadStripe = useCallback(() => {
    fetch("/api/seller/stripe-connect").then(r => r.json()).then(d => {
      if (!d.error) setStripeStatus(d);
    }).finally(() => setStripeLoading(false));
  }, []);

  useEffect(() => {
    if (!mounted || !canSell) return;
    loadListings();
    loadStripe();
  }, [mounted, canSell, loadListings, loadStripe]);

  // Stats
  const approved = listings.filter(l => l.status === "APPROVED").length;
  const pending  = listings.filter(l => l.status === "PENDING").length;
  const rejected = listings.filter(l => l.status === "REJECTED").length;
  const totalViews = listings.reduce((a, l) => a + (l.viewCount ?? 0), 0);

  // Prevent hydration mismatch — wait for client mount
  if (!mounted) {
    return <div className="min-h-screen bg-[#f4f6fb]" />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f4f6fb] flex items-center justify-center">
        <div className="bg-white rounded-2xl p-12 text-center max-w-sm shadow-sm">
          <LayoutDashboard className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h1 className="font-black text-[#0a1628] text-xl mb-2">Sign in required</h1>
          <Link href="/login?redirect=/seller-dashboard"
            className="inline-flex items-center gap-2 bg-[#0a1628] text-white font-bold text-sm px-6 py-3 rounded-xl mt-4 hover:bg-[#1a3a6b] transition-all">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (!canSell) {
    return (
      <div className="min-h-screen bg-[#f4f6fb] flex items-center justify-center">
        <div className="bg-white rounded-2xl p-12 text-center max-w-sm shadow-sm">
          <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h1 className="font-black text-[#0a1628] text-xl mb-2">Marketplace Plan Required</h1>
          <p className="text-slate-400 text-sm mb-5">Upgrade to the Marketplace plan ($79.99/mo) to list your services and receive payments.</p>
          <Link href="/upgrade"
            className="inline-flex items-center gap-2 bg-[#0a1628] text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#1a3a6b] transition-all">
            Upgrade Now <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6fb] pt-5 pb-14">
      <div className="max-w-[1320px] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">

          {/* ── Left Sidebar ── */}
          <div className="hidden lg:block self-start sticky top-[90px] space-y-3">
            {/* Profile */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-100">
              {/* Banner */}
              <div className="h-24 relative">
                {user.coverImage
                  ? <div className="absolute inset-0 overflow-hidden"><img src={user.coverImage} alt="" className="w-full h-full object-cover" /></div>
                  : <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#1a3a6b] to-[#0d2a50]">
                      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                    </div>
                }
                <div className="absolute -bottom-9 left-4">
                  <div className="w-[72px] h-[72px] rounded-2xl border-[3px] border-white bg-[#0a1628] overflow-hidden flex items-center justify-center shadow-md">
                    {user.image
                      ? <img src={user.image} alt={user.name ?? ""} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      : <span className="text-white font-black text-2xl">{user.name?.[0]?.toUpperCase()}</span>}
                  </div>
                </div>
              </div>
              <div className="px-4 pt-12 pb-4 relative z-10">
                <div className="font-black text-[#0a1628] text-base truncate">{user.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">{user.headline ?? user.tier + " plan"}</div>
              </div>
            </div>

            {/* Nav */}
            <div className="bg-white rounded-2xl border border-slate-100 p-2 space-y-0.5">
              {[
                { href: "/seller-dashboard", Icon: LayoutDashboard, label: "Dashboard",       active: true  },
                { href: "/marketplace",      Icon: ShoppingBag,     label: "Browse Marketplace", active: false },
                { href: "/profile",          Icon: Settings,        label: "Profile Settings",   active: false },
              ].map(({ href, Icon, label, active }) => (
                <Link key={href} href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${active ? "bg-[#0a1628] text-white" : "text-slate-600 hover:bg-slate-50"}`}>
                  <Icon className="w-4 h-4 shrink-0" /> {label}
                </Link>
              ))}
            </div>

            {/* Create listing CTA */}
            <Link href="/marketplace?create=1"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#d4a017] to-amber-500 text-white font-bold text-sm px-4 py-3 rounded-xl hover:opacity-90 transition-all w-full shadow-md shadow-amber-200/50">
              <Plus className="w-4 h-4" /> Create Listing
            </Link>
          </div>

          {/* ── Main Content ── */}
          <div className="space-y-5 min-w-0">

            {/* Header */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black text-[#0a1628]">Seller Dashboard</h1>
                <p className="text-slate-400 text-sm mt-0.5">Manage your listings and payments</p>
              </div>
              <Link href="/marketplace?create=1"
                className="lg:hidden flex items-center gap-1.5 bg-[#0a1628] text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-[#1a3a6b] transition-all">
                <Plus className="w-3.5 h-3.5" /> Create
              </Link>
            </div>

            {/* Stripe toast */}
            {stripeMsg === "success" && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> Stripe account connected successfully!
              </div>
            )}
            {stripeMsg === "error" && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-5 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" /> Stripe connection failed. Please try again.
              </div>
            )}
            {stripeMsg === "cancelled" && (
              <div className="bg-slate-50 border border-slate-200 text-slate-600 px-5 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" /> Stripe connection cancelled.
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total Listings", value: listings.length, Icon: ShoppingBag,  color: "text-[#0a1628]", bg: "bg-slate-100" },
                { label: "Approved",       value: approved,         Icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100" },
                { label: "Pending Review", value: pending,          Icon: Clock,        color: "text-amber-600",   bg: "bg-amber-100"   },
                { label: "Total Views",    value: totalViews,       Icon: TrendingUp,   color: "text-blue-600",    bg: "bg-blue-100"    },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl p-4 border border-slate-100">
                  <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center mb-2`}>
                    <s.Icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <div className="text-2xl font-black text-[#0a1628]">{s.value}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Stripe Connect */}
            {stripeLoading
              ? <div className="bg-white rounded-2xl p-5 animate-pulse h-32 border border-slate-100" />
              : <StripeCard status={stripeStatus} onDisconnect={loadStripe} />
            }

            {/* Listings */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                <div>
                  <h2 className="font-black text-[#0a1628] text-sm">My Listings</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {loading ? "Loading…" : `${listings.length} listing${listings.length !== 1 ? "s" : ""}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {rejected > 0 && (
                    <span className="text-[11px] font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-full">
                      {rejected} rejected
                    </span>
                  )}
                  <Link href="/marketplace?create=1"
                    className="flex items-center gap-1.5 bg-[#0a1628] text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-[#1a3a6b] transition-all">
                    <Plus className="w-3.5 h-3.5" /> New Listing
                  </Link>
                </div>
              </div>

              {loading ? (
                <div className="divide-y divide-slate-50">
                  {[1,2,3].map(i => (
                    <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                      <div className="w-12 h-12 rounded-xl bg-slate-200 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-1/3" />
                        <div className="h-3 bg-slate-200 rounded w-1/4" />
                      </div>
                      <div className="h-6 bg-slate-200 rounded w-16" />
                    </div>
                  ))}
                </div>
              ) : listings.length === 0 ? (
                <div className="py-20 text-center">
                  <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="font-bold text-slate-400">No listings yet</p>
                  <p className="text-slate-400 text-sm mt-1 mb-5">Create your first listing to start selling.</p>
                  <Link href="/marketplace?create=1"
                    className="inline-flex items-center gap-2 bg-[#0a1628] text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#1a3a6b] transition-all">
                    <Plus className="w-4 h-4" /> Create First Listing
                  </Link>
                </div>
              ) : (
                <div>
                  {listings.map(l => (
                    <ListingRow key={l.id} l={l} onDelete={id => setListings(prev => prev.filter(x => x.id !== id))} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SellerDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4f6fb]" />}>
      <SellerDashboardInner />
    </Suspense>
  );
}
