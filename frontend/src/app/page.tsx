"use client";

import { useState } from 'react';
import FeedItem from "@/components/feed/FeedItem";
import { motion } from 'framer-motion';
import { Bell, Search } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const FEED_TABS = ['For You', 'Following', 'Nearby', 'Trending'];

const STORIES = [
  { id: 1, name: 'sarah_v', avatar: 'https://i.pravatar.cc/56?u=sarah', hasNew: true },
  { id: 2, name: 'sneakerhead', avatar: 'https://i.pravatar.cc/56?u=snkr', hasNew: true },
  { id: 3, name: 'ramen_king', avatar: 'https://i.pravatar.cc/56?u=ramen', hasNew: false },
  { id: 4, name: 'style_mx', avatar: 'https://i.pravatar.cc/56?u=stylemx', hasNew: true },
  { id: 5, name: 'cloud_k', avatar: 'https://i.pravatar.cc/56?u=cloudk', hasNew: false },
];

const MOCK_POSTS = [
  {
    id: 1,
    userName: "alex_cooks",
    userAvatar: "https://i.pravatar.cc/48?u=alex_cooks",
    content: "Just tried the new Spicy Ramen at Momotaro! The broth is incredible 🍜🔥 #foodie #ramen",
    mediaUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80",
    type: "food" as const,
    likes: 1240,
    comments: 85,
    product: { name: "Spicy Miso Ramen", price: 18.50 }
  },
  {
    id: 2,
    userName: "fashion_nova",
    userAvatar: "https://i.pravatar.cc/48?u=fashion_nova",
    content: "Summer collection is finally here! Love this sustainable linen set 🌿✨ #fashion #sustainable",
    mediaUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
    type: "fashion" as const,
    likes: 3500,
    comments: 120,
    product: { name: "Linen Co-ord Set", price: 89.00 }
  },
  {
    id: 3,
    userName: "sneaker_head",
    userAvatar: "https://i.pravatar.cc/48?u=sneaker_head",
    content: "Limited drop: Owly x StreetVibe sneakers. Cop them before they're gone! 👟🔥",
    mediaUrl: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&q=80",
    type: "fashion" as const,
    likes: 890,
    comments: 45,
    product: { name: "Owly StreetVibe V1", price: 120.00 }
  }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('For You');

  return (
    <div className="relative">
      {/* Mobile Top bar */}
      <div className="sticky top-0 z-40 md:hidden">
        <div className="glass-dark border-b border-white/[0.06] px-4 pt-3 pb-0">
          {/* App title + icons */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center shadow-[0_0_12px_rgba(139,92,246,0.5)]">
                <span className="text-white text-xs font-black">O</span>
              </div>
              <span className="font-black text-lg tracking-tight text-white">OWLY</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/explore" className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.06] flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                <Search size={18} />
              </Link>
              <button className="relative w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.06] flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-pink-500 rounded-full" />
              </button>
            </div>
          </div>

          {/* Feed tabs */}
          <div className="flex gap-5 overflow-x-auto scrollbar-none pb-0">
            {FEED_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "pb-3 text-sm font-bold whitespace-nowrap border-b-2 transition-all",
                  activeTab === tab
                    ? "text-white border-violet-500"
                    : "text-zinc-500 border-transparent hover:text-zinc-300"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stories row */}
      <div className="px-4 py-3 flex gap-3 overflow-x-auto scrollbar-none md:hidden border-b border-white/[0.05]"
        style={{ background: "var(--color-bg)" }}>
        {/* Add story */}
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.05] border-2 border-dashed border-white/20 flex items-center justify-center">
            <span className="text-2xl text-zinc-400">+</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-semibold">Your Story</span>
        </div>

        {STORIES.map(story => (
          <div key={story.id} className="flex flex-col items-center gap-1.5 shrink-0">
            <div className={cn(
              "w-14 h-14 rounded-2xl p-0.5",
              story.hasNew
                ? "bg-gradient-brand"
                : "bg-white/10"
            )}>
              <div className="w-full h-full rounded-xl overflow-hidden border-2 border-[var(--color-bg)]">
                <img src={story.avatar} alt={story.name} className="w-full h-full object-cover" />
              </div>
            </div>
            <span className="text-[10px] text-zinc-400 font-semibold truncate max-w-[56px]">{story.name}</span>
          </div>
        ))}
      </div>

      {/* Feed */}
      <div className="snap-feed md:max-w-md md:mx-auto md:mt-4">
        {MOCK_POSTS.map((post) => (
          <FeedItem key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
