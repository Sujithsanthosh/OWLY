"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, ShoppingCart, UserPlus, Bookmark, Music2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeedItemProps {
  post: {
    id: number;
    userName: string;
    userAvatar: string;
    content: string;
    mediaUrl: string;
    type: 'food' | 'fashion';
    likes: number;
    comments: number;
    product?: {
      name: string;
      price: number;
    };
  };
}

const MUSIC_TRACKS = [
  "Drake – Started From The Bottom",
  "Travis Scott – SICKO MODE",
  "Pharrell – Happy",
  "The Weeknd – Blinding Lights",
];

function formatCount(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toString();
}

export default function FeedItem({ post }: FeedItemProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const music = MUSIC_TRACKS[post.id % MUSIC_TRACKS.length];

  const handleLike = () => {
    if (!liked) {
      setLikeCount(c => c + 1);
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 900);
    } else {
      setLikeCount(c => c - 1);
    }
    setLiked(l => !l);
  };

  const handleDoubleTap = () => {
    if (!liked) {
      handleLike();
    } else {
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 900);
    }
  };

  const accentColor = post.type === 'food' ? '#F97316' : '#A855F7';

  return (
    <div
      className="relative w-full snap-start overflow-hidden bg-black"
      style={{ height: 'calc(100dvh - 80px)' }}
      onDoubleClick={handleDoubleTap}
    >
      {/* Media background */}
      <img
        src={post.mediaUrl}
        alt={post.content}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent via-40% to-black/85" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />

      {/* Double-tap heart burst */}
      <AnimatePresence>
        {showHeart && (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 1.6, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
          >
            <Heart size={96} className="text-pink-500 fill-pink-500 drop-shadow-[0_0_20px_rgba(236,72,153,0.8)]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar: user + category tag */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-white/20">
            <img src={post.userAvatar} alt={post.userName} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-white text-sm font-bold drop-shadow">@{post.userName}</p>
          </div>
          <button className="flex items-center gap-1 px-2.5 py-1 rounded-full glass-dark text-[10px] font-bold text-white/80 border border-white/10">
            <UserPlus size={10} />
            Follow
          </button>
        </div>

        <span
          className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border"
          style={{
            color: accentColor,
            borderColor: accentColor + '40',
            background: accentColor + '18'
          }}
        >
          {post.type === 'food' ? '🍜 Food' : '👗 Fashion'}
        </span>
      </div>

      {/* Side action bar */}
      <div className="absolute right-3 bottom-28 z-20 flex flex-col items-center gap-5">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div className="relative w-11 h-11 rounded-full overflow-hidden ring-2"
            style={{ ringColor: accentColor }}>
            <img src={post.userAvatar} alt={post.userName} className="w-full h-full object-cover" />
            <div
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${accentColor}, #EC4899)` }}
            >
              <span className="text-white text-[8px] font-black">+</span>
            </div>
          </div>
        </div>

        {/* Like */}
        <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
          <motion.div
            whileTap={{ scale: 0.8 }}
            className={cn(
              "w-11 h-11 rounded-2xl flex items-center justify-center transition-all",
              liked ? "bg-pink-500/20" : "glass-dark"
            )}
          >
            <Heart
              size={22}
              className={cn("transition-colors", liked ? "text-pink-500 fill-pink-500" : "text-white")}
            />
          </motion.div>
          <span className="text-white text-[11px] font-bold tabular-nums">{formatCount(likeCount)}</span>
        </button>

        {/* Comment */}
        <button className="flex flex-col items-center gap-1 group">
          <div className="w-11 h-11 rounded-2xl glass-dark flex items-center justify-center group-hover:bg-white/10 transition-all">
            <MessageCircle size={22} className="text-white" />
          </div>
          <span className="text-white text-[11px] font-bold">{formatCount(post.comments)}</span>
        </button>

        {/* Save */}
        <button onClick={() => setSaved(s => !s)} className="flex flex-col items-center gap-1 group">
          <motion.div
            whileTap={{ scale: 0.8 }}
            className={cn(
              "w-11 h-11 rounded-2xl flex items-center justify-center transition-all",
              saved ? "bg-yellow-500/20" : "glass-dark"
            )}
          >
            <Bookmark
              size={22}
              className={cn("transition-colors", saved ? "text-yellow-400 fill-yellow-400" : "text-white")}
            />
          </motion.div>
          <span className="text-white text-[11px] font-bold">Save</span>
        </button>

        {/* Share */}
        <button className="flex flex-col items-center gap-1 group">
          <div className="w-11 h-11 rounded-2xl glass-dark flex items-center justify-center group-hover:bg-white/10 transition-all">
            <Share2 size={22} className="text-white" />
          </div>
          <span className="text-white text-[11px] font-bold">Share</span>
        </button>

        {/* Vinyl disc */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-white/20 flex items-center justify-center overflow-hidden"
        >
          <div className="w-3 h-3 rounded-full bg-zinc-600" />
        </motion.div>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-4 left-4 right-[72px] z-20 space-y-3">
        {/* Caption */}
        <p className="text-white text-sm font-medium leading-snug line-clamp-2 drop-shadow">
          {post.content}
        </p>

        {/* Music ticker */}
        <div className="flex items-center gap-2">
          <Music2 size={12} className="text-white/60 shrink-0" />
          <p className="text-white/60 text-[11px] truncate">{music}</p>
        </div>

        {/* Product card */}
        {post.product && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="glass-strong rounded-2xl p-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                <img src={post.mediaUrl} alt={post.product.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-white text-xs font-bold truncate max-w-[120px]">{post.product.name}</p>
                <p className="font-black text-sm" style={{ color: accentColor }}>
                  ₹{(post.product.price * 83).toFixed(0)}
                </p>
              </div>
            </div>
            <button
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black text-black transition-all hover:scale-105 active:scale-95"
              style={{ background: `linear-gradient(135deg, ${accentColor}, #EC4899)` }}
            >
              <ShoppingCart size={13} />
              Buy
            </button>
          </motion.div>
        )}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 z-30">
        <motion.div
          className="h-full"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 15, ease: "linear" }}
          style={{ background: `linear-gradient(90deg, ${accentColor}, #EC4899)` }}
        />
      </div>
    </div>
  );
}
