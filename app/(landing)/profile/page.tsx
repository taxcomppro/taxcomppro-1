"use client";

import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Loader2, CheckCircle2, X, CreditCard } from "lucide-react";
import dynamic from "next/dynamic";

const MemberProfile = dynamic(() => import("@/components/profile/MemberProfile"), {
  loading: () => <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-7 h-7 animate-spin text-[#0a1628]" /></div>,
});

const ProProfile = dynamic(() => import("@/components/profile/ProProfileEditor"), {
  loading: () => <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-7 h-7 animate-spin text-[#0a1628]" /></div>,
});

const TIER_META: Record<string, { name: string; color: string }> = {
  VIP:              { name: "VIP",              color: "from-amber-400 to-amber-500" },
  MARKETPLACE:      { name: "Marketplace",      color: "from-indigo-500 to-indigo-600" },
  MARKETPLACE_PLUS: { name: "Marketplace Plus", color: "from-purple-500 to-purple-700" },
};

function UpgradeBanner({ tier, onDismiss }: { tier: string; onDismiss: () => void }) {
  const t = TIER_META[tier] ?? { name: tier, color: "from-emerald-500 to-emerald-600" };
  const [portalLoading, setPortalLoading] = useState(false);

  const openPortal = async () => {
    setPortalLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json() as { url?: string; error?: string };
    if (data.url) window.location.href = data.url;
    else { alert(data.error ?? "Could not open portal"); setPortalLoading(false); }
  };

  return (
    <div className={`bg-gradient-to-r ${t.color} text-white px-4 py-3`}>
      <div className="max-w-4xl mx-auto flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 shrink-0" />
        <p className="flex-1 text-sm font-semibold">
          🎉 You&apos;re now on the <strong>{t.name}</strong> plan! Enjoy your new benefits.
        </p>
        <button onClick={openPortal} disabled={portalLoading}
          className="flex items-center gap-1.5 text-xs font-bold bg-white/20 hover:bg-white/30 border border-white/30 px-3 py-1.5 rounded-lg transition-all shrink-0">
          {portalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
          Manage Subscription
        </button>
        <button onClick={onDismiss} className="p-1 hover:bg-white/20 rounded-full transition-all shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function ProfileContent() {
  const dispatch    = useAppDispatch();
  const user        = useAppSelector(s => s.auth.user);
  const params      = useSearchParams();
  const [showBanner, setShowBanner] = useState(false);
  const [upgradedTier, setUpgradedTier] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const upgraded  = params.get("upgraded");
    const sessionId = params.get("session_id");

    if (upgraded !== "1" || !sessionId) return;

    // Clean URL immediately
    window.history.replaceState({}, "", "/profile");
    setVerifying(true);

    // Verify with Stripe and write tier to DB
    fetch("/api/stripe/verify-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then(r => r.json())
      .then((data: { tier?: string; user?: Record<string, unknown> }) => {
        const tier = data.tier ?? "";
        if (tier && tier !== "FREE") {
          setUpgradedTier(tier);
          setShowBanner(true);
          // Refresh Redux so profile header, marketplace etc. all update immediately
          if (user && data.user) {
            dispatch(setUser({
              ...user,
              tier: tier as typeof user.tier,
            }));
          }
        }
      })
      .catch(() => {})
      .finally(() => setVerifying(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user || verifying) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-7 h-7 animate-spin text-[#0a1628] mx-auto mb-2" />
        {verifying && <p className="text-sm text-slate-500">Activating your membership…</p>}
      </div>
    </div>
  );

  return (
    <div>
      {showBanner && (
        <UpgradeBanner tier={upgradedTier} onDismiss={() => setShowBanner(false)} />
      )}
      {(user.role === "PROFESSIONAL" || user.role === "ADMIN")
        ? <ProProfile />
        : <MemberProfile />}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-[#0a1628]" />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
