"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import {
  Copy01Icon, Tick02Icon, DollarCircleIcon, UserGroupIcon,
  ArrowUp05Icon, Clock01Icon, Cancel01Icon, MoneyReceive01Icon,
  LinkSquare01Icon, ChartBarLineIcon,
} from "hugeicons-react";

interface Profile { id:string; code:string; isActive:boolean; totalEarned:number; totalPaid:number; pendingBalance:number; createdAt:string; }
interface Settings { commissionVip:number; commissionMarketplace:number; commissionPlus:number; minPayoutAmount:number; cookieDays:number; programEnabled:boolean; }
interface Referral { id:string; tier:string; commission:number; createdAt:string; referredUser:{ name:string; email:string; }; }
interface Payout  { id:string; amount:number; method:string; status:string; note:string|null; createdAt:string; }

const tierColors: Record<string,string> = { VIP:"bg-amber-100 text-amber-700", MARKETPLACE:"bg-blue-100 text-blue-700", MARKETPLACE_PLUS:"bg-emerald-100 text-emerald-700" };
const statusColors:Record<string,string> = { PENDING:"bg-amber-100 text-amber-700", APPROVED:"bg-blue-100 text-blue-700", REJECTED:"bg-red-100 text-red-600", PAID:"bg-emerald-100 text-emerald-700" };

function ago(d:string){ const s=Math.floor((Date.now()-new Date(d).getTime())/1000); if(s<60)return"just now"; if(s<3600)return`${Math.floor(s/60)}m ago`; if(s<86400)return`${Math.floor(s/3600)}h ago`; return`${Math.floor(s/86400)}d ago`; }

export default function AffiliatePage() {
  const [profile,   setProfile]   = useState<Profile|null>(null);
  const [settings,  setSettings]  = useState<Settings|null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [payouts,   setPayouts]   = useState<Payout[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [activating,setActivating]= useState(false);
  const [copied,    setCopied]    = useState(false);
  const [showForm,  setShowForm]  = useState(false);
  const [amount,    setAmount]    = useState("");
  const [details,   setDetails]   = useState("");
  const [method,    setMethod]    = useState("paypal");
  const [submitting,setSubmitting]= useState(false);
  const [formError, setFormError] = useState("");

  const refLink = typeof window!=="undefined" && profile ? `${window.location.origin}/upgrade?ref=${profile.code}` : "";

  useEffect(()=>{
    fetch("/api/affiliate").then(r=>r.json()).then(async d=>{
      setSettings(d.settings);
      if(d.profile){ setProfile(d.profile);
        const [stats,pays]=await Promise.all([fetch("/api/affiliate/stats").then(r=>r.json()),fetch("/api/affiliate/payout").then(r=>r.json())]);
        if(stats?.referrals) setReferrals(stats.referrals);
        if(Array.isArray(pays)) setPayouts(pays);
      }
    }).finally(()=>setLoading(false));
  },[]);

  const activate=async()=>{ setActivating(true); const r=await fetch("/api/affiliate",{method:"POST"}); if(r.ok) setProfile(await r.json()); setActivating(false); };
  const copy=()=>{ navigator.clipboard.writeText(refLink); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  const submitPayout=async(e:React.FormEvent)=>{ e.preventDefault(); setSubmitting(true); setFormError("");
    const r=await fetch("/api/affiliate/payout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({amount:parseFloat(amount),method,details})});
    const d=await r.json();
    if(r.ok){ setPayouts(p=>[d,...p]); setShowForm(false); setAmount(""); setDetails(""); setProfile(p=>p?{...p,pendingBalance:p.pendingBalance-parseFloat(amount)}:p); }
    else setFormError(d.error??"Failed");
    setSubmitting(false);
  };

  if(loading) return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#d4a017] animate-spin"/></div>;
  if(!settings?.programEnabled) return (
    <div className="max-w-xl mx-auto text-center py-20">
      <Cancel01Icon className="w-12 h-12 text-slate-200 mx-auto mb-4"/>
      <h1 className="text-2xl font-black text-[#0a1628] mb-2">Program Unavailable</h1>
      <p className="text-slate-500 text-sm">The affiliate program is currently paused.</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-16 pt-8">
      <div><h1 className="text-2xl font-black text-[#0a1628]">Affiliate Program</h1><p className="text-slate-500 text-sm mt-0.5">Earn commissions when anyone upgrades via your link.</p></div>

      {/* Not activated */}
      {!profile && (
        <div className="bg-[#0a1628] rounded-2xl p-10 text-white text-center">
          <LinkSquare01Icon className="w-12 h-12 text-[#f0c040] mx-auto mb-4"/>
          <h2 className="text-2xl font-black mb-2">Join the Affiliate Program</h2>
          <p className="text-white/60 text-sm max-w-md mx-auto mb-6">Earn up to {settings?.commissionPlus??20}% commission on every membership upgrade through your link.</p>
          <button onClick={activate} disabled={activating}
            className="bg-[#f0c040] text-[#0a1628] font-black px-8 py-3 rounded-xl hover:bg-[#d4a017] transition-all disabled:opacity-60 inline-flex items-center gap-2 mx-auto">
            {activating?<Loader2 className="w-4 h-4 animate-spin"/>:<ArrowUp05Icon className="w-4 h-4"/>} Activate My Account
          </button>
        </div>
      )}

      {/* Activated */}
      {profile && (<>
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {label:"Total Earned",    val:`$${profile.totalEarned.toFixed(2)}`,    Icon:DollarCircleIcon,  from:"from-emerald-400", to:"to-emerald-600", sub:"lifetime commissions"},
            {label:"Pending Balance", val:`$${profile.pendingBalance.toFixed(2)}`, Icon:MoneyReceive01Icon, from:"from-amber-400",   to:"to-orange-500",  sub:"awaiting payout"},
            {label:"Referrals",       val:referrals.length.toString(),              Icon:UserGroupIcon,      from:"from-blue-400",   to:"to-blue-600",    sub:"total conversions"},
            {label:"Total Paid Out",  val:`$${profile.totalPaid.toFixed(2)}`,      Icon:ChartBarLineIcon,  from:"from-purple-400", to:"to-purple-600",  sub:"all time paid"},
          ].map(s=>(
            <div key={s.label} className={`bg-gradient-to-br ${s.from} ${s.to} rounded-2xl p-5 flex flex-col justify-between gap-4 min-h-[130px]`}>
              <div className="w-10 h-10 rounded-xl bg-white/25 flex items-center justify-center">
                <s.Icon className="w-5 h-5 text-white"/>
              </div>
              <div>
                <div className="text-2xl font-black text-white">{s.val}</div>
                <div className="text-white/90 text-xs font-semibold mt-0.5">{s.label}</div>
                <div className="text-white/50 text-[10px] mt-0.5">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
          <div className="space-y-5">
            {/* Referral link */}
            <div className="bg-white rounded-2xl p-5">
              <h2 className="font-black text-[#0a1628] mb-3">Your Referral Link</h2>
              <div className="flex gap-2">
                <div className="flex-1 bg-slate-50 rounded-xl px-4 py-3 text-sm text-slate-600 font-mono truncate">{refLink}</div>
                <button onClick={copy} className={`px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${copied?"bg-emerald-500 text-white":"bg-[#0a1628] text-white hover:bg-[#1a3a6b]"}`}>
                  {copied?<><Tick02Icon className="w-4 h-4"/>Copied!</>:<><Copy01Icon className="w-4 h-4"/>Copy</>}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2">Cookie lasts {settings?.cookieDays??30} days.</p>
            </div>

            {/* Referrals */}
            <div className="bg-white rounded-2xl p-5">
              <h2 className="font-black text-[#0a1628] mb-4">Referrals</h2>
              {referrals.length===0 ? (
                <div className="text-center py-8"><UserGroupIcon className="w-8 h-8 text-slate-200 mx-auto mb-2"/><p className="text-slate-400 text-sm">No referrals yet.</p></div>
              ) : (
                <div className="space-y-2">{referrals.map(r=>(
                  <div key={r.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-9 h-9 rounded-full bg-[#0a1628] text-white font-bold text-sm flex items-center justify-center shrink-0">{r.referredUser.name?.[0]?.toUpperCase()}</div>
                    <div className="flex-1 min-w-0"><div className="font-semibold text-[#0a1628] text-sm truncate">{r.referredUser.name}</div><div className="text-xs text-slate-400">{r.referredUser.email}</div></div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tierColors[r.tier]??"bg-slate-100 text-slate-500"}`}>{r.tier.replace("_"," ")}</span>
                      <span className="text-sm font-black text-emerald-500">+${r.commission.toFixed(2)}</span>
                      <span className="text-xs text-slate-400">{ago(r.createdAt)}</span>
                    </div>
                  </div>
                ))}</div>
              )}
            </div>

            {/* Payout History */}
            <div className="bg-white rounded-2xl p-5">
              <h2 className="font-black text-[#0a1628] mb-4">Payout History</h2>
              {payouts.length===0 ? <p className="text-center text-slate-400 text-sm py-6">No payouts yet.</p> : (
                <div className="space-y-2">{payouts.map(p=>(
                  <div key={p.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[#0a1628] text-sm">${p.amount.toFixed(2)} · {p.method}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Clock01Icon className="w-3 h-3"/>{ago(p.createdAt)}{p.note&&<span className="ml-1">· {p.note}</span>}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusColors[p.status]??"bg-slate-100 text-slate-500"}`}>{p.status}</span>
                  </div>
                ))}</div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Commission rates */}
            <div className="bg-white rounded-2xl p-5">
              <h2 className="font-black text-[#0a1628] mb-4">Commission Rates</h2>
              <div className="space-y-2">
                {[
                  {label:"VIP",             rate:settings?.commissionVip??10,         price:39.99},
                  {label:"Marketplace",     rate:settings?.commissionMarketplace??15, price:79.99},
                  {label:"Marketplace Plus",rate:settings?.commissionPlus??20,        price:109.99},
                ].map(r=>(
                  <div key={r.label} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div><div className="text-sm font-bold text-[#0a1628]">{r.label}</div><div className="text-xs text-slate-400">${r.price}/mo</div></div>
                    <div className="text-right"><div className="text-sm font-black text-emerald-500">{r.rate}%</div><div className="text-xs text-slate-400">~${(r.price*r.rate/100).toFixed(2)}</div></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payout request */}
            <div className="bg-[#0a1628] rounded-2xl p-5 text-white">
              <h2 className="font-black mb-1">Request Payout</h2>
              <p className="text-white/60 text-xs mb-4">Min ${settings?.minPayoutAmount??50}. Balance: <strong className="text-[#f0c040]">${profile.pendingBalance.toFixed(2)}</strong></p>
              {!showForm ? (
                <button onClick={()=>setShowForm(true)} disabled={profile.pendingBalance<(settings?.minPayoutAmount??50)}
                  className="w-full bg-[#f0c040] text-[#0a1628] font-black py-2.5 rounded-xl text-sm hover:bg-[#d4a017] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  {profile.pendingBalance<(settings?.minPayoutAmount??50)?`Need $${((settings?.minPayoutAmount??50)-profile.pendingBalance).toFixed(2)} more`:"Request Payout"}
                </button>
              ) : (
                <form onSubmit={submitPayout} className="space-y-3">
                  {formError&&<p className="text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2">{formError}</p>}
                  <input type="number" step="0.01" min="1" max={profile.pendingBalance} value={amount} onChange={e=>setAmount(e.target.value)} placeholder={`Max $${profile.pendingBalance.toFixed(2)}`} required className="w-full bg-white/10 text-white placeholder:text-white/30 rounded-xl px-3 py-2 text-sm outline-none"/>
                  <select value={method} onChange={e=>setMethod(e.target.value)} className="w-full bg-white/10 text-white rounded-xl px-3 py-2 text-sm outline-none">
                    <option value="paypal">PayPal</option><option value="bank">Bank Transfer</option><option value="check">Check</option>
                  </select>
                  <input type="text" value={details} onChange={e=>setDetails(e.target.value)} placeholder="PayPal email / account info" required className="w-full bg-white/10 text-white placeholder:text-white/30 rounded-xl px-3 py-2 text-sm outline-none"/>
                  <div className="flex gap-2">
                    <button type="submit" disabled={submitting} className="flex-1 bg-[#f0c040] text-[#0a1628] font-black py-2.5 rounded-xl text-sm hover:bg-[#d4a017] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                      {submitting&&<Loader2 className="w-4 h-4 animate-spin"/>} Submit
                    </button>
                    <button type="button" onClick={()=>{setShowForm(false);setFormError("");}} className="px-4 py-2.5 bg-white/10 rounded-xl text-sm hover:bg-white/20 transition-all">Cancel</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </>)}
    </div>
  );
}
