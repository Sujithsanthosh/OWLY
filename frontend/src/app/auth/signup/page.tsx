"use client";

import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Zap, ArrowRight, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useApi';
import { AppContext } from '@/store/AppContext';

export default function SignupPage() {
  const [step, setStep] = useState<'info' | 'interests'>('info');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [interests, setInterests] = useState<string[]>([]);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { signup, loading } = useAuth();
  const { setUser } = useContext(AppContext);

  const interestOptions = [
    '👗 Fashion',
    '🍕 Food',
    '💄 Beauty',
    '⚽ Sports',
    '🎮 Gaming',
    '📚 Books',
    '🎵 Music',
    '✈️ Travel',
    '🏠 Home & Garden',
    '💻 Tech',
    '🎨 Art & Crafts',
    '💪 Fitness',
  ];

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const validateStep1 = () => {
    setError('');
    
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return false;
    }
    
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email');
      return false;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (formData.phone && !formData.phone.match(/^\d{10}$/)) {
      setError('Phone must be 10 digits');
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep('interests');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (interests.length === 0) {
      setError('Please select at least one interest');
      return;
    }

    const result = await signup(
      formData.name,
      formData.email,
      formData.password,
      formData.phone || undefined,
      interests
    );

    if (result?.success && result?.data?.token) {
      localStorage.setItem('token', result.data.token);
      if (result.data.user) {
        setUser(result.data.user);
      }
      router.push('/onboarding');
    } else {
      setError(result?.message || 'Signup failed. Please try again.');
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
      <div
        className="absolute top-[40%] right-[20%] w-[200px] h-[200px] rounded-full blur-[80px] opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #F97316 0%, transparent 70%)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 24 }}
        className="relative w-full max-w-md"
      >
        <div className="glass rounded-3xl p-8 border border-white/[0.1] shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(139,92,246,0.5)]">
              <Zap size={26} className="text-white" fill="white" />
            </div>
            <h1 className="text-2xl font-black text-white">Join the tribe</h1>
            <p className="text-zinc-400 text-sm mt-1.5 text-center">
              {step === 'info' ? 'Create your account' : 'Choose your interests'}
            </p>
          </div>

          {/* Progress indicator */}
          <div className="flex gap-2 mb-6">
            <div className={`flex-1 h-1 rounded-full transition-all ${step === 'info' ? 'bg-violet-500' : 'bg-violet-500/30'}`} />
            <div className={`flex-1 h-1 rounded-full transition-all ${step === 'interests' ? 'bg-violet-500' : 'bg-violet-500/30'}`} />
          </div>

          <form onSubmit={step === 'info' ? (e) => { e.preventDefault(); handleNext(); } : handleSignup} className="space-y-4">
            {step === 'info' ? (
              <>
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest pl-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest pl-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest pl-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="9876543210"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest pl-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 pr-12 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest pl-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 pr-12 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Interests */}
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest pl-1">
                    Select your interests
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-2">
                    {interestOptions.map((interest) => (
                      <motion.button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        whileTap={{ scale: 0.95 }}
                        className={`relative px-3 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                          interests.includes(interest)
                            ? 'bg-violet-500/20 border border-violet-500/60 text-violet-300'
                            : 'bg-white/[0.04] border border-white/[0.08] text-zinc-300 hover:bg-white/[0.07]'
                        }`}
                      >
                        {interest}
                        {interests.includes(interest) && (
                          <Check size={14} className="absolute right-2 top-1/2 -translate-y-1/2" />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </>
            )}

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
                  {step === 'info' ? 'Next' : 'Create Account'}
                  <ArrowRight size={17} />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <p className="text-center text-zinc-500 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-violet-400 font-bold hover:text-violet-300 transition-colors">
              Sign in →
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
