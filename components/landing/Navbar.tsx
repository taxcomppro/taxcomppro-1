"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser, clearUser } from "@/store/slices/authSlice";
import type { AuthUser } from "@/store/slices/authSlice";
import {
  JusticeScale01Icon, Menu01Icon, Cancel01Icon, Layout01Icon, Logout01Icon, UserCircleIcon,
  ArrowDown01Icon, Home01Icon, Notification01Icon, Search01Icon, ShoppingBag01Icon,
  UserGroupIcon, Message01Icon, UserAdd01Icon, BookOpen01Icon,
  Store01Icon, Rocket01Icon, Radio01Icon,
} from "hugeicons-react";
import { Gift, Shield } from "lucide-react";

const navLinks = [
  { label: "Home",        href: "/feed",        icon: Home01Icon },
  { label: "Courses",     href: "/courses",     icon: BookOpen01Icon },
  { label: "Marketplace", href: "/marketplace", icon: ShoppingBag01Icon },
  { label: "Spaces",      href: "/spaces",      icon: Radio01Icon },
  { label: "Connections", href: "/connections", icon: UserAdd01Icon },
];

export default function Navbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [dropdownOpen, setDropdownOpen]   = useState(false);
  const [searchOpen, setSearchOpen]       = useState(false);
  const [searchQuery, setSearchQuery]     = useState("");
  const [unreadCount, setUnreadCount]     = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const dropdownRef    = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data: session, isPending } = useSession();
  const dispatch = useAppDispatch();
  const storeUser = useAppSelector(s => s.auth.user);
  const user = session?.user;

  // Seed Redux auth state so feed components work in (landing) pages
  useEffect(() => {
    if (isPending) return;
    if (!session) { dispatch(clearUser()); return; }

    fetch("/api/user/me")
      .then(r => r.ok ? r.json() : null)
      .then((u: AuthUser | null) => {
        if (u) dispatch(setUser({
          id: u.id, email: u.email, name: u.name,
          role: u.role ?? "MEMBER", tier: u.tier ?? "FREE",
          image: u.image ?? null, bio: u.bio ?? null, headline: u.headline ?? null,
        }));
      })
      .catch(() => {
        if (session?.user) {
          const u = session.user as unknown as AuthUser & Record<string, unknown>;
          dispatch(setUser({
            id: u.id, email: u.email, name: u.name,
            role: (u.role as AuthUser["role"]) ?? "MEMBER",
            tier: (u.tier as AuthUser["tier"]) ?? "FREE",
            image: u.image as string | null,
            bio: u.bio as string | null,
            headline: u.headline as string | null,
          }));
        }
      });
  }, [session, isPending, dispatch]);

  // Fetch unread notification count when logged in
  useEffect(() => {
    if (!session) { setUnreadCount(0); setUnreadMessages(0); return; }
    fetch("/api/notifications")
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setUnreadCount(list.filter((n: { isRead: boolean }) => !n.isRead).length);
      })
      .catch(() => {});
    fetch("/api/messages/unread")
      .then(r => r.ok ? r.json() : { count: 0 })
      .then(d => setUnreadMessages(d.count ?? 0))
      .catch(() => {});
  }, [session]);

  // Close dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery("");
    setSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-[80px] flex items-center gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 relative z-50">
          <img src="/logo.png" alt="TaxComPro" className="h-16 w-auto" />
        </Link>

        {/* Search bar (expanded) */}
        {searchOpen ? (
          <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 max-w-lg mx-auto">
            <div className="flex-1 flex items-center bg-slate-100 border border-slate-200 rounded-full px-4 py-2 gap-2 focus-within:border-[#0a1628]/20 focus-within:ring-2 focus-within:ring-[#0a1628]/5 transition-all">
              <Search01Icon className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search marketplace, communities…"
                className="flex-1 bg-transparent text-sm text-[#0a1628] placeholder-slate-400 outline-none font-[inherit]"
              />
            </div>
            <button type="submit"
              className="text-xs font-bold bg-[#f0c040] text-[#0a1628] px-4 py-2 rounded-full hover:bg-[#d4a017] transition-all shrink-0">
              Search
            </button>
            <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
              className="text-slate-500 hover:text-[#0a1628] p-1.5 rounded-full hover:bg-slate-100 transition-all shrink-0">
              <Cancel01Icon className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <>
            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1 flex-1">
              {navLinks.map(l => (
                <Link key={l.label} href={l.href}
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#0a1628] hover:bg-slate-50 px-3.5 py-2 rounded-lg transition-all">
                  <l.icon className="w-3.5 h-3.5" />
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Desktop right */}
            <div className="hidden md:flex items-center gap-1 ml-auto">
              {/* Search icon */}
              <button onClick={() => setSearchOpen(true)}
                className="p-2 text-slate-500 hover:text-[#0a1628] hover:bg-slate-50 rounded-full transition-all">
                <Search01Icon className="w-5 h-5" />
              </button>

              {/* Notification bell */}
              {user && (
                <Link href="/notifications"
                  className="relative p-2 text-slate-500 hover:text-[#0a1628] hover:bg-slate-50 rounded-full transition-all">
                  <Notification01Icon className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-[#f0c040] text-[#0a1628] text-[10px] font-black rounded-full flex items-center justify-center px-0.5 leading-none">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Messages icon */}
              {user && (
                <Link href="/messages"
                  className="relative p-2 text-slate-500 hover:text-[#0a1628] hover:bg-slate-50 rounded-full transition-all">
                  <Message01Icon className="w-5 h-5" />
                  {unreadMessages > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-blue-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-0.5 leading-none">
                      {unreadMessages > 9 ? "9+" : unreadMessages}
                    </span>
                  )}
                </Link>
              )}

              {isPending ? (
                <div className="w-8 h-8 rounded-xl bg-slate-100 animate-pulse ml-1" />
              ) : user ? (
                <div className="relative ml-1" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(o => !o)}
                    className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full pl-2 pr-3.5 py-1.5 transition-all">
                    <div className="w-7 h-7 rounded-full bg-[#1a3a6b] overflow-hidden flex items-center justify-center shrink-0">
                      {user.image
                        ? <img src={user.image as string} alt={user.name ?? ""} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        : <span className="text-white font-bold text-xs">{user.name?.[0]?.toUpperCase()}</span>}
                    </div>
                    <span className="font-semibold text-[#0a1628] text-sm max-w-[100px] truncate">{user.name?.split(" ")[0]}</span>
                    <ArrowDown01Icon className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-[calc(100%+8px)] bg-white border border-slate-200 rounded-2xl shadow-2xl min-w-[230px] p-2 z-50">
                      {/* User info */}
                      <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                        <div className="font-bold text-[#0a1628] text-sm">{user.name}</div>
                        <div className="text-xs text-slate-400 truncate">{user.email}</div>
                        {storeUser?.tier && storeUser.tier !== "FREE" && (
                          <span className="text-[10px] font-bold bg-[#d4a017]/15 text-[#a07810] px-2 py-0.5 rounded-full mt-1 inline-block">
                            {storeUser.tier === "MARKETPLACE_PLUS" ? "Marketplace Plus" : storeUser.tier === "MARKETPLACE" ? "Marketplace" : "VIP"}
                          </span>
                        )}
                      </div>

                      {/* Admin: Admin Panel only */}
                      {storeUser?.role === "ADMIN" ? (
                        <Link href="/admin" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 text-sm font-medium text-slate-600 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all">
                          <Shield className="w-4 h-4 text-[#d4a017]" /> Admin Panel
                        </Link>
                      ) : (
                        <>
                          <Link href="/profile" onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 text-sm font-medium text-slate-600 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all">
                            <UserCircleIcon className="w-4 h-4 text-slate-400" /> My Profile
                          </Link>
                          <Link href="/marketplace?mine=true" onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 text-sm font-medium text-slate-600 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all">
                            <Store01Icon className="w-4 h-4 text-slate-400" /> My Listings
                          </Link>
                          <Link href="/my-courses" onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 text-sm font-medium text-slate-600 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all">
                            <BookOpen01Icon className="w-4 h-4 text-slate-400" /> My Courses
                          </Link>
                          <Link href="/connections" onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 text-sm font-medium text-slate-600 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all">
                            <UserAdd01Icon className="w-4 h-4 text-slate-400" /> Connections
                          </Link>
                          <Link href="/affiliate" onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 text-sm font-medium text-slate-600 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all">
                            <Gift className="w-4 h-4 text-slate-400" /> Affiliate Program
                          </Link>
                          <Link href="/upgrade" onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 text-sm font-medium text-[#d4a017] px-3 py-2.5 rounded-xl hover:bg-amber-50 transition-all">
                            <Rocket01Icon className="w-4 h-4" /> Upgrade Plan
                          </Link>
                        </>
                      )}

                      <div className="h-px bg-slate-100 my-1" />
                      <button onClick={async () => { setDropdownOpen(false); await signOut(); router.push("/"); }}
                        className="flex items-center gap-2.5 text-sm font-medium text-red-500 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-all w-full text-left">
                        <Logout01Icon className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 ml-1">
                  <Link href="/login"
                    className="text-sm font-semibold text-white/80 hover:text-white hover:bg-white/8 px-4 py-2 rounded-full transition-all">
                    Sign In
                  </Link>
                  <Link href="/register"
                    className="text-sm font-bold bg-gradient-to-r from-[#f0c040] to-[#d4a017] text-[#0a1628] px-5 py-2.5 rounded-full hover:shadow-[0_0_20px_rgba(212,160,23,0.4)] transition-all">
                    Get Started Free
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-[#0a1628] relative z-50 p-2 -mr-2">
              {mobileOpen ? <Cancel01Icon className="w-6 h-6" /> : <Menu01Icon className="w-6 h-6" />}
            </button>
          </>
        )}
      </div>

      {/* Mobile menu */}
      {mobileOpen && !searchOpen && (
        <div className="border-t border-white/10 p-4 flex flex-col gap-1">
          {/* Mobile search */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2 mb-2">
            <Search01Icon className="w-4 h-4 text-white/50 shrink-0" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search…"
              className="flex-1 bg-transparent text-sm text-white placeholder-white/40 outline-none font-[inherit]" />
          </form>

          {navLinks.map(l => (
            <Link key={l.label} href={l.href}
              className="flex items-center gap-2 text-white/80 px-4 py-3 rounded-lg hover:bg-white/8 font-medium"
              onClick={() => setMobileOpen(false)}>
              <l.icon className="w-4 h-4" />
              {l.label}
            </Link>
          ))}
          <div className="pt-3 mt-1 border-t border-white/10">
            {user ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 px-4 py-2 mb-1">
                  <div className="w-9 h-9 rounded-xl bg-[#1a3a6b] overflow-hidden flex items-center justify-center">
                    {user.image
                      ? <img src={user.image as string} alt={user.name ?? ""} className="w-full h-full object-cover" />
                      : <span className="text-white font-bold">{user.name?.[0]?.toUpperCase()}</span>}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">{user.name}</div>
                    <div className="text-white/40 text-xs truncate">{user.email}</div>
                  </div>
                </div>
                
                <div className="flex justify-around items-center bg-white/5 py-3 rounded-xl">
                  <button className="flex flex-col items-center gap-1.5 text-white/70 hover:text-white transition-colors">
                    <Search01Icon className="w-5 h-5" />
                    <span className="text-[10px] font-medium">Search</span>
                  </button>
                  <button className="flex flex-col items-center gap-1.5 text-white/70 hover:text-white transition-colors">
                    <Notification01Icon className="w-5 h-5" />
                    <span className="text-[10px] font-medium">Alerts</span>
                  </button>
                  <Link href="/messages" onClick={() => setMobileOpen(false)} className="flex flex-col items-center gap-1.5 text-white/70 hover:text-white transition-colors">
                    <Message01Icon className="w-5 h-5" />
                    <span className="text-[10px] font-medium">Chat</span>
                  </Link>
                </div>

                <Link href="/profile" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 text-white/80 px-4 py-3 rounded-lg hover:bg-white/8 font-medium">
                  <UserCircleIcon className="w-4 h-4" /> My Profile
                </Link>
                {storeUser?.role === "ADMIN" ? (
                  <Link href="/admin" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 text-amber-300 px-4 py-3 rounded-lg hover:bg-white/8 font-medium">
                    <Shield className="w-4 h-4" /> Admin Panel
                  </Link>
                ) : (
                  <>
                    <Link href="/marketplace?mine=true" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 text-white/80 px-4 py-3 rounded-lg hover:bg-white/8 font-medium">
                      <Store01Icon className="w-4 h-4" /> My Listings
                    </Link>
                    <Link href="/my-courses" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 text-white/80 px-4 py-3 rounded-lg hover:bg-white/8 font-medium">
                      <BookOpen01Icon className="w-4 h-4" /> My Courses
                    </Link>
                    <Link href="/connections" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 text-white/80 px-4 py-3 rounded-lg hover:bg-white/8 font-medium">
                      <UserAdd01Icon className="w-4 h-4" /> Connections
                    </Link>
                    <Link href="/affiliate" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 text-white/80 px-4 py-3 rounded-lg hover:bg-white/8 font-medium">
                      <Gift className="w-4 h-4" /> Affiliate Program
                    </Link>
                    <Link href="/upgrade" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 text-amber-300 px-4 py-3 rounded-lg hover:bg-white/8 font-medium">
                      <Rocket01Icon className="w-4 h-4" /> Upgrade Plan
                    </Link>
                  </>
                )}
                <button onClick={async () => { setMobileOpen(false); await signOut(); router.push("/"); }}
                  className="flex items-center gap-2 text-red-400 px-4 py-3 rounded-lg hover:bg-red-400/10 font-medium text-left w-full">
                  <Logout01Icon className="w-4 h-4" /> Sign Out
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
  );
}
