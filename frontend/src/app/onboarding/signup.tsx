"use client";

import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Zap, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useApi';
import { AppContext } from '@/store/AppContext';

const INTERESTS = [
  'Fashion', 'Food', 'Home', 'Electronics', 'Beauty',
  'Sports', 'Books', 'Gaming', 'Travel', 'Fitness'
];

export default function SignupPage() {
  const [step, setStep] = useState<'info' | 'interests' | 'verify'>('info');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const { signup, loading } = useAuth();
  const { setUser } = useContext(AppContext);

  const handleInfoStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setStep('interests');
  };

  const handleInterestsStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (selectedInterests.length === 0) {
      setError('Please select at least one interest');
      return;
    }

    setStep('verify');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await signup(name, email, password, phone, selectedInterests);
    
    if (result?.success && result?.data?.token) {
      localStorage.setItem('token', result.data.token);
      if (result.data.user) {
        setUser(result.data.user);
      }
      setSuccess('Account created successfully!');
      setTimeout(() => {
        router.push('/onboarding');
      }, 1500);
    } else {
      setError(result?.message || 'Signup failed. Please try again.');
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
            <h1 className="text-2xl font-black text-white">Join the Tribe</h1>
            <p className="text-zinc-400 text-sm mt-1.5">
              {step === 'info' && 'Create your account'}
              {step === 'interests' && 'What interests you?'}
              {step === 'verify' && 'Almost there!'}
            </p>
          </div>

          {/* Step Indicators */}
          <div className="flex gap-2 mb-8">
            {(['info', 'interests', 'verify'] as const).map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all ${
                  step === s || (['interests', 'verify'].includes(step) && ['info', 'interests'].includes(s))
                    ? 'bg-gradient-brand'
                    : 'bg-white/[0.1]'
                }`}
              />
            ))}
          </div>

          {/* Form Content */}
          {step === 'info' && (
            <form onSubmit={handleInfoStep} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest pl-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.06] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest pl-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.06] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest pl-1">Phone (Optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.06] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest pl-1">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 pr-12 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.06] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest pl-1">Confirm Password</label>
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

              <motion.button
                type="submit"
                whileTap={{ scale: 0.97 }}
                className="w-full mt-2 py-4 rounded-2xl font-black text-white flex items-center justify-center gap-2 bg-gradient-brand shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_rgba(139,92,246,0.55)]"
              >
                Continue <ArrowRight size={17} />
              </motion.button>
            </form>
          )}

          {step === 'interests' && (
            <form onSubmit={handleInterestsStep} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {INTERESTS.map((interest) => (
                  <motion.button
                    key={interest}
                    type="button"
                    onClick={() => {
                      setSelectedInterests(prev =>
                        prev.includes(interest)
                          ? prev.filter(i => i !== interest)
                          : [...prev, interest]
                      );
                    }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-3 rounded-xl font-semibold transition-all text-sm ${
                      selectedInterests.includes(interest)
                        ? 'bg-gradient-brand text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]'
                        : 'bg-white/[0.04] border border-white/[0.08] text-zinc-300 hover:bg-white/[0.07]'
                    }`}
                  >
                    {interest}
                  </motion.button>
                ))}
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
                  onClick={() => setStep('info')}
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

          {step === 'verify' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="p-4 bg-white/[0.04] border border-white/[0.08] rounded-xl">
                <p className="text-sm text-zinc-400 text-center">
                  Verification code sent to <br />
                  <span className="text-white font-semibold">{email}</span>
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest pl-1">Verification Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
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

              {success && (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <CheckCircle2 size={16} className="text-green-400" />
                  <span className="text-xs text-green-300">{success}</span>
                </div>
              )}

              <div className="flex gap-3">
                <motion.button
                  type="button"
                  onClick={() => setStep('interests')}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 py-4 rounded-2xl font-black text-white bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]"
                >
                  Back
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 py-4 rounded-2xl font-black text-white flex items-center justify-center gap-2 bg-gradient-brand shadow-[0_0_30px_rgba(139,92,246,0.4)] disabled:opacity-70"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <>Create Account</>
                  )}
                </motion.button>
              </div>
            </form>
          )}

          {/* Footer */}
          <p className="text-center text-zinc-500 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-violet-400 font-bold hover:text-violet-300 transition-colors">
              Sign in →
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
