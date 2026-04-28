"use client";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import Link from "next/link";
import { Loader2, BadgeCheck, Clock, X, CreditCard } from "lucide-react";
import { UserCircleIcon, Mail01Icon, Briefcase01Icon, NoteIcon, Tick02Icon, BookOpen01Icon, UserGroupIcon, Rocket01Icon, ShoppingBag01Icon, Add01Icon } from "hugeicons-react";

type AppStatus = "PENDING"|"APPROVED"|"REJECTED";
interface App { status: AppStatus; note: string|null; createdAt: string; }
const inp = "w-full font-[inherit] text-sm px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-[#0a1628] focus:ring-2 focus:ring-[#0a1628]/10 transition-all";

export default function MemberProfile() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);
  const [name, setName] = useState(user?.name ?? "");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [app, setApp] = useState<App | null | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [appSpec, setAppSpec] = useState(""); const [appCreds, setAppCreds] = useState(""); const [appReason, setAppReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const openPortal = async () => {
    setPortalLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json() as { url?: string; error?: string };
    if (data.url) window.location.href = data.url;
    else { alert(data.error ?? "Could not open portal"); setPortalLoading(false); }
  };

  useEffect(() => {
    fetch("/api/user/me").then(r => r.json()).then((u: Record<string,unknown>) => {
      setName((u.name as string) ?? ""); setHeadline((u.headline as string) ?? ""); setBio((u.bio as string) ?? "");
    });
    fetch("/api/professional-application").then(r => r.json()).then(setApp);
  }, []);

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/user/profile", { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({name, headline, bio}) });
    if (res.ok && user) { dispatch(setUser({...user, name, bio, headline})); setSaved(true); setTimeout(()=>setSaved(false),3000); }
    setSaving(false);
  };

  const submitApp = async () => {
    setSubmitting(true);
    const res = await fetch("/api/professional-application", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({reason:appReason, specialty:appSpec, credentials:appCreds}) });
    if (res.ok) { const d = await res.json() as App; setApp(d); setShowForm(false); }
    setSubmitting(false);
  };

  const tierColors: Record<string,string> = { FREE:"bg-slate-100 text-slate-600", VIP:"bg-amber-100 text-amber-700", MARKETPLACE:"bg-indigo-100 text-indigo-700", MARKETPLACE_PLUS:"bg-emerald-100 text-emerald-700" };
  const tierLabels: Record<string,string> = { FREE:"Free Member", VIP:"VIP Member", MARKETPLACE:"Marketplace", MARKETPLACE_PLUS:"Marketplace Plus" };
  const tier = user?.tier ?? "FREE";

  return (
    <div className="min-h-screen bg-slate-100 pb-12">
      <div className="h-36 bg-gradient-to-br from-[#0a1628] via-[#1a3a6b] to-[#0d2a50]" />
      <div className="max-w-4xl mx-auto px-4 -mt-14">
        {/* Header card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="relative -mt-10 shrink-0">
              <div className="w-20 h-20 rounded-full bg-[#0a1628] border-4 border-white overflow-hidden flex items-center justify-center shadow-lg">
                {user?.image ? <img src={user.image} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" /> : <span className="text-white font-black text-3xl">{user?.name?.[0]}</span>}
              </div>
            </div>
            <div className="flex-1 pt-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xl font-black text-[#0a1628]">{user?.name}</span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${tierColors[tier]}`}>{tierLabels[tier]}</span>
              </div>
              {headline ? <p className="text-sm text-slate-500">{headline}</p> : <p className="text-sm text-slate-400 italic">No headline yet</p>}
              <p className="text-xs text-slate-400 mt-1">{user?.email}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              {tier !== "FREE" && (
                <button onClick={openPortal} disabled={portalLoading}
                  className="flex items-center gap-1.5 text-xs font-bold border-2 border-[#0a1628] text-[#0a1628] px-4 py-2 rounded-full hover:bg-[#0a1628] hover:text-white transition-all">
                  {portalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                  Manage Plan
                </button>
              )}
              <Link href="/upgrade" className="text-xs font-bold bg-[#0a1628] text-white px-4 py-2 rounded-full hover:bg-[#1a3a6b] transition-all shrink-0">Upgrade</Link>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Quick Links</p>
              {[{icon:BookOpen01Icon,label:"My Courses",href:"/my-courses",c:"text-indigo-500 bg-indigo-50"},{icon:UserGroupIcon,label:"Connections",href:"/connections",c:"text-emerald-500 bg-emerald-50"},{icon:ShoppingBag01Icon,label:"Marketplace",href:"/marketplace",c:"text-amber-500 bg-amber-50"},{icon:Rocket01Icon,label:"Upgrade Plan",href:"/upgrade",c:"text-purple-500 bg-purple-50"}].map(l=>(
                <Link key={l.href} href={l.href} className="flex items-center gap-3 px-2 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${l.c}`}><l.icon className="w-4 h-4"/></span>{l.label}
                </Link>
              ))}
            </div>

            {/* Pro application */}
            <div className="bg-white rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Professional Status</p>
              {app === undefined && <div className="h-8 bg-slate-100 rounded-lg animate-pulse" />}
              {app === null && !showForm && (
                <>
                  <p className="text-xs text-slate-500 mb-3">Become a verified professional and appear in the Pros directory.</p>
                  <button onClick={()=>setShowForm(true)} className="w-full flex items-center justify-center gap-2 text-xs font-bold bg-[#0a1628] text-white py-2.5 rounded-xl hover:bg-[#1a3a6b] transition-all">
                    <Add01Icon className="w-3.5 h-3.5"/>Apply Now
                  </button>
                </>
              )}
              {app?.status==="PENDING" && <div className="flex items-center gap-2 text-amber-600 bg-amber-50 rounded-xl px-3 py-2 text-xs font-semibold"><Clock className="w-3.5 h-3.5 shrink-0"/>Pending review</div>}
              {app?.status==="REJECTED" && <div className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{app.note ? `Not approved: ${app.note}` : "Not approved"}</div>}
            </div>
          </div>

          {/* Edit form */}
          <div className="sm:col-span-2 space-y-5">
            {showForm ? (
              <div className="bg-white rounded-2xl p-6 border-2 border-[#0a1628]/20">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-black text-[#0a1628]">Apply to Become a Professional</h2>
                  <button onClick={()=>setShowForm(false)}><X className="w-4 h-4 text-slate-400"/></button>
                </div>
                <div className="space-y-3">
                  <div><label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Primary Specialty *</label><input value={appSpec} onChange={e=>setAppSpec(e.target.value)} placeholder="e.g. Tax Resolution" className={inp}/></div>
                  <div><label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Credentials *</label><input value={appCreds} onChange={e=>setAppCreds(e.target.value)} placeholder="e.g. EA, 10 years experience" className={inp}/></div>
                  <div><label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Why become a professional? *</label><textarea value={appReason} onChange={e=>setAppReason(e.target.value)} rows={3} className={`${inp} resize-none`}/></div>
                  <button onClick={submitApp} disabled={submitting||!appReason.trim()||!appSpec.trim()||!appCreds.trim()} className="flex items-center gap-2 bg-[#0a1628] text-white text-sm font-bold px-6 py-2.5 rounded-full disabled:opacity-40 hover:bg-[#1a3a6b] transition-all">
                    {submitting?<Loader2 className="w-4 h-4 animate-spin"/>:null}Submit Application
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-black text-[#0a1628]">Edit Profile</h2>
                  {saved && <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1"><Tick02Icon className="w-3.5 h-3.5"/>Saved!</span>}
                </div>
                <div className="space-y-4">
                  <div><label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Full Name</label>
                    <div className="relative"><UserCircleIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/><input value={name} onChange={e=>setName(e.target.value)} className={`${inp} pl-10`}/></div>
                  </div>
                  <div><label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Email</label>
                    <div className="relative"><Mail01Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300"/><input value={user?.email??""} disabled className={`${inp} pl-10 bg-slate-50 text-slate-400 cursor-not-allowed`}/></div>
                  </div>
                  <div><label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Headline</label>
                    <div className="relative"><Briefcase01Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/><input value={headline} onChange={e=>setHeadline(e.target.value)} placeholder="e.g. Tax Professional | IRS Specialist" className={`${inp} pl-10`} maxLength={100}/></div>
                  </div>
                  <div><label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Bio</label>
                    <div className="relative"><NoteIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400"/><textarea value={bio} onChange={e=>setBio(e.target.value)} rows={4} placeholder="Tell the community about yourself…" className={`${inp} pl-10 resize-none`} maxLength={500}/></div>
                  </div>
                  <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-[#0a1628] text-white font-bold text-sm px-6 py-2.5 rounded-full hover:bg-[#1a3a6b] transition-all disabled:opacity-40">
                    {saving?<><Loader2 className="w-4 h-4 animate-spin"/>Saving…</>:<><Tick02Icon className="w-4 h-4"/>Save Changes</>}
                  </button>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-br from-[#0a1628] to-[#1a3a6b] rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-2"><BadgeCheck className="w-5 h-5 text-amber-400"/><span className="font-black text-sm">Become a Pro</span></div>
              <p className="text-white/60 text-xs mb-4">Get verified, appear in the Pros directory, and connect with clients directly.</p>
              <Link href="/apply-professional" className="block text-center text-xs font-bold bg-amber-400 text-[#0a1628] py-2 rounded-lg hover:bg-amber-300 transition-all">Apply Now</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
