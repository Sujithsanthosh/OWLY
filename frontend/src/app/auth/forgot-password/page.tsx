"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, AlertCircle, CheckCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useApi } from '@/hooks/useApi';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { request, loading } = useApi();

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email');
      return;
    }

    const result = await request('POST', '/api/auth/forgot-password', { email });
    if (result?.success) {
      setSuccess('OTP sent to your email');
      setStep('otp');
    } else {
      setError(result?.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    const result = await request('POST', '/api/auth/verify-otp', { email, otp });
    if (result?.success) {
      setSuccess('OTP verified');
      setStep('reset');
    } else {
      setError(result?.message || 'Invalid OTP');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const result = await request('POST', '/api/auth/reset-password', {
      email,
      otp,
      newPassword,
    });

    if (result?.success) {
      setSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => router.push('/login'), 2000);
    } else {
      setError(result?.message || 'Failed to reset password');
    }
  };

  return (
    <div
      className="min-h-dvh flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "var(--color-bg)" }}
    >
      {/* Ambient background orbs */}
      <div
        className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-25 pointer-events-none"
        style={{ background: "radial-gradient(circle, #6D28D9 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-[-15%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #EC4899 0%, transparent 70%)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 24 }}
        className="relative w-full max-w-md"
      >
        <div className="glass rounded-3xl p-8 border border-white/[0.1] shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Link
              href="/login"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-black text-white">Reset Password</h1>
              <p className="text-zinc-400 text-xs mt-0.5">
                {step === 'email' && 'Enter your email'}
                {step === 'otp' && 'Verify OTP'}
                {step === 'reset' && 'Create new password'}
              </p>
            </div>
          </div>

          <form
            onSubmit={
              step === 'email'
                ? handleRequestOTP
                : step === 'otp'
                  ? handleVerifyOTP
                  : handleResetPassword
            }
            className="space-y-4"
          >
            {step === 'email' && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest pl-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all"
                />
              </div>
            )}

            {step === 'otp' && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest pl-1">
                  Enter OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all text-center tracking-widest font-mono"
                />
                <p className="text-xs text-zinc-500 text-center">
                  Check your email for the OTP
                </p>
              </div>
            )}

            {step === 'reset' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest pl-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 pr-12 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
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
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all"
                  />
                </div>
              </>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle size={16} className="text-red-400" />
                <span className="text-xs text-red-300">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <CheckCircle size={16} className="text-green-400" />
                <span className="text-xs text-green-300">{success}</span>
              </div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="w-full mt-6 py-4 rounded-2xl font-black text-white flex items-center justify-center gap-2 transition-all disabled:opacity-70 bg-gradient-brand shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_rgba(139,92,246,0.55)]"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  {step === 'email' && 'Send OTP'}
                  {step === 'otp' && 'Verify OTP'}
                  {step === 'reset' && 'Reset Password'}
                  <ArrowRight size={17} />
                </>
              )}
            </motion.button>
          </form>

          {step === 'otp' && (
            <button
              onClick={() => setStep('email')}
              className="w-full mt-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Change email
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
