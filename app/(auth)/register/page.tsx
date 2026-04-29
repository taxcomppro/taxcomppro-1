"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp, signIn } from "@/lib/auth-client";
import { z } from "zod";
import { Scale, Mail, Lock, User, ArrowRight, Globe } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  agreeTerms: z.boolean().refine((v) => v === true, "You must agree to the terms"),
}).refine((d) => d.password === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { agreeTerms: false },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true); setServerError("");
    try {
      const res = await signUp.email({ email: data.email, password: data.password, name: data.name });
      if (res.error) setServerError(res.error.message || "Registration failed.");
      else router.push("/feed");
    } catch { setServerError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try { await signIn.social({ provider: "google", callbackURL: "/feed" }); }
    catch { setServerError("Google sign-in failed."); }
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
          <h1 className="text-4xl font-black text-white mb-4 leading-tight">Join the TaxComPro Community</h1>
          <p className="text-white/60 text-base leading-relaxed mb-8">Create your free account. Everyone starts as a Member — your admin can update your role anytime.</p>
          <div className="bg-[#d4a017]/15 border border-[#d4a017]/35 rounded-xl p-5">
            <div className="text-[#f0c040] font-bold text-base mb-1">🛡️ Free Membership Includes:</div>
            <ul className="space-y-1.5 mt-3">
              {["Marketplace access (view)","Communities access","Member directory","Secure members-only environment"].map((f) => (
                <li key={f} className="text-white/60 text-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#f0c040] shrink-0" />{f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-10 shadow-xl">
          <Link href="/" className="lg:hidden flex items-center gap-2 text-[#0a1628] font-black text-xl mb-8">
            <Scale className="w-6 h-6 text-[#d4a017]" />TaxCom<span className="text-[#d4a017]">Pro</span>
          </Link>

          <h2 className="text-3xl font-black text-[#0a1628] mb-1.5">Create Account</h2>
          <p className="text-slate-500 text-sm mb-8">
            Already have an account?{" "}
            <Link href="/login" className="text-[#0a1628] font-bold hover:text-[#d4a017] transition-colors">Sign in</Link>
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
            <span className="text-xs text-slate-400 font-medium">or register with email</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-[#0a1628] mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input id="name" type="text" placeholder="John Smith" className={inputCls(!!errors.name)} {...register("name")} />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-sm font-semibold text-[#0a1628] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input id="reg-email" type="email" placeholder="you@example.com" className={inputCls(!!errors.email)} {...register("email")} />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-semibold text-[#0a1628] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input id="reg-password" type="password" placeholder="At least 8 characters" className={inputCls(!!errors.password)} {...register("password")} />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#0a1628] mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input id="confirmPassword" type="password" placeholder="Repeat your password" className={inputCls(!!errors.confirmPassword)} {...register("confirmPassword")} />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1.5">{errors.confirmPassword.message}</p>}
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" {...register("agreeTerms")} className="mt-0.5 w-4 h-4 shrink-0 accent-[#0a1628]" />
              <span className="text-sm text-slate-500">
                I agree to the <Link href="#" className="text-[#0a1628] font-semibold underline">Terms of Service</Link> and{" "}
                <Link href="#" className="text-[#0a1628] font-semibold underline">Privacy Policy</Link>
              </span>
            </label>
            {errors.agreeTerms && <p className="text-red-500 text-xs -mt-2">{errors.agreeTerms.message}</p>}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#f0c040] to-[#d4a017] text-[#0a1628] font-bold text-sm py-3.5 rounded-full hover:shadow-[0_0_20px_rgba(212,160,23,0.4)] hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
              {loading ? "Creating Account…" : <><span>Create Free Account</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
