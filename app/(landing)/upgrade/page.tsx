"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Shield01Icon, StarIcon, MedalFirstPlaceIcon, DiamondIcon, Tick02Icon, LockIcon,
} from "hugeicons-react";

const plans = [
  {
    name: "Basic Members Only", price: 0, label: "FREE",
    Icon: Shield01Icon, tier: "FREE", highlight: false,
    iconBg: "bg-slate-100", iconCls: "text-slate-500",
    features: [
      "Email Support",
      "Marketplace Access (View)",
      "Member Directory Access",
      "Communities Access (View)",
      "Marketplace Feed Access",
      "Secure Members-Only Environment",
    ],
    cta: "Current Plan",
  },
  {
    name: "VIP Members Only", price: 39.99, label: "$39.99",
    Icon: StarIcon, tier: "VIP", highlight: false,
    badge: "2 Months FREE",
    iconBg: "bg-amber-50", iconCls: "text-amber-500",
    features: [
      "Priority Email Support",
      "Private Messaging & DMs",
      "Training & Educational Support",
      "Marketplace Feed Interaction",
      "Communities Interaction",
      "Private Discussion Forums",
      "Ongoing Education & Training",
      "Ability to Connect",
      "Pro Training Access",
      "ATLAS AI Tax Bot",
      "Professional Networking",
    ],
    cta: "Upgrade to VIP",
  },
  {
    name: "VIP + Marketplace Bundle", price: 79.99, label: "$79.99",
    Icon: MedalFirstPlaceIcon, tier: "MARKETPLACE", highlight: true,
    badge: "Most Popular", savings: "Save $131.96/yr",
    iconBg: "bg-white/10", iconCls: "text-[#f0c040]",
    features: [
      "Professional marketplace listing",
      "Custom seller profile",
      "Ability to sell services",
      "Private Discussion Forums",
      "Fully Customizable Profile",
      "Featured in Marketplace directory",
      "Enhanced Visibility & Credibility",
      "Stronger Brand Authority",
    ],
    cta: "Upgrade to Marketplace",
  },
  {
    name: "VIP + Marketplace Plus", price: 109.99, label: "$109.99",
    Icon: DiamondIcon, tier: "MARKETPLACE_PLUS", highlight: true,
    badge: "Best Value", savings: "Save $131.96/yr",
    iconBg: "bg-white/10", iconCls: "text-[#f0c040]",
    features: [
      "Professional marketplace listing",
      "Custom seller profile",
      "Ability to sell services",
      "Private Discussion Forums",
      "Fully Customizable Profile",
      "Featured in directory",
      "Enhanced Visibility",
      "Live Audio Session Hosting",
      "Live Video Session Hosting",
      "Post ads/products/services",
    ],
    cta: "Upgrade to Plus",
  },
] as const;

export default function UpgradePage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (tier: string) => {
    setLoading(tier);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      alert("Failed to start checkout. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 pt-8 pb-16">
      <div className="max-w-6xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-[#0a1628] mb-3">Upgrade Your Plan</h1>
          <p className="text-slate-500 text-base max-w-lg mx-auto">
            All paid plans include 2 months free community access. Cancel anytime.
          </p>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
          {plans.map((plan) => {
            const Icon = plan.Icon;
            return (
              <div key={plan.name} className={`relative rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5 flex flex-col ${
                plan.highlight
                  ? "bg-[#0a1628] text-white"
                  : "bg-white"
              }`}>
                {/* Top badge */}
                {"badge" in plan && plan.badge && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-[#d4a017] text-[#0a1628] text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="p-6 flex flex-col flex-1">
                  {/* Savings */}
                  {"savings" in plan && plan.savings && (
                    <p className="text-xs font-bold text-[#f0c040] mb-3">{plan.savings}</p>
                  )}

                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${plan.iconBg}`}>
                    <Icon className={`w-6 h-6 ${plan.iconCls}`} />
                  </div>

                  {/* Plan name */}
                  <div className={`text-xs font-black uppercase tracking-widest mb-1 ${plan.highlight ? "text-white/50" : "text-slate-400"}`}>
                    {plan.name}
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className={`text-4xl font-black ${plan.highlight ? "text-[#f0c040]" : "text-[#0a1628]"}`}>
                      {plan.label}
                    </span>
                    {plan.price > 0 && (
                      <span className={`text-sm ${plan.highlight ? "text-white/50" : "text-slate-400"}`}>/month</span>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-7 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className={`flex items-start gap-2 text-xs leading-relaxed ${plan.highlight ? "text-white/70" : "text-slate-500"}`}>
                        <Tick02Icon className={`w-3.5 h-3.5 shrink-0 mt-px ${plan.highlight ? "text-[#f0c040]" : "text-emerald-500"}`} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {plan.tier === "FREE" ? (
                    <div className={`w-full text-center text-sm font-bold py-3 rounded-xl cursor-default ${plan.highlight ? "bg-white/10 text-white/40" : "bg-slate-100 text-slate-400"}`}>
                      {plan.cta}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan.tier)}
                      disabled={loading === plan.tier}
                      className={`w-full text-sm font-bold py-3 rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2 ${
                        plan.highlight
                          ? "bg-gradient-to-r from-[#f0c040] to-[#d4a017] text-[#0a1628] hover:shadow-[0_0_20px_rgba(212,160,23,0.4)]"
                          : "bg-[#0a1628] text-white hover:bg-[#1a3a6b]"
                      }`}>
                      {loading === plan.tier ? <><Loader2 className="w-4 h-4 animate-spin" />Redirecting…</> : plan.cta}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer trust strip */}
        <div className="mt-8 bg-white rounded-2xl p-5 text-center flex flex-col sm:flex-row items-center justify-center gap-4">
          <span className="flex items-center gap-2 text-sm text-slate-500">
            <LockIcon className="w-4 h-4 text-slate-400" />
            Secure payments powered by <strong className="text-[#0a1628]">Stripe</strong>.
            Cancel anytime. No hidden fees.
          </span>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="text-sm text-slate-400">
            Questions?{" "}
            <Link href="#" className="text-[#0a1628] font-semibold hover:underline">Contact support</Link>
          </span>
        </div>
      </div>
    </div>
  );
}
