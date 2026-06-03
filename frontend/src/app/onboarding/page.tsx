"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChefHat, Shirt, MapPin, Check, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  {
    id: 'interests',
    title: 'Pick your vibe ✨',
    subtitle: 'Select the fashion communities you want to join first.',
    options: [
      { label: 'Streetwear', emoji: '🧥' },
      { label: 'Sneakers', emoji: '👟' },
      { label: 'Vintage', emoji: '🕶️' },
      { label: 'Sustainable', emoji: '🌿' },
      { label: 'Luxury', emoji: '💎' },
      { label: 'Techwear', emoji: '🤖' },
      { label: 'Boho', emoji: '🌸' },
      { label: 'Minimalist', emoji: '⬜' },
    ],
    icon: Shirt,
    accentColor: '#A855F7',
    bgGlow: 'rgba(168,85,247,0.15)',
  },
  {
    id: 'food',
    title: 'Foodie preferences 🍜',
    subtitle: "What makes your mouth water?",
    options: [
      { label: 'Ramen', emoji: '🍜' },
      { label: 'Burgers', emoji: '🍔' },
      { label: 'Vegan', emoji: '🥗' },
      { label: 'Sushi', emoji: '🍣' },
      { label: 'Desserts', emoji: '🍰' },
      { label: 'Korean', emoji: '🥘' },
      { label: 'Italian', emoji: '🍕' },
      { label: 'Cloud Kitchen', emoji: '☁️' },
    ],
    icon: ChefHat,
    accentColor: '#F97316',
    bgGlow: 'rgba(249,115,22,0.15)',
  },
  {
    id: 'location',
    title: 'Where are you? 📍',
    subtitle: 'We use this for hyperlocal drops and delivery.',
    options: null,
    icon: MapPin,
    accentColor: '#EC4899',
    bgGlow: 'rgba(236,72,153,0.15)',
  }
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string[]>>({ interests: [], food: [] });
  const [location, setLocation] = useState('');
  const router = useRouter();

  const step = STEPS[currentStep];

  const toggleOption = (stepId: string, option: string) => {
    setSelections(prev => {
      const current = prev[stepId] || [];
      return {
        ...prev,
        [stepId]: current.includes(option)
          ? current.filter(o => o !== option)
          : [...current, option]
      };
    });
  };

  const next = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(c => c + 1);
    else router.push('/');
  };

  const back = () => {
    if (currentStep > 0) setCurrentStep(c => c - 1);
  };

  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "var(--color-bg)" }}>

      {/* Ambient glow for current step */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: `radial-gradient(circle, ${step.bgGlow} 0%, transparent 70%)` }}
      />

      <div className="relative w-full max-w-md">

        {/* Logo top */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)]">
            <Zap size={16} className="text-white" fill="white" />
          </div>
          <span className="font-black text-white text-lg tracking-tight">OWLY</span>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2 mb-8 justify-center">
          {STEPS.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === currentStep ? 28 : 8,
                opacity: i <= currentStep ? 1 : 0.3
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="h-2 rounded-full"
              style={{
                background: i <= currentStep
                  ? `linear-gradient(90deg, ${step.accentColor}, #EC4899)`
                  : 'rgba(255,255,255,0.15)'
              }}
            />
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="space-y-6"
          >
            {/* Step icon */}
            <div className="flex flex-col items-center text-center gap-3">
              <div
                className="w-16 h-16 rounded-3xl flex items-center justify-center"
                style={{ background: `${step.accentColor}20`, border: `1px solid ${step.accentColor}30` }}
              >
                <step.icon size={28} style={{ color: step.accentColor }} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">{step.title}</h1>
                <p className="text-zinc-400 text-sm mt-1">{step.subtitle}</p>
              </div>
            </div>

            {/* Options grid */}
            {step.options ? (
              <div className="grid grid-cols-2 gap-2.5">
                {step.options.map(({ label, emoji }) => {
                  const isSelected = selections[step.id]?.includes(label);
                  return (
                    <motion.button
                      key={label}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleOption(step.id, label)}
                      className={cn(
                        "flex items-center justify-between px-4 py-3.5 rounded-2xl border text-sm font-bold transition-all",
                        isSelected
                          ? "text-white border-transparent shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                          : "bg-white/[0.04] border-white/[0.07] text-zinc-400 hover:border-white/[0.14] hover:text-white"
                      )}
                      style={isSelected ? {
                        background: `linear-gradient(135deg, ${step.accentColor}30, #EC489915)`,
                        border: `1px solid ${step.accentColor}50`
                      } : {}}
                    >
                      <span className="flex items-center gap-2">
                        <span>{emoji}</span>
                        <span>{label}</span>
                      </span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-lg flex items-center justify-center"
                          style={{ background: `linear-gradient(135deg, ${step.accentColor}, #EC4899)` }}>
                          <Check size={11} className="text-white" />
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              /* Location step */
              <div className="space-y-3">
                <div className="relative">
                  <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter your city or neighbourhood"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl pl-11 pr-4 py-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-pink-500/50 focus:shadow-[0_0_0_3px_rgba(236,72,153,0.1)] transition-all"
                  />
                </div>
                <button
                  className="w-full py-4 rounded-2xl text-sm font-bold border transition-all hover:scale-[1.02]"
                  style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.25)', color: '#EC4899' }}
                >
                  📍 Use current location
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center gap-3 mt-8">
          {currentStep > 0 && (
            <button
              onClick={back}
              className="px-5 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.07] text-zinc-400 hover:text-white font-bold text-sm transition-all hover:bg-white/[0.07]"
            >
              ← Back
            </button>
          )}
          <motion.button
            onClick={next}
            whileTap={{ scale: 0.97 }}
            className="flex-1 py-4 rounded-2xl font-black text-white flex items-center justify-center gap-2 transition-all bg-gradient-brand shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_rgba(139,92,246,0.55)]"
          >
            {isLastStep ? '🚀 Let\'s Go!' : 'Continue'}
            {!isLastStep && <ChevronRight size={18} />}
          </motion.button>
        </div>

        <p className="text-center text-zinc-600 text-xs mt-5">
          Already have an account?{' '}
          <a href="/login" className="text-violet-400 font-bold hover:text-violet-300 transition-colors">Sign in</a>
        </p>
      </div>
    </div>
  );
}
