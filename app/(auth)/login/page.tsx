"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { loginSchema, type LoginInput } from "@/lib/schemas";
import { Scale, Mail, Lock, ArrowRight, Globe } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true); setServerError("");
    try {
      const res = await signIn.email({ email: data.email, password: data.password });
      if (res.error) setServerError(res.error.message || "Invalid email or password.");
      else router.push("/feed");
    } catch { setServerError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signIn.social({ provider: "google", callbackURL: "/feed" });
    } catch { setServerError("Google sign-in failed."); }
    finally { setGoogleLoading(false); }
  };

  const inputCls = (err: boolean) =>
    `w-full font-[inherit] text-sm pl-10 pr-4 py-3 border rounded-xl outline-none transition-all ${err ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-slate-200 focus:border-[#0a1628] focus:ring-2 focus:ring-[#0a1628]/10"}`;

  return (
    <div className="min-h-screen flex font-[var(--font-urbanist,Urbanist),sans-serif]">
      {/* Left */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-16 bg-gradient-to-br from-[#0a1628] via-[#1a3a6b] to-[#0d2445] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(212,160,23,0.1) 0%, transparent 60%)" }} />
        <div className="relative z-10 max-w-sm">
          <Link href="/" className="flex items-center gap-2.5 text-white font-black text-2xl mb-10">
            <Scale className="w-7 h-7 text-[#f0c040]" />TaxCom<span className="text-[#f0c040]">Pro</span>
          </Link>
          <h1 className="text-4xl font-black text-white mb-4 leading-tight">Welcome Back to the Community</h1>
          <p className="text-white/60 text-base leading-relaxed mb-10">Access your dashboard, marketplace listings, and Pro Hub communities.</p>
          {[["Marketplace access & listings"],["Pro Hub communities"],["ATLAS AI Tax Bot"],["Private messaging & networking"]].map(([f]) => (
            <div key={f} className="flex items-center gap-3 bg-white/8 border border-white/10 rounded-xl px-4 py-3 mb-2.5">
              <div className="w-2 h-2 rounded-full bg-[#f0c040] shrink-0" />
              <span className="text-white/75 text-sm font-medium">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-10 shadow-xl">
          <Link href="/" className="lg:hidden flex items-center gap-2 text-[#0a1628] font-black text-xl mb-8">
            <Scale className="w-6 h-6 text-[#d4a017]" />TaxCom<span className="text-[#d4a017]">Pro</span>
          </Link>

          <h2 className="text-3xl font-black text-[#0a1628] mb-1.5">Sign In</h2>
          <p className="text-slate-500 text-sm mb-8">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#0a1628] font-bold hover:text-[#d4a017] transition-colors">Create one free</Link>
          </p>

          {serverError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-5">{serverError}</div>}

          {/* Google */}
          <button onClick={handleGoogle} disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 border-2 border-slate-200 rounded-xl py-3 font-semibold text-sm text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all mb-5 disabled:opacity-60">
            <Globe className="w-4 h-4" />
            {googleLoading ? "Redirecting…" : "Continue with Google"}
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">or continue with email</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#0a1628] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input id="email" type="email" placeholder="you@example.com" className={inputCls(!!errors.email)} {...register("email")} />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="block text-sm font-semibold text-[#0a1628]">Password</label>
                <Link href="/forgot-password" className="text-xs text-slate-400 hover:text-[#0a1628] transition-colors">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input id="password" type="password" placeholder="••••••••" className={inputCls(!!errors.password)} {...register("password")} />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#f0c040] to-[#d4a017] text-[#0a1628] font-bold text-sm py-3.5 rounded-full hover:shadow-[0_0_20px_rgba(212,160,23,0.4)] hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mt-2">
              {loading ? "Signing In…" : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            By signing in you agree to our <Link href="#" className="underline hover:text-[#0a1628]">Terms</Link> and{" "}
            <Link href="#" className="underline hover:text-[#0a1628]">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
