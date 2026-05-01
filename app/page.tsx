"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import {
  Scale, ShoppingBag, Users, GraduationCap, Mic, Lock,
  ArrowRight, CheckCircle2, TrendingUp, Star, Shield,
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const navLinks = [
  { label: "Marketplace", href: "/marketplace" },
  { label: "Communities", href: "/communities" },
  { label: "Pricing",     href: "#pricing" },
  { label: "About",       href: "#about" },
];

const features = [
  { icon: Users,        title: "Professional Network",    desc: "Connect with CPAs, enrolled agents, and tax nationwide." },
  { icon: ShoppingBag,  title: "Marketplace",             desc: "Buy and sell tax services, products, trainings, and courses." },
  { icon: GraduationCap,title: "Communities",     desc: "Join or create communities around your niche." },
  { icon: Shield,       title: "ATLAS AI Tax Bot",        desc: "AI-powered tax assistant for real-time tax guidance and compliance." },
  { icon: Mic,          title: "Live Sessions",           desc: "Host and attend live audio/video sessions with verified professionals." },
  { icon: Lock,         title: "Members-Only Access",     desc: "Secure, verified community with gated content and private forums." },
];

const plans = [
  {
    name: "Basic Members Only", price: "FREE", period: "", icon: Shield,
    highlight: false, badge: null, savings: null,
    features: ["Email Support","Marketplace Access (View)","Member Directory Access","Communities Access (View)","Marketplace Feed Access","Secure Members-Only Environment"],
    cta: "Join For Free", href: "/register",
  },
  {
    name: "VIP Members Only", price: "$39.99", period: "/month", icon: Star,
    highlight: false, badge: "2 Months FREE", savings: null,
    features: ["Priority Email Support","Private Messaging & DMs","Training & Educational Support","Marketplace Feed Interaction","Communities Interaction","Private Discussion Forums","Ongoing Education & Training","Ability to Connect","Pro Training Access","ATLAS AI Tax Bot","Professional Networking"],
    cta: "Join Now", href: "/register?plan=VIP",
  },
  {
    name: "VIP + Marketplace Bundle", price: "$79.99", period: "/month", icon: TrendingUp,
    highlight: true, badge: "Most Popular", savings: "SAVINGS OF $131.96",
    features: ["Professional marketplace listing","Custom seller profile page","Ability to sell services","Private Discussion Forums","Fully Customizable Profile","Featured in Marketplace directory","Enhanced Visibility & Credibility","Stronger Brand Authority"],
    cta: "Join Now", href: "/register?plan=MARKETPLACE",
  },
  {
    name: "VIP + Marketplace Plus", price: "$109.99", period: "/month", icon: Scale,
    highlight: true, badge: "Most Popular", savings: "SAVINGS OF $131.96",
    features: ["Professional marketplace listing","Custom seller profile","Ability to sell services","Private Discussion Forums","Fully Customizable Profile","Featured in directory","Enhanced Visibility","Live Audio Session Hosting","Live Video Session Hosting","Post ads/products/services"],
    cta: "Join Now", href: "/register?plan=MARKETPLACE_PLUS",
  },
];

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex flex-col font-[var(--font-urbanist,Urbanist),sans-serif]">

      <Navbar />

      {/* ── HERO (shorter — not full vh) ── */}
      <section className="relative pt-[80px] bg-gradient-to-br from-[#0a1628] via-[#1a3a6b] to-[#0d2445] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 20% 60%, rgba(212,160,23,0.15) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(26,58,107,0.5) 0%, transparent 50%)" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-28 flex flex-col lg:flex-row items-center gap-12">
          {/* Text */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-[#d4a017]/15 border border-[#d4a017]/40 text-[#f0c040] text-sm font-semibold px-4 py-2 rounded-full mb-6 animate-fade-in-up">
              <Star className="w-3.5 h-3.5" /> America&apos;s #1 Tax Professional Community
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.08] mb-5 animate-fade-in-up delay-100">
              The Professional Hub for{" "}
              <span className="bg-gradient-to-r from-[#f0c040] to-[#d4a017] bg-clip-text text-transparent">Tax & Business Experts</span>{" "}

            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-xl leading-relaxed mb-8 animate-fade-in-up delay-200">
              Connect, Collaborate, Sell, and Grow with powerful tools built for professionals all on one secure platform.
            </p>
            <div className="flex gap-4 flex-wrap animate-fade-in-up delay-300">
              <Link href="/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#f0c040] to-[#d4a017] text-[#0a1628] font-bold px-7 py-3.5 rounded-full hover:shadow-[0_0_30px_rgba(212,160,23,0.5)] hover:-translate-y-0.5 transition-all">
                Join For Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="#pricing" className="inline-flex items-center gap-2 text-white font-semibold px-7 py-3.5 rounded-full border border-white/25 bg-white/8 hover:bg-white/15 transition-all">
                View Pricing
              </Link>
            </div>
          </div>

          {/* Floating cards */}
          <div className="hidden lg:flex flex-col gap-4 shrink-0">
            {[
              { icon: ShoppingBag, title: "Tax Services Marketplace", sub: "Browse verified listings", delay: "0s" },
              { icon: Users,       title: "Community Hub",               sub: "Join 200+ active groups",      delay: "0.4s" },
              { icon: Shield,      title: "ATLAS AI Assistant",        sub: "Real-time tax guidance",       delay: "0.8s" },
            ].map((c) => (
              <div key={c.title} className="flex items-center gap-3 bg-white/8 backdrop-blur-xl border border-white/15 rounded-2xl px-5 py-4 min-w-[240px] animate-float" style={{ animationDelay: c.delay }}>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <c.icon className="w-5 h-5 text-[#f0c040]" />
                </div>
                <div>
                  <div className="text-white font-bold text-base">{c.title}</div>
                  <div className="text-white/60 text-sm mt-0.5">{c.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="about" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-bold uppercase tracking-widest text-[#d4a017] mb-3">Why TaxComPro</p>
            <h2 className="text-4xl md:text-5xl font-black text-[#0a1628] mb-4">Everything You Need in One Platform</h2>
            <p className="text-lg md:text-xl text-slate-500 max-w-xl mx-auto">Whether you&apos;re solo or multi-location, TaxComPro grows with you.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white border border-slate-200 rounded-2xl p-8 hover:border-[#d4a017] hover:-translate-y-1 hover:shadow-xl transition-all">
                <div className="w-12 h-12 bg-[#0a1628]/8 rounded-xl flex items-center justify-center mb-5">
                  <f.icon className="w-6 h-6 text-[#0a1628]" />
                </div>
                <h3 className="text-xl font-bold text-[#0a1628] mb-2">{f.title}</h3>
                <p className="text-slate-500 text-base leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARKETPLACE PREVIEW ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-[#d4a017] mb-3">Marketplace</p>
            <h2 className="text-5xl font-black text-[#0a1628] mb-4">Sell Your Expertise.<br />Buy What You Need.</h2>
            <p className="text-slate-500 text-lg leading-relaxed mb-6">Connect professionals offering services, training courses, and digital products with clients who need them.</p>
            <ul className="space-y-2.5 mb-8">
              {["Skill Building & Certifications","Tax Office Branding","End to End Tax Office Solutions","Done-for-you systems","Real Estate Investing Courses","Business Startup Training"].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-base text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />{item}
                </li>
              ))}
            </ul>
            <Link href="/marketplace" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#f0c040] to-[#d4a017] text-[#0a1628] font-bold px-6 py-3 rounded-full hover:shadow-[0_0_20px_rgba(212,160,23,0.4)] transition-all text-sm">
              Browse Marketplace <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex-1 flex flex-col gap-3">
            {[["IRS Audit Defense Service","$299/hr",Shield],["Tax Planning Consultation","$150/session",TrendingUp],["CE Credits Training Bundle","$199",GraduationCap],["CPA Referral Network","Free Access",Users]].map(([title, price, Icon]) => (
              <div key={title as string} className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all">
                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                  <Icon className="w-5 h-5 text-[#0a1628]" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-[#0a1628] text-base">{title as string}</div>
                  <div className="text-slate-400 text-sm mt-0.5">{price as string}</div>
                </div>
                <span className="text-xs font-bold bg-gradient-to-r from-[#f0c040] to-[#d4a017] text-[#0a1628] px-3 py-1 rounded-full shrink-0">Verified</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMUNITIES PREVIEW ── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header — centered */}
          <div className="text-center mb-14">
            <p className="text-sm font-bold uppercase tracking-widest text-[#d4a017] mb-3">Communities</p>
            <h2 className="text-4xl md:text-5xl font-black text-[#0a1628] mb-4">Your Community.<br />Your Rules.</h2>
            <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Create or join niche communities for tax professionals. Share knowledge, host live sessions, and run private discussion forums.
            </p>
          </div>

          {/* 2-col checklist grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto mb-10">
            {[
              "Create your own branded community",
              "Discussion boards & forums",
              "Live audio & video sessions",
              "Exclusive member-only content",
              "Private messaging & networking",
              "Grow your professional audience",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-5 py-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="text-base font-semibold text-slate-700">{item}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <Link href="/communities" className="inline-flex items-center gap-2 bg-[#0a1628] text-white font-bold px-8 py-3.5 rounded-full hover:bg-[#1a3a6b] transition-all text-base">
              Explore Communities <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>


      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-bold uppercase tracking-widest text-[#d4a017] mb-3">Pricing</p>
            <h2 className="text-4xl md:text-5xl font-black text-[#0a1628] mb-4">Choose Your Plan</h2>
            <p className="text-lg md:text-xl text-slate-500 max-w-xl mx-auto">Start free, upgrade when you&apos;re ready. All paid plans include 2 months free.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-stretch">
            {plans.map((plan) => (
              <div key={plan.name} className={`relative rounded-2xl p-7 border flex flex-col transition-all ${plan.highlight ? "border-[#d4a017] bg-[#0a1628]" : "border-slate-200 bg-white"}`}>
                {plan.badge && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#d4a017] text-[#0a1628] text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wide whitespace-nowrap">{plan.badge}</div>}
                {plan.savings && <p className="text-center text-xs font-bold text-[#f0c040] mb-3">{plan.savings}</p>}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto ${plan.highlight ? "bg-white/10" : "bg-[#0a1628]/8"}`}>
                  <plan.icon className={`w-6 h-6 ${plan.highlight ? "text-[#f0c040]" : "text-[#0a1628]"}`} />
                </div>
                <h3 className={`text-center font-black text-sm mb-3 ${plan.highlight ? "text-white" : "text-[#0a1628]"}`}>{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1 mb-5">
                  <span className={`text-4xl font-black ${plan.highlight ? "text-[#f0c040]" : "text-[#0a1628]"}`}>{plan.price}</span>
                  <span className={`text-sm ${plan.highlight ? "text-white/55" : "text-slate-400"}`}>{plan.period}</span>
                </div>
                <ul className="space-y-2.5 mb-7 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex gap-2 items-start text-xs ${plan.highlight ? "text-white/75" : "text-slate-500"}`}>
                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-px ${plan.highlight ? "text-[#f0c040]" : "text-emerald-500"}`} />{f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className={`w-full text-center block font-bold text-sm py-3 rounded-full transition-all mt-auto ${plan.highlight ? "bg-gradient-to-r from-[#f0c040] to-[#d4a017] text-[#0a1628] hover:opacity-90" : "bg-[#0a1628] text-white hover:bg-[#1a3a6b]"}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-20 bg-gradient-to-br from-[#0a1628] via-[#1a3a6b] to-[#0d2445] text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Ready to Join TaxComPro?</h2>
          <p className="text-white/80 text-lg md:text-xl mb-10">Join a growing network of professionals and taxpayers building their future today.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#f0c040] to-[#d4a017] text-[#0a1628] font-bold px-8 py-4 rounded-full hover:shadow-[0_0_30px_rgba(212,160,23,0.5)] transition-all">
              Create Free Account <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login" className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-full border border-white/25 bg-white/8 hover:bg-white/15 transition-all">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0a1628] pt-14 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div>
              <Link href="/" className="inline-flex items-center mb-4 bg-white rounded-xl px-3 py-2">
                <Image src="/logo.png" alt="TaxComPro" width={130} height={38} className="object-contain" priority />
              </Link>
              <p className="text-white/45 text-sm leading-relaxed">The professional community for tax experts and taxpayers across America.</p>
            </div>
            {[
              { title: "Platform", links: [["Marketplace","/marketplace"],["Communities","/communities"],["Pricing","/#pricing"],["Dashboard","/dashboard"]] },
              { title: "Company",  links: [["About Us","/about"],["Contact","/contact"],["Affiliate Program","/affiliate"],["Security","/security"]] },
              { title: "Legal",    links: [["Terms of Service","/terms"],["Privacy Policy","/privacy"],["Community Guidelines","/community-guidelines"],["Cookie Policy","/cookie-policy"]] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-white font-bold text-sm mb-4">{col.title}</h4>
                {col.links.map(([label, href]) => (
                  <Link key={label} href={href} className="block text-white/45 text-sm mb-2.5 hover:text-[#f0c040] transition-colors">{label}</Link>
                ))}
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-white/30 text-xs">
            <p>© {new Date().getFullYear()} TaxComPro. All rights reserved.</p>
            <p>Built for tax professionals</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
