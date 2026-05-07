"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import Link from "next/link";
import { Download, CheckCircle2, Loader2, ExternalLink, Crown } from "lucide-react";

interface Purchase {
  id: string; toolkitId: string; name: string; emoji: string;
  membershipTier: string; membershipMonths: number;
  createdAt: string; downloadUrl: string | null;
}

const TIER_LABELS: Record<string, string> = {
  MARKETPLACE: "Marketplace", MARKETPLACE_PLUS: "Marketplace Plus", VIP: "VIP",
};

function SuccessContent() {
  const params    = useSearchParams();
  const sessionId = params.get("session_id");
  const dispatch  = useAppDispatch();
  const user      = useAppSelector(s => s.auth.user);

  const [purchases,   setPurchases]   = useState<Purchase[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [grantedTier, setGrantedTier] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) { setLoading(false); return; }

    // Step 1 — call verify-session: this idempotently applies the tier upgrade
    // and creates the purchase record if the webhook hasn't fired yet
    fetch("/api/stripe/verify-session", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ sessionId }),
    })
      .then(r => r.json())
      .then((data: { tier?: string; user?: Record<string, unknown> }) => {
        if (data.tier && data.tier !== "FREE") {
          setGrantedTier(data.tier);
          // Update Redux immediately so Navbar / feed show new tier
          if (user) {
            dispatch(setUser({ ...user, tier: data.tier as typeof user.tier }));
          }
        }

        // Step 2 — load purchases (now guaranteed to exist)
        return fetch("/api/user/purchases");
      })
      .then(r => r?.json())
      .then((d: Purchase[]) => setPurchases(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-[#f4f6fb] flex items-center justify-center px-4 py-20">
      <div className="max-w-lg w-full">
        {/* Success header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-black text-[#0a1628] mb-2">Purchase Complete!</h1>
          <p className="text-slate-500">Your toolkit is ready and membership has been activated.</p>
        </div>

        {/* Membership activated banner */}
        {grantedTier && (
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 text-white rounded-2xl p-4 mb-4 flex items-center gap-3">
            <Crown className="w-6 h-6 text-amber-300 shrink-0" />
            <div>
              <p className="font-black text-sm">Membership Activated!</p>
              <p className="text-indigo-200 text-xs mt-0.5">
                You now have <strong className="text-white">{TIER_LABELS[grantedTier] ?? grantedTier}</strong> access. Enjoy your benefits!
              </p>
            </div>
          </div>
        )}

        {/* Downloads */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-4">
          <h2 className="font-black text-[#0a1628] text-sm uppercase tracking-widest mb-4">Your Downloads</h2>
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-8 text-slate-400">
              <Loader2 className="w-7 h-7 animate-spin" />
              <p className="text-sm">Processing your order…</p>
            </div>
          ) : purchases.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No purchases found yet — check back in a moment.</p>
          ) : (
            <div className="space-y-3">
              {purchases.map(p => (
                <div key={p.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-3xl">{p.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#0a1628] text-sm truncate">{p.name}</p>
                    <p className="text-xs text-emerald-600 font-semibold">
                      {p.membershipMonths} months {TIER_LABELS[p.membershipTier] ?? p.membershipTier} membership activated
                    </p>
                  </div>
                  {p.downloadUrl ? (
                    <a href={p.downloadUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-[#0a1628] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#1a3a6b] transition-all shrink-0">
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 px-3 py-2 bg-slate-100 rounded-xl">Processing…</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link href="/toolkits" className="flex items-center justify-center gap-2 text-sm font-bold border-2 border-[#0a1628] text-[#0a1628] py-3 rounded-xl hover:bg-[#0a1628] hover:text-white transition-all">
            <ExternalLink className="w-4 h-4" /> More Toolkits
          </Link>
          <Link href="/profile" className="flex items-center justify-center gap-2 text-sm font-bold bg-[#0a1628] text-white py-3 rounded-xl hover:bg-[#1a3a6b] transition-all">
            Go to Profile
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ToolkitSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f4f6fb] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
