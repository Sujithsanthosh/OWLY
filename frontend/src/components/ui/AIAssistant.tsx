"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type Message = { role: 'user' | 'assistant'; text: string };

const SUGGESTIONS = ['Suggest outfit', 'Find Ramen near me', 'Join a Tribe', 'Best food drops'];

const MOCK_RESPONSES = [
  "Based on your vibe, check out the 'Streetwear NYC' tribe — they just dropped limited hoodies that match your style. Want me to show you? 👟",
  "Found 3 amazing ramen spots near you! Momotaro has a 4.9-star Spicy Miso that's trending right now. Shall I add it to your feed? 🍜",
  "You'd love the 'Cloud Kitchen Collective' tribe — 8.2k foodies sharing hidden gems. Should I get you in? ✨",
  "Right now: Supreme x Owly Flash Drop live in 10 mins, and EcoWear's Summer Linen Set just sold 40 units. Want early access? 🔥",
];

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: "Hey! I'm Owly AI ✨\nLooking for a new fit or a tasty meal? Ask me anything — I can style outfits, find food drops, or recommend tribes for you." }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const responseIdx = useRef(0);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const reply = MOCK_RESPONSES[responseIdx.current % MOCK_RESPONSES.length];
      responseIdx.current++;
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
      setIsTyping(false);
    }, 1400);
  };

  return (
    <>
      {/* FAB Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-24 right-5 w-14 h-14 rounded-2xl flex items-center justify-center z-50 md:bottom-8 md:right-8",
          "shadow-[0_0_30px_rgba(139,92,246,0.5)] bg-gradient-brand",
          isOpen && "hidden"
        )}
      >
        <Sparkles size={24} className="text-white" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-pink-500 rounded-full border-2 border-[var(--color-bg)]" />
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-24 right-4 z-[60] w-[calc(100vw-32px)] max-w-[360px] h-[520px] flex flex-col rounded-3xl overflow-hidden md:bottom-8 md:right-8"
            style={{
              background: "var(--color-surface)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.15), 0 0 60px rgba(139,92,246,0.08)"
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.07]"
              style={{ background: "linear-gradient(135deg, rgba(109,40,217,0.15), rgba(236,72,153,0.1))" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.4)]">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold leading-none">Owly AI</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[10px] text-zinc-400 font-medium">Always on</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.08] transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-lg bg-gradient-brand flex items-center justify-center mr-2 mt-1 shrink-0">
                      <Sparkles size={10} className="text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[82%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line",
                      msg.role === 'user'
                        ? "bg-gradient-brand text-white rounded-tr-sm font-medium"
                        : "bg-white/[0.06] border border-white/[0.08] text-zinc-200 rounded-tl-sm"
                    )}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-end gap-2"
                >
                  <div className="w-6 h-6 rounded-lg bg-gradient-brand flex items-center justify-center shrink-0">
                    <Sparkles size={10} className="text-white" />
                  </div>
                  <div className="bg-white/[0.06] border border-white/[0.08] px-4 py-3 rounded-2xl rounded-tl-sm">
                    <div className="flex gap-1 items-center h-3">
                      {[0, 0.2, 0.4].map((delay, i) => (
                        <motion.span
                          key={i}
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.7, delay, repeat: Infinity }}
                          className="w-1.5 h-1.5 bg-zinc-400 rounded-full block"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Suggestions */}
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="whitespace-nowrap text-[10px] font-semibold px-3 py-1.5 rounded-full border border-white/[0.1] text-zinc-400 hover:text-white hover:border-violet-500/50 hover:bg-violet-500/10 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-2xl px-4 py-2.5 focus-within:border-violet-500/50 focus-within:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                  placeholder="Ask anything…"
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim()}
                  className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center disabled:opacity-40 transition-opacity"
                >
                  <Send size={14} className="text-white" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
