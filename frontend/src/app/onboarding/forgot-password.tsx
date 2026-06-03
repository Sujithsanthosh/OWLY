"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, ArrowRight, AlertCircle, CheckCircle2, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'email' | 'code' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleEmailStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email');
      return;
    }

    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsLoading(false);

    setSuccess('Reset code sent to your email');
    setTimeout(() => {
      setSuccess('');
      setStep('code');
    }, 1500);
  };

  const handleCodeStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code) {
      setError('Please enter the code');
      return;
    }

    setStep('reset');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsLoading(false);

    setSuccess('Password reset successfully!');
    setTimeout(() => {
      router.push('/auth/login');
    }, 1500);
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "var(--color-bg)" }}>

      {/* Ambient background orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-25 pointer-events-none"
        style={{ background: "radial-gradient(circle, #6D28D9 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-15%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #EC4899 0%, transparent 70%)" }} />

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
              <Mail size={26} className="text-white" />
            </div>
            <h1 className="text-2xl font-black text-white">Reset Password</h1>
            <p className="text-zinc-400 text-sm mt-1.5">
              {step === 'email' && 'Verify your email'}
              {step === 'code' && 'Enter the code'}
              {step === 'reset' && 'Set new password'}
            </p>
          </div>

          {/* Step Indicators */}
          <div className="flex gap-2 mb-8">
            {(['email', 'code', 'reset'] as const).map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all ${
                  step === s || (['code', 'reset'].includes(step) && ['email', 'code'].includes(s))
                    ? 'bg-gradient-brand'
                    : 'bg-white/[0.1]'
                }`}
              />
            ))}
          </div>

          {/* Form Content */}
          {step === 'email' && (
            <form onSubmit={handleEmailStep} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest pl-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.06] transition-all"
                />
              </div>

              <p className="text-xs text-zinc-400 text-center">
                We'll send you a code to reset your password
              </p>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <AlertCircle size={16} className="text-red-400" />
                  <span className="text-xs text-red-300">{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <CheckCircle2 size={16} className="text-green-400" />
                  <span className="text-xs text-green-300">{success}</span>
                </div>
              )}

              <motion.button
                type="submit"
                disabled={isLoading}
                whileTap={{ scale: 0.97 }}
                className="w-full mt-2 py-4 rounded-2xl font-black text-white flex items-center justify-center gap-2 bg-gradient-brand shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_rgba(139,92,246,0.55)] disabled:opacity-70"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>Send Reset Code <ArrowRight size={17} /></>
                )}
              </motion.button>
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={handleCodeStep} className="space-y-4">
              <div className="p-4 bg-white/[0.04] border border-white/[0.08] rounded-xl">
                <p className="text-sm text-zinc-400 text-center">
                  Code sent to <br />
                  <span className="text-white font-semibold">{email}</span>
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest pl-1">
                  Reset Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.06] transition-all text-center tracking-widest font-mono"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <AlertCircle size={16} className="text-red-400" />
                  <span className="text-xs text-red-300">{error}</span>
                </div>
              )}

              <div className="flex gap-3">
                <motion.button
                  type="button"
                  onClick={() => setStep('email')}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 py-4 rounded-2xl font-black text-white bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]"
                >
                  Back
                </motion.button>
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 py-4 rounded-2xl font-black text-white flex items-center justify-center gap-2 bg-gradient-brand shadow-[0_0_30px_rgba(139,92,246,0.4)]"
                >
                  Continue <ArrowRight size={17} />
                </motion.button>
              </div>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest pl-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.06] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest pl-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.06] transition-all"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <AlertCircle size={16} className="text-red-400" />
                  <span className="text-xs text-red-300">{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <CheckCircle2 size={16} className="text-green-400" />
                  <span className="text-xs text-green-300">{success}</span>
                </div>
              )}

              <div className="flex gap-3">
                <motion.button
                  type="button"
                  onClick={() => setStep('code')}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 py-4 rounded-2xl font-black text-white bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]"
                >
                  Back
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 py-4 rounded-2xl font-black text-white flex items-center justify-center gap-2 bg-gradient-brand shadow-[0_0_30px_rgba(139,92,246,0.4)] disabled:opacity-70"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <>Reset Password</>
                  )}
                </motion.button>
              </div>
            </form>
          )}

          {/* Footer */}
          <p className="text-center text-zinc-500 text-sm mt-6">
            Remember your password?{' '}
            <Link href="/auth/login" className="text-violet-400 font-bold hover:text-violet-300 transition-colors">
              Sign in →
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
