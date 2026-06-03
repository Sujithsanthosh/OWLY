"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Lock, Plus, TrendingUp, Flame, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = ['All', 'Fashion', 'Food', 'Local', 'Creators'];

const COMMUNITIES = [
  {
    id: 1,
    name: "Sneaker Heads NYC",
    description: "Exclusive drops, trading, and legit checks for the culture.",
    members: "12.5k",
    type: "Fashion",
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&q=80",
    isPrivate: false,
    isHot: true,
    accentColor: "#A855F7",
  },
  {
    id: 2,
    name: "Cloud Kitchen Collective",
    description: "Hidden gems and home-run kitchens across the city.",
    members: "8.2k",
    type: "Food",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&q=80",
    isPrivate: false,
    isHot: false,
    accentColor: "#F97316",
  },
  {
    id: 3,
    name: "Streetwear Thrifters",
    description: "Curated vintage finds and sustainable fashion trades.",
    members: "5.1k",
    type: "Fashion",
    image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=80",
    isPrivate: true,
    isHot: false,
    accentColor: "#8B5CF6",
  },
  {
    id: 4,
    name: "Ramen Seekers",
    description: "Hunting for the perfect bowl across every borough.",
    members: "15.9k",
    type: "Food",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80",
    isPrivate: false,
    isHot: true,
    accentColor: "#F97316",
  },
  {
    id: 5,
    name: "College Fashion Drops",
    description: "Campus exclusive fashion, student creator collabs & drops.",
    members: "3.7k",
    type: "Fashion",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80",
    isPrivate: false,
    isHot: false,
    accentColor: "#EC4899",
  },
  {
    id: 6,
    name: "Local Bakeries Hub",
    description: "Support artisan bakers. Discover sourdoughs, croissants and more.",
    members: "6.4k",
    type: "Food",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80",
    isPrivate: false,
    isHot: false,
    accentColor: "#EAB308",
  },
];

const TRENDING = [
  { rank: 1, text: "Should I cop the new Yeezy slides or wait for the next drop?", replies: 87 },
  { rank: 2, text: "Best cloud kitchen under ₹200 in Bangalore — thread 🧵", replies: 64 },
  { rank: 3, text: "Outfit check: can I wear oversized blazer with track pants?", replies: 52 },
];

export default function CommunitiesPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = COMMUNITIES.filter(c => {
    const matchCat = activeCategory === 'All' || c.type === activeCategory;
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = COMMUNITIES[0];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gradient">Tribes</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Join communities that match your vibe</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-brand text-white text-sm font-bold shadow-[0_0_20px_rgba(139,92,246,0.35)]"
        >
          <Plus size={15} />
          Create
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search tribes…"
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all"
        />
      </div>

      {/* Featured community (hero) */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-52 rounded-3xl overflow-hidden cursor-pointer group"
      >
        <img src={featured.image} alt={featured.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-5 left-5 right-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase text-white tracking-wider"
              style={{ background: `${featured.accentColor}30`, border: `1px solid ${featured.accentColor}50`, color: featured.accentColor }}>
              🔥 Featured
            </span>
            {featured.isHot && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase text-orange-400 bg-orange-400/15 border border-orange-400/30">
                <Flame size={10} className="inline mr-0.5" />Hot
              </span>
            )}
          </div>
          <h2 className="text-white text-xl font-black">{featured.name}</h2>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1.5 text-zinc-300 text-xs">
              <Users size={12} />
              <span>{featured.members} members</span>
            </div>
            <button
              className="px-4 py-1.5 rounded-xl text-xs font-black text-white transition-all hover:scale-105"
              style={{ background: `linear-gradient(135deg, ${featured.accentColor}, #EC4899)` }}
            >
              Join
            </button>
          </div>
        </div>
      </motion.div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold border transition-all",
              activeCategory === cat
                ? "bg-gradient-brand text-white border-transparent shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                : "bg-white/[0.04] border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/[0.15]"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Community grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((community, index) => (
          <motion.div
            key={community.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="group relative rounded-3xl overflow-hidden border border-white/[0.07] cursor-pointer hover:border-white/[0.14] transition-all hover:-translate-y-0.5"
            style={{ background: "var(--color-card)" }}
          >
            <div className="aspect-video relative overflow-hidden">
              <img
                src={community.image}
                alt={community.name}
                className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--color-card)]" />
              {/* Badges */}
              <div className="absolute top-3 left-3 flex gap-1.5">
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-lg backdrop-blur-sm text-white"
                  style={{ background: `${community.accentColor}40`, border: `1px solid ${community.accentColor}50` }}>
                  {community.type}
                </span>
                {community.isPrivate && (
                  <span className="px-1.5 py-0.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10">
                    <Lock size={9} className="text-zinc-300" />
                  </span>
                )}
                {community.isHot && (
                  <span className="px-1.5 py-0.5 rounded-lg text-[9px] font-black text-orange-400 bg-orange-400/20 border border-orange-400/30">
                    🔥
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 pt-2">
              <h3 className="font-bold text-sm text-white group-hover:text-violet-300 transition-colors truncate">{community.name}</h3>
              <p className="text-zinc-500 text-xs mt-1 line-clamp-1">{community.description}</p>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                  <Users size={12} />
                  <span>{community.members}</span>
                </div>
                <button
                  className="text-xs font-bold px-3 py-1.5 rounded-xl transition-all hover:scale-105"
                  style={{ background: `${community.accentColor}20`, color: community.accentColor, border: `1px solid ${community.accentColor}30` }}
                >
                  Join
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Trending discussions */}
      <div
        className="rounded-3xl p-5 border border-violet-500/20"
        style={{ background: "linear-gradient(135deg, rgba(109,40,217,0.12), rgba(236,72,153,0.08))" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-black text-base flex items-center gap-2">
            <TrendingUp size={18} className="text-pink-400" />
            Trending Discussions
          </h2>
          <button className="text-xs text-violet-400 font-bold flex items-center gap-1 hover:text-violet-300">
            See all <ChevronRight size={13} />
          </button>
        </div>
        <div className="space-y-3">
          {TRENDING.map((item) => (
            <div key={item.rank}
              className="flex items-start gap-4 p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.06] cursor-pointer hover:border-white/[0.12] transition-all group">
              <div className="w-8 h-8 rounded-xl bg-white/[0.06] flex items-center justify-center font-black text-sm text-zinc-500 group-hover:text-violet-400 shrink-0 transition-colors">
                #{item.rank}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">{item.text}</p>
                <p className="text-[10px] text-zinc-500 font-semibold mt-1">{item.replies} replies</p>
              </div>
              <ChevronRight size={14} className="text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0 mt-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
