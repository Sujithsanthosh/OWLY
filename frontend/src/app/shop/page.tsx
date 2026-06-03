"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, ShoppingBag, Utensils, Zap, Star, Fire } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { id: 'all', name: 'All', emoji: '✨' },
  { id: 'fashion', name: 'Fashion', emoji: '👗' },
  { id: 'food', name: 'Food', emoji: '🍜' },
  { id: 'drops', name: 'Drops', emoji: '🔥' },
];

const PRODUCTS = [
  {
    id: 1,
    name: "Urban Oversized Hoodie",
    brand: "StreetVibe",
    brandAvatar: "https://i.pravatar.cc/32?u=streetvibe",
    price: 65.00,
    originalPrice: 85.00,
    rating: 4.8,
    reviews: 320,
    category: 'fashion',
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&q=80",
    badge: 'New Drop',
    badgeColor: '#A855F7',
  },
  {
    id: 2,
    name: "Signature Truffle Burger",
    brand: "Gourmet Lab",
    brandAvatar: "https://i.pravatar.cc/32?u=gourmetlab",
    price: 22.50,
    originalPrice: null,
    rating: 4.9,
    reviews: 860,
    category: 'food',
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
    badge: 'Top Rated',
    badgeColor: '#F97316',
  },
  {
    id: 3,
    name: "Linen Summer Set",
    brand: "EcoWear",
    brandAvatar: "https://i.pravatar.cc/32?u=ecowear",
    price: 110.00,
    originalPrice: 140.00,
    rating: 4.7,
    reviews: 210,
    category: 'fashion',
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80",
    badge: 'Sale',
    badgeColor: '#EC4899',
  },
  {
    id: 4,
    name: "Artisanal Sourdough",
    brand: "The Crusty Loaf",
    brandAvatar: "https://i.pravatar.cc/32?u=crustyloaf",
    price: 12.00,
    originalPrice: null,
    rating: 5.0,
    reviews: 430,
    category: 'food',
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80",
    badge: null,
    badgeColor: null,
  },
  {
    id: 5,
    name: "Owly StreetVibe V1",
    brand: "Owly Collab",
    brandAvatar: "https://i.pravatar.cc/32?u=owlycollab",
    price: 120.00,
    originalPrice: null,
    rating: 4.9,
    reviews: 88,
    category: 'drops',
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400&q=80",
    badge: 'Limited',
    badgeColor: '#EAB308',
  },
  {
    id: 6,
    name: "Spicy Tonkotsu Ramen",
    brand: "Momotaro Kitchen",
    brandAvatar: "https://i.pravatar.cc/32?u=momotaro",
    price: 18.50,
    originalPrice: null,
    rating: 4.8,
    reviews: 670,
    category: 'food',
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80",
    badge: 'Trending',
    badgeColor: '#F97316',
  },
];

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [query, setQuery] = useState('');

  const filtered = PRODUCTS.filter(p => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const matchQ = !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.brand.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gradient">Marketplace</h1>
        <p className="text-zinc-400 text-sm mt-0.5">Curated drops from your favorite tribes</p>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-2.5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search products, brands, food…"
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl pl-10 pr-4 py-3.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all"
          />
        </div>
        <button className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.07] transition-all">
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {/* Live Drop Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative p-4 rounded-3xl overflow-hidden cursor-pointer"
        style={{ background: "linear-gradient(135deg, #4C1D95, #831843)" }}
      >
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Zap size={22} className="text-white" fill="white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/80 rounded-full text-[9px] font-black uppercase text-white">
                  <span className="live-dot w-1.5 h-1.5" />
                  LIVE
                </span>
                <span className="text-white/60 text-[11px]">4.2k watching</span>
              </div>
              <h3 className="text-white font-black text-base">Supreme × Owly Flash Drop</h3>
            </div>
          </div>
          <button className="px-4 py-2.5 rounded-2xl bg-white text-black text-xs font-black hover:bg-violet-400 hover:text-white transition-all">
            Join Live →
          </button>
        </div>
        {/* Decorative glow blobs */}
        <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-pink-500/20 blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-16 w-24 h-24 rounded-full bg-violet-500/20 blur-2xl translate-y-1/2" />
      </motion.div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold border whitespace-nowrap transition-all",
              activeCategory === cat.id
                ? "bg-gradient-brand text-white border-transparent shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                : "bg-white/[0.04] border-white/[0.07] text-zinc-400 hover:text-white hover:border-white/[0.14]"
            )}
          >
            <span>{cat.emoji}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {filtered.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group cursor-pointer"
          >
            {/* Image */}
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden"
              style={{ background: "var(--color-card)" }}>
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                style={{ '--scale-hover': '1.08' } as React.CSSProperties}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Badge */}
              {product.badge && (
                <div
                  className="absolute top-2.5 left-2.5 text-[9px] font-black uppercase px-2 py-1 rounded-lg"
                  style={{ background: `${product.badgeColor}30`, color: product.badgeColor, border: `1px solid ${product.badgeColor}40` }}
                >
                  {product.badge}
                </div>
              )}

              {/* Quick add button */}
              <button className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-xl glass-strong flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-black">
                <ShoppingBag size={16} />
              </button>
            </div>

            {/* Info */}
            <div className="mt-2.5 px-0.5 space-y-1">
              {/* Brand */}
              <div className="flex items-center gap-1.5">
                <img src={product.brandAvatar} alt={product.brand} className="w-4 h-4 rounded-full" />
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">{product.brand}</span>
              </div>

              <h3 className="text-sm font-bold text-white truncate">{product.name}</h3>

              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-black text-sm" style={{ color: product.category === 'food' ? '#F97316' : '#A855F7' }}>
                    ₹{(product.price * 83).toFixed(0)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-[10px] text-zinc-600 line-through">₹{(product.originalPrice * 83).toFixed(0)}</span>
                  )}
                </div>
                <div className="flex items-center gap-0.5">
                  <Star size={10} className="fill-yellow-400 text-yellow-400" />
                  <span className="text-[10px] text-zinc-400 font-bold">{product.rating}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
