"use client";

import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Zap, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useApi';
import { AppContext } from '@/store/AppContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login, loading } = useAuth();
  const { setUser } = useContext(AppContext);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const result = await login(email, password);
    
    if (result?.success && result?.data?.token) {
      localStorage.setItem('token', result.data.token);
      if (result.data.user) {
        setUser(result.data.user);
      }
      router.push('/');
    } else {
      setError(result?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "var(--color-bg)" }}>

      {/* Ambient background orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-25 pointer-events-none"
        style={{ background: "radial-gradient(circle, #6D28D9 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-15%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #EC4899 0%, transparent 70%)" }} />
      <div className="absolute top-[40%] right-[20%] w-[200px] h-[200px] rounded-full blur-[80px] opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #F97316 0%, transparent 70%)" }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 24 }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="glass rounded-3xl p-8 border border-white/[0.1] shadow-[0_32px_80px_rgba(0,0,0,0.6)]">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(139,92,246,0.5)]">
              <Zap size={26} className="text-white" fill="white" />
            </div>
            <h1 className="text-2xl font-black text-white">Welcome back</h1>
            <p className="text-zinc-400 text-sm mt-1.5 text-center">Your tribe is waiting for you 🔥</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest pl-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest pl-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 pr-12 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="flex justify-end">
                <Link href="/auth/forgot-password" className="text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle size={16} className="text-red-400" />
                <span className="text-xs text-red-300">{error}</span>
              </div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="w-full mt-2 py-4 rounded-2xl font-black text-white flex items-center justify-center gap-2 transition-all disabled:opacity-70 bg-gradient-brand shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_rgba(139,92,246,0.55)]"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={17} />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/[0.07]" />
            <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-white/[0.07]" />
          </div>

          {/* Social login */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2.5 bg-white/[0.04] border border-white/[0.08] py-3.5 rounded-xl hover:bg-white/[0.07] hover:border-white/[0.14] transition-all group">
              <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M43.611 20.083H42V20H24V28H35.303C33.654 32.657 29.223 36 24 36C17.373 36 12 30.627 12 24C12 17.373 17.373 12 24 12C27.059 12 29.842 13.154 31.961 15.039L37.618 9.382C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24C4 35.045 12.955 44 24 44C35.045 44 44 35.045 44 24C44 22.659 43.862 21.35 43.611 20.083Z" fill="#FFC107"/>
                <path d="M6.306 14.691L12.877 19.51C14.655 15.108 18.961 12 24 12C27.059 12 29.842 13.154 31.961 15.039L37.618 9.382C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691Z" fill="#FF3D00"/>
                <path d="M24 44C29.166 44 33.86 42.023 37.409 38.808L31.219 33.57C29.211 35.092 26.715 36 24 36C18.798 36 14.381 32.683 12.717 28.054L6.195 33.079C9.505 39.556 16.227 44 24 44Z" fill="#4CAF50"/>
                <path d="M43.611 20.083H42V20H24V28H35.303C34.511 30.237 33.072 32.166 31.219 33.571C31.22 33.57 31.22 33.57 31.221 33.569L37.411 38.807C36.971 39.205 44 34 44 24C44 22.659 43.862 21.35 43.611 20.083Z" fill="#1976D2"/>
              </svg>
              <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2.5 bg-white/[0.04] border border-white/[0.08] py-3.5 rounded-xl hover:bg-white/[0.07] hover:border-white/[0.14] transition-all group">
              <span className="text-xl">📱</span>
              <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">Phone</span>
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-zinc-500 text-sm mt-6">
            New here?{' '}
            <Link href="/auth/signup" className="text-violet-400 font-bold hover:text-violet-300 transition-colors">
              Join the tribe →
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
