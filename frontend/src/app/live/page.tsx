"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Share2, ShoppingBag, Users, Zap, Gavel, Gift, Send } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { cn } from '@/lib/utils';

const MOCK_COMMENTS = [
  { id: 1, user: 'hypebeast_99', text: 'OMG is that the limited drop?? 👀', color: '#A855F7' },
  { id: 2, user: 'sarah_styles', text: 'The quality looks insane 🔥', color: '#EC4899' },
  { id: 3, user: 'foodie_mike', text: 'Can we see the inside?', color: '#F97316' },
  { id: 4, user: 'urban_rider', text: 'Copping right now 🛒', color: '#22C55E' },
  { id: 5, user: 'nova_drops', text: 'Already sold out on my end 😭', color: '#EAB308' },
];

const REACTIONS = ['🔥', '❤️', '👟', '😍', '💯'];

type FloatingEmoji = { id: number; emoji: string; x: number };

export default function LiveCommercePage() {
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [likes, setLikes] = useState(1240);
  const [currentBid, setCurrentBid] = useState(120);
  const [bids, setBids] = useState<{ user: string; amount: number }[]>([]);
  const [input, setInput] = useState('');
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const commentsRef = useRef<HTMLDivElement>(null);
  const emojiId = useRef(0);

  useEffect(() => {
    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      reconnection: false,
    });

    socketRef.current.on('new_bid', (data: { user: string; bidAmount: number }) => {
      setBids(prev => [{ user: data.user, amount: data.bidAmount }, ...prev].slice(0, 5));
      setCurrentBid(data.bidAmount);
    });

    socketRef.current.on('new_message', (data: { userName: string; message: string }) => {
      setComments(prev => [...prev, {
        id: Date.now(),
        user: data.userName,
        text: data.message,
        color: '#A855F7'
      }].slice(-20));
    });

    return () => { socketRef.current?.disconnect(); };
  }, []);

  useEffect(() => {
    if (commentsRef.current) {
      commentsRef.current.scrollTop = commentsRef.current.scrollHeight;
    }
  }, [comments]);

  const sendReaction = (emoji: string) => {
    const id = emojiId.current++;
    const x = 20 + Math.random() * 60;
    setFloatingEmojis(prev => [...prev, { id, emoji, x }]);
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== id));
    }, 2000);
  };

  const handleLike = () => {
    setIsLiked(l => !l);
    setLikes(c => isLiked ? c - 1 : c + 1);
    sendReaction('❤️');
  };

  const placeBid = () => {
    const newBid = currentBid + 10;
    socketRef.current?.emit('place_bid', {
      streamId: 'stream_123',
      productId: 'prod_1',
      bidAmount: newBid,
      userId: 'user_1',
      userName: 'You'
    });
    setBids(prev => [{ user: 'You', amount: newBid }, ...prev].slice(0, 5));
    setCurrentBid(newBid);
  };

  return (
    <div className="h-dvh bg-black relative overflow-hidden flex flex-col md:flex-row">

      {/* ── Video area ── */}
      <div className="relative flex-1">
        <img
          src="https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&q=80"
          alt="Live Stream"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent via-40% to-black/70 z-10" />

        {/* ── Top overlay ── */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl overflow-hidden ring-2 ring-pink-500/60">
                <img src="https://i.pravatar.cc/44?u=streetvibe" alt="Host" className="w-full h-full object-cover" />
              </div>
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-red-500 text-[7px] font-black uppercase text-white rounded-md flex items-center gap-1">
                <span className="live-dot w-1 h-1" />
                LIVE
              </span>
            </div>
            <div>
              <p className="text-white font-black text-sm drop-shadow">StreetVibe Official</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Users size={10} className="text-white/70" />
                <span className="text-white/70 text-[11px] font-semibold">4.2k watching</span>
              </div>
            </div>
            <button className="px-3 py-1.5 rounded-full glass-dark border border-pink-500/40 text-pink-400 text-[11px] font-bold">
              + Follow
            </button>
          </div>
          <button className="w-10 h-10 rounded-2xl glass-dark flex items-center justify-center text-white/70 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* ── Pinned product card ── */}
        <div className="absolute right-4 top-24 z-20 w-44">
          <div className="glass-strong rounded-2xl p-3 border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <div className="relative aspect-square rounded-xl overflow-hidden mb-2.5">
              <img
                src="https://images.unsplash.com/photo-1552346154-21d32810aba3?w=200&q=80"
                alt="Product"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-pink-500/80 rounded-md text-[8px] font-black text-white uppercase">
                Flash Drop
              </div>
            </div>
            <p className="text-white text-xs font-black truncate">Owly StreetVibe V1</p>
            <p className="text-violet-300 font-black text-sm mt-0.5">₹{(currentBid * 83).toFixed(0)}</p>

            <button
              onClick={placeBid}
              className="w-full mt-2 py-2 rounded-xl bg-gradient-brand text-white text-[10px] font-black flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(139,92,246,0.35)]"
            >
              <Gavel size={11} />
              BID ₹{((currentBid + 10) * 83).toFixed(0)}
            </button>

            {bids.length > 0 && (
              <div className="mt-2 space-y-0.5">
                {bids.slice(0, 3).map((bid, i) => (
                  <div key={i} className="flex justify-between text-[8px]">
                    <span className="text-zinc-400">{bid.user}</span>
                    <span className="text-violet-400 font-bold">₹{(bid.amount * 83).toFixed(0)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-2 h-0.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "15%" }}
                transition={{ duration: 30 }}
                className="h-full bg-gradient-brand"
              />
            </div>
            <p className="text-[8px] text-zinc-500 mt-1 text-center">Only 12 left!</p>
          </div>
        </div>

        {/* ── Floating emojis ── */}
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
          <AnimatePresence>
            {floatingEmojis.map(e => (
              <motion.div
                key={e.id}
                initial={{ opacity: 1, y: 0, scale: 1 }}
                animate={{ opacity: 0, y: -200, scale: 1.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.8, ease: "easeOut" }}
                className="absolute bottom-40 text-3xl"
                style={{ left: `${e.x}%` }}
              >
                {e.emoji}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* ── Bottom: comments + controls ── */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 space-y-3">

          {/* Comments stream */}
          <div
            ref={commentsRef}
            className="max-h-40 overflow-y-auto space-y-1.5 scrollbar-none mask-top"
          >
            {comments.map(comment => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-start max-w-[85%]"
              >
                <div className="glass-dark px-3 py-2 rounded-2xl border border-white/[0.08] inline-block">
                  <span className="font-black text-xs mr-2" style={{ color: comment.color }}>
                    {comment.user}
                  </span>
                  <span className="text-white/90 text-xs">{comment.text}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Action row */}
          <div className="flex items-center gap-2.5">
            <div className="flex-1 flex items-center glass-dark border border-white/[0.1] rounded-full px-4 gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Say something…"
                className="flex-1 bg-transparent py-3 text-sm text-white placeholder:text-white/40 focus:outline-none"
              />
              <button
                onClick={() => {
                  if (input.trim()) {
                    setComments(prev => [...prev, { id: Date.now(), user: 'You', text: input, color: '#8B5CF6' }]);
                    setInput('');
                  }
                }}
                className="text-white/50 hover:text-white transition-colors"
              >
                <Send size={16} />
              </button>
            </div>

            <button
              onClick={handleLike}
              className={cn(
                "w-11 h-11 rounded-full flex items-center justify-center border transition-all",
                isLiked ? "bg-pink-500/20 border-pink-500/50" : "glass-dark border-white/10"
              )}
            >
              <Heart size={20} className={isLiked ? "text-pink-500 fill-pink-500" : "text-white"} />
            </button>

            <button className="w-11 h-11 rounded-full glass-dark border border-white/10 flex items-center justify-center text-white">
              <Share2 size={20} />
            </button>

            <button className="w-11 h-11 rounded-full bg-gradient-brand flex items-center justify-center text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]">
              <ShoppingBag size={20} />
            </button>
          </div>

          {/* Reactions bar */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-safe">
            {REACTIONS.map(r => (
              <button
                key={r}
                onClick={() => sendReaction(r)}
                className="w-10 h-10 glass-dark rounded-2xl border border-white/[0.08] flex items-center justify-center text-lg hover:scale-110 active:scale-95 transition-transform shrink-0"
              >
                {r}
              </button>
            ))}
            <button className="flex items-center gap-1.5 px-3 h-10 glass-dark rounded-2xl border border-yellow-500/30 text-yellow-400 text-xs font-bold whitespace-nowrap">
              <Gift size={13} />
              Gift
            </button>
          </div>
        </div>
      </div>

      {/* ── Desktop info panel ── */}
      <div className="hidden md:flex w-96 flex-col border-l border-white/[0.07] p-6"
        style={{ background: "var(--color-surface)" }}>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black">Live Details</h2>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20">
            <span className="live-dot" />
            <span className="text-red-400 text-xs font-bold">Live Now</span>
          </div>
        </div>

        <div className="space-y-5 flex-1">
          {/* About */}
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">About the Brand</p>
            <div className="rounded-2xl p-4 border border-white/[0.06]" style={{ background: "var(--color-card)" }}>
              <p className="text-sm text-zinc-300 leading-relaxed">StreetVibe is a community-first fashion label focused on sustainable luxury and urban culture. Every piece tells a story.</p>
            </div>
          </div>

          {/* Upcoming drops */}
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-3">Upcoming Drops</p>
            <div className="space-y-2.5">
              {[
                { name: "Cyber Hoodie 2077", time: "Releasing in 14:20", img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=80&q=80" },
                { name: "Techwear Joggers", time: "Releasing in 28:00", img: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=80&q=80" }
              ].map((drop, i) => (
                <div key={i} className="flex gap-3 items-center p-3 rounded-2xl border border-white/[0.06]" style={{ background: "var(--color-card)" }}>
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                    <img src={drop.img} alt={drop.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{drop.name}</p>
                    <p className="text-xs text-violet-400 font-semibold">{drop.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Earn points CTA */}
        <div
          className="rounded-2xl p-5 border border-violet-500/20 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(109,40,217,0.2), rgba(236,72,153,0.1))" }}
        >
          <div className="relative z-10">
            <h3 className="font-black text-base mb-1 flex items-center gap-2">
              <Zap size={16} className="text-yellow-400" />
              Earn 500 Points
            </h3>
            <p className="text-xs text-zinc-400">Watch for 15 mins to unlock exclusive badges and early access to the next drop.</p>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-violet-500/15 blur-2xl" />
        </div>
      </div>
    </div>
  );
}
