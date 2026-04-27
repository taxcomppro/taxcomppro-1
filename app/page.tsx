"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import {
  Scale, ShoppingBag, Users, GraduationCap, Mic, Lock,
  ArrowRight, CheckCircle2, TrendingUp, Star, Shield, Menu, X,
  LayoutDashboard, LogOut, UserCircle, ChevronDown,
} from "lucide-react";

const navLinks = [
  { label: "Marketplace", href: "/marketplace" },
  { label: "Pro Hub",     href: "/pro-hub" },
  { label: "Pricing",     href: "#pricing" },
  { label: "About",       href: "#about" },
];

const features = [
  { icon: Users,        title: "Professional Network",    desc: "Connect with CPAs, enrolled agents, and tax attorneys nationwide." },
  { icon: ShoppingBag,  title: "Marketplace",             desc: "Buy and sell tax services, products, trainings, and professional networks." },
  { icon: GraduationCap,title: "Pro Hub Communities",     desc: "Join or create communities around your niche — like Skool for tax pros." },
  { icon: Shield,       title: "ATLAS AI Tax Bot",        desc: "AI-powered assistant for real-time tax guidance and IRS compliance." },
  { icon: Mic,          title: "Live Sessions",           desc: "Host and attend live audio/video sessions with verified professionals." },
  { icon: Lock,         title: "Members-Only Access",     desc: "Secure, verified community with gated content and private forums." },
];

const plans = [
  {
    name: "Basic Members Only", price: "FREE", period: "", icon: Shield,
    highlight: false, badge: null, savings: null,
    features: ["Email Support","Marketplace Access (View)","Member Directory Access","Pro Hub Access (View)","Marketplace Feed Access","Secure Members-Only Environment"],
    cta: "Join For Free", href: "/register",
  },
  {
    name: "VIP Members Only", price: "$39.99", period: "/month", icon: Star,
    highlight: false, badge: "2 Months FREE", savings: null,
    features: ["Priority Email Support","Private Messaging & DMs","Training & Educational Support","Marketplace Feed Interaction","Pro Hub Interaction","Private Discussion Forums","Ongoing Education & Training","Ability to Connect","Pro Training Access","ATLAS AI Tax Bot","Professional Networking"],
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session, isPending } = useSession();
  const user = session?.user;

  return (
    <div className="min-h-screen flex flex-col font-[var(--font-urbanist,Urbanist),sans-serif]">

      {/* ── NAVBAR ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a1628]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-[68px] flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 text-white font-black text-xl shrink-0">
            <Scale className="w-6 h-6 text-[#f0c040]" />
            TaxCom<span className="text-[#f0c040]">Pro</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {navLinks.map((l) => (
              <Link key={l.label} href={l.href} className="text-sm font-semibold text-white/70 hover:text-white hover:bg-white/8 px-3.5 py-2 rounded-lg transition-all">{l.label}</Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-2 ml-auto">
            {isPending ? (
              <div className="w-8 h-8 rounded-xl bg-white/10 animate-pulse" />
            ) : user ? (
              <div className="relative group">
                <button className="flex items-center gap-2.5 bg-white/8 hover:bg-white/15 border border-white/15 rounded-full pl-2 pr-3.5 py-1.5 transition-all">
                  <div className="w-7 h-7 rounded-full bg-[#1a3a6b] overflow-hidden flex items-center justify-center shrink-0">
                    {user.image
                      ? <img src={user.image as string} alt={user.name ?? ""} className="w-full h-full object-cover" />
                      : <span className="text-white font-bold text-xs">{user.name?.[0]?.toUpperCase()}</span>}
                  </div>
                  <span className="text-white font-semibold text-sm max-w-[100px] truncate">{user.name?.split(" ")[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-white/60" />
                </button>
                <div className="hidden group-hover:flex flex-col absolute right-0 top-[calc(100%+8px)] bg-white border border-slate-200 rounded-2xl shadow-2xl min-w-[200px] p-2 z-50">
                  <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                    <div className="font-bold text-[#0a1628] text-sm">{user.name}</div>
                    <div className="text-xs text-slate-400 truncate">{user.email}</div>
                  </div>
                  <Link href="/dashboard" className="flex items-center gap-2.5 text-sm font-medium text-slate-700 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all">
                    <LayoutDashboard className="w-4 h-4 text-slate-400" /> Dashboard
                  </Link>
                  <Link href="/profile" className="flex items-center gap-2.5 text-sm font-medium text-slate-700 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all">
                    <UserCircle className="w-4 h-4 text-slate-400" /> Profile
                  </Link>
                  <div className="h-px bg-slate-100 my-1" />
                  <button onClick={() => signOut()} className="flex items-center gap-2.5 text-sm font-medium text-red-500 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-all w-full text-left">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold text-white/80 hover:text-white hover:bg-white/8 px-4 py-2 rounded-full transition-all">Sign In</Link>
                <Link href="/register" className="text-sm font-bold bg-gradient-to-r from-[#f0c040] to-[#d4a017] text-[#0a1628] px-5 py-2.5 rounded-full hover:shadow-[0_0_20px_rgba(212,160,23,0.4)] transition-all">Get Started</Link>
              </>
            )}
          </div>
          <button className="md:hidden ml-auto p-1.5 text-white" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {mobileOpen && (
          <div className="border-t border-white/10 p-4 flex flex-col gap-1">
            {navLinks.map((l) => (
              <Link key={l.label} href={l.href} className="text-white/80 px-4 py-3 rounded-lg hover:bg-white/8 font-medium" onClick={() => setMobileOpen(false)}>{l.label}</Link>
            ))}
            <div className="pt-3 mt-1 border-t border-white/10">
              {user ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div className="w-8 h-8 rounded-xl bg-[#1a3a6b] overflow-hidden flex items-center justify-center">
                      {user.image ? <img src={user.image as string} alt={user.name ?? ""} className="w-full h-full object-cover" /> : <span className="text-white font-bold text-xs">{user.name?.[0]?.toUpperCase()}</span>}
                    </div>
                    <div className="text-white font-semibold text-sm">{user.name}</div>
                  </div>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="text-white/80 px-4 py-3 rounded-lg hover:bg-white/8 font-medium flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <button onClick={() => { signOut(); setMobileOpen(false); }} className="flex items-center gap-2 text-red-400 px-4 py-3 rounded-lg hover:bg-red-400/10 font-medium w-full text-left">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link href="/login" className="flex-1 text-center text-sm font-semibold text-white border border-white/20 py-2.5 rounded-full">Sign In</Link>
                  <Link href="/register" className="flex-1 text-center text-sm font-bold bg-gradient-to-r from-[#f0c040] to-[#d4a017] text-[#0a1628] py-2.5 rounded-full">Get Started</Link>
                </div>
              )}
            </div>
          </div>

        )}
      </header>

      {/* ── HERO (shorter — not full vh) ── */}
      <section className="relative pt-[68px] bg-gradient-to-br from-[#0a1628] via-[#1a3a6b] to-[#0d2445] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 20% 60%, rgba(212,160,23,0.15) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(26,58,107,0.5) 0%, transparent 50%)" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-28 flex flex-col lg:flex-row items-center gap-12">
          {/* Text */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-[#d4a017]/15 border border-[#d4a017]/40 text-[#f0c040] text-sm font-semibold px-4 py-2 rounded-full mb-6 animate-fade-in-up">
              <Star className="w-3.5 h-3.5" /> America&apos;s #1 Tax Professional Community
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.08] mb-5 animate-fade-in-up delay-100">
              The Professional Hub for{" "}
              <span className="bg-gradient-to-r from-[#f0c040] to-[#d4a017] bg-clip-text text-transparent">Tax Experts</span>{" "}
              &amp; Smart Taxpayers
            </h1>
            <p className="text-base md:text-lg text-white/65 max-w-xl leading-relaxed mb-8 animate-fade-in-up delay-200">
              Connect, sell, learn, and grow with thousands of CPAs, enrolled agents, tax attorneys, and taxpayers — all in one secure, professional community.
            </p>
            <div className="flex gap-4 flex-wrap animate-fade-in-up delay-300">
              <Link href="/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#f0c040] to-[#d4a017] text-[#0a1628] font-bold px-7 py-3.5 rounded-full hover:shadow-[0_0_30px_rgba(212,160,23,0.5)] hover:-translate-y-0.5 transition-all">
                Join For Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="#pricing" className="inline-flex items-center gap-2 text-white font-semibold px-7 py-3.5 rounded-full border border-white/25 bg-white/8 hover:bg-white/15 transition-all">
                View Pricing
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-6 mt-10 flex-wrap animate-fade-in-up delay-400">
              {[["12,000+","Members"],["4,500+","Professionals"],["800+","Listings"],["200+","Communities"]].map(([num, label], i) => (
                <div key={label} className="flex items-center gap-6">
                  {i > 0 && <div className="w-px h-8 bg-white/15" />}
                  <div>
                    <div className="text-xl font-black text-white">{num}</div>
                    <div className="text-xs text-white/45 mt-px">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating cards */}
          <div className="hidden lg:flex flex-col gap-4 shrink-0">
            {[
              { icon: ShoppingBag, title: "Tax Services Marketplace", sub: "Browse 800+ verified listings", delay: "0s" },
              { icon: Users,       title: "Pro Hub Community",         sub: "Join 200+ active groups",      delay: "0.4s" },
              { icon: Shield,      title: "ATLAS AI Assistant",        sub: "Real-time tax guidance",       delay: "0.8s" },
            ].map((c) => (
              <div key={c.title} className="flex items-center gap-3 bg-white/8 backdrop-blur-xl border border-white/15 rounded-2xl px-5 py-4 min-w-[240px] animate-float" style={{ animationDelay: c.delay }}>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <c.icon className="w-5 h-5 text-[#f0c040]" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{c.title}</div>
                  <div className="text-white/50 text-xs mt-px">{c.sub}</div>
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
            <p className="text-xs font-bold uppercase tracking-widest text-[#d4a017] mb-3">Why TaxComPro</p>
            <h2 className="text-4xl font-black text-[#0a1628] mb-4">Everything You Need in One Platform</h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">Built specifically for tax professionals and taxpayers who demand the best.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white border border-slate-200 rounded-2xl p-8 hover:border-[#d4a017] hover:-translate-y-1 hover:shadow-xl transition-all">
                <div className="w-12 h-12 bg-[#0a1628]/8 rounded-xl flex items-center justify-center mb-5">
                  <f.icon className="w-6 h-6 text-[#0a1628]" />
                </div>
                <h3 className="text-lg font-bold text-[#0a1628] mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
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
            <h2 className="text-4xl font-black text-[#0a1628] mb-4">Sell Your Expertise.<br />Buy What You Need.</h2>
            <p className="text-slate-500 text-base leading-relaxed mb-6">Connect professionals offering tax services, training courses, and digital products with clients who need them.</p>
            <ul className="space-y-2.5 mb-8">
              {["Tax preparation & consulting services","IRS audit defense & representation","Training courses & certifications","Professional referral networks"].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-slate-600">
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
                  <div className="font-semibold text-[#0a1628] text-sm">{title as string}</div>
                  <div className="text-slate-400 text-xs mt-px">{price as string}</div>
                </div>
                <span className="text-xs font-bold bg-gradient-to-r from-[#f0c040] to-[#d4a017] text-[#0a1628] px-3 py-1 rounded-full shrink-0">Verified</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRO HUB PREVIEW ── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row-reverse items-center gap-16">
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-[#d4a017] mb-3">Pro Hub</p>
            <h2 className="text-4xl font-black text-[#0a1628] mb-4">Your Community.<br />Your Rules.</h2>
            <p className="text-slate-500 text-base leading-relaxed mb-6">Create or join niche communities for tax professionals. Share knowledge, host live sessions, run discussion forums.</p>
            <ul className="space-y-2.5 mb-8">
              {["Create your own branded community","Discussion boards & forums","Live audio & video sessions","Exclusive member-only content"].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />{item}
                </li>
              ))}
            </ul>
            <Link href="/pro-hub" className="inline-flex items-center gap-2 bg-[#0a1628] text-white font-bold px-6 py-3 rounded-full hover:bg-[#1a3a6b] transition-all text-sm">
              Explore Pro Hub <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex-1 flex flex-col gap-3">
            {[{name:"IRS Defense Pros",members:2340,color:"#1a3a6b"},{name:"Small Biz Tax Circle",members:1892,color:"#d4a017"},{name:"CPA Exam Study Group",members:4201,color:"#6366f1"},{name:"Estate Planning Network",members:987,color:"#10b981"}].map((c) => (
              <div key={c.name} className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-base shrink-0" style={{ background: c.color }}>
                  {c.name[0]}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-[#0a1628] text-sm">{c.name}</div>
                  <div className="text-slate-400 text-xs mt-px flex items-center gap-1"><Users className="w-3 h-3" /> {c.members.toLocaleString()} members</div>
                </div>
                <button className="text-xs font-bold border border-[#0a1628] text-[#0a1628] px-3 py-1.5 rounded-full hover:bg-[#0a1628] hover:text-white transition-all">Join</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-[#d4a017] mb-3">Pricing</p>
            <h2 className="text-4xl font-black text-[#0a1628] mb-4">Choose Your Plan</h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">Start free, upgrade when you&apos;re ready. All paid plans include 2 months free.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
            {plans.map((plan) => (
              <div key={plan.name} className={`relative rounded-2xl p-7 border-2 hover:-translate-y-1 transition-all ${plan.highlight ? "border-[#d4a017] bg-[#0a1628] hover:shadow-[0_20px_40px_rgba(10,22,40,0.3)]" : "border-slate-200 bg-white hover:border-[#d4a017] hover:shadow-xl"}`}>
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
                <ul className="space-y-2.5 mb-7">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex gap-2 items-start text-xs ${plan.highlight ? "text-white/75" : "text-slate-500"}`}>
                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-px ${plan.highlight ? "text-[#f0c040]" : "text-emerald-500"}`} />{f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className={`w-full text-center block font-bold text-sm py-3 rounded-full transition-all ${plan.highlight ? "bg-gradient-to-r from-[#f0c040] to-[#d4a017] text-[#0a1628] hover:shadow-[0_0_20px_rgba(212,160,23,0.5)]" : "bg-[#0a1628] text-white hover:bg-[#1a3a6b]"}`}>
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
          <h2 className="text-4xl font-black text-white mb-4">Ready to Join TaxComPro?</h2>
          <p className="text-white/60 text-lg mb-10">Join thousands of professionals and taxpayers building their future today.</p>
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
              <div className="flex items-center gap-2.5 text-white font-black text-xl mb-3">
                <Scale className="w-5 h-5 text-[#f0c040]" />TaxCom<span className="text-[#f0c040]">Pro</span>
              </div>
              <p className="text-white/45 text-sm leading-relaxed">The professional community for tax experts and taxpayers across America.</p>
            </div>
            {[
              { title: "Platform", links: [["Marketplace","/marketplace"],["Pro Hub","/pro-hub"],["Pricing","#pricing"],["Dashboard","/dashboard"]] },
              { title: "Company",  links: [["About Us","#"],["Contact","#"],["Blog","#"],["Careers","#"]] },
              { title: "Legal",    links: [["Terms of Service","#"],["Privacy Policy","#"],["Community Guidelines","#"],["Cookie Policy","#"]] },
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
