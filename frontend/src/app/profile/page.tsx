"use client";

import { motion } from 'framer-motion';
import {
  Settings,
  Award,
  Share2,
  Clock,
  ChevronRight,
  Gift,
  Star,
  Package
} from 'lucide-react';
import Image from 'next/image';

const RECENT_ACTIVITY = [
  { id: 1, type: 'purchase', title: 'Ordered Spicy Ramen', points: '+20', date: '2 hours ago' },
  { id: 2, type: 'referral', title: 'Friend joined: @marcus_v', points: '+100', date: 'Yesterday' },
  { id: 3, type: 'post', title: 'Shared an outfit in StreetVibe', points: '+10', date: '2 days ago' },
];

export default function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center mt-8 mb-10">
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl border-2 border-purple-500 p-1 mb-4">
            <div className="w-full h-full rounded-2xl bg-zinc-800 overflow-hidden relative">
              <Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Profile" fill />
            </div>
          </div>
          <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center text-white">
            <Settings size={16} />
          </button>
        </div>
        <h1 className="text-2xl font-bold">Alex Thompson</h1>
        <p className="text-gray-400 text-sm">@alex_cooks • Creator Tribe Member</p>
      </div>

      {/* Rewards Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-[32px] p-8 mb-8 relative overflow-hidden"
      >
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Your Balance</p>
            <h2 className="text-4xl font-black text-white flex items-center gap-2">
              1,450 <span className="text-purple-400 text-lg font-bold">PTS</span>
            </h2>
          </div>
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center">
            <Award size={32} className="text-purple-400" />
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button className="flex-1 bg-white text-black font-bold py-3 rounded-2xl text-sm flex items-center justify-center gap-2">
            <Gift size={16} />
            Redeem
          </button>
          <button className="flex-1 bg-white/5 border border-white/10 text-white font-bold py-3 rounded-2xl text-sm flex items-center justify-center gap-2">
            <Share2 size={16} />
            Invite
          </button>
        </div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-500/10 blur-3xl rounded-full" />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-3xl text-center">
          <p className="text-xl font-bold">12</p>
          <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Orders</p>
        </div>
        <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-3xl text-center">
          <p className="text-xl font-bold">5</p>
          <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Tribes</p>
        </div>
        <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-3xl text-center">
          <p className="text-xl font-bold">850</p>
          <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Following</p>
        </div>
      </div>

      {/* Referral Program */}
      <div className="bg-purple-600/10 border border-purple-500/20 rounded-3xl p-6 mb-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400">
            <Star size={24} />
          </div>
          <div>
            <h3 className="font-bold">Refer & Earn</h3>
            <p className="text-xs text-gray-400">Get 500 pts for every friend</p>
          </div>
        </div>
        <div className="bg-black/40 px-4 py-2 rounded-xl border border-white/10 font-mono text-sm font-bold text-purple-400">
          ALEX500
        </div>
      </div>

      {/* Activity / Tabs */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">Activity</h3>
          <button className="text-gray-500 text-sm font-bold flex items-center gap-1">
            History <Clock size={14} />
          </button>
        </div>

        <div className="space-y-3">
          {RECENT_ACTIVITY.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-zinc-900/30 rounded-2xl border border-white/5 hover:border-white/10 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
                  {item.type === 'purchase' ? <Package size={18} /> : <Share2 size={18} />}
                </div>
                <div>
                  <p className="text-sm font-bold">{item.title}</p>
                  <p className="text-[10px] text-gray-500 font-bold">{item.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-green-400">{item.points}</p>
                <ChevronRight size={14} className="text-gray-600 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
