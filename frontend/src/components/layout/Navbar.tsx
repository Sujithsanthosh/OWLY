"use client";

import Link from 'next/link';
import { Home, Search, ShoppingBag, Users, User, Bell, Zap } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navItems = [
  { icon: Home, label: 'Feed', href: '/' },
  { icon: Search, label: 'Explore', href: '/explore' },
  { icon: ShoppingBag, label: 'Shop', href: '/shop' },
  { icon: Users, label: 'Tribes', href: '/communities' },
  { icon: User, label: 'Profile', href: '/profile' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <>
      {/* ── Mobile bottom bar ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="glass-dark border-t border-white/[0.06] px-2 py-2 flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors group"
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-indicator"
                    className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-600/20 to-pink-600/20"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon
                  size={22}
                  className={cn(
                    "relative transition-colors",
                    isActive ? "text-violet-400" : "text-zinc-500 group-hover:text-zinc-300"
                  )}
                />
                <span className={cn(
                  "relative text-[9px] font-bold tracking-wide transition-colors",
                  isActive ? "text-violet-400" : "text-zinc-600 group-hover:text-zinc-400"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── Desktop left sidebar ── */}
      <nav className="hidden md:flex fixed left-0 top-0 h-screen w-[72px] z-50 flex-col items-center py-6 gap-2 border-r border-white/[0.05]"
        style={{ background: "var(--color-surface)" }}>

        {/* Logo */}
        <Link href="/" className="mb-6 relative group">
          <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all group-hover:shadow-[0_0_30px_rgba(139,92,246,0.6)]">
            <Zap size={20} className="text-white" fill="white" />
          </div>
        </Link>

        {/* Nav items */}
        <div className="flex flex-col items-center gap-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative w-10 h-10 flex items-center justify-center rounded-xl transition-all group",
                  isActive
                    ? "bg-gradient-to-br from-violet-600/25 to-pink-600/20 text-violet-400"
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06]"
                )}
                title={item.label}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-gradient-to-b from-violet-400 to-pink-500" />
                )}
                <Icon size={20} />
              </Link>
            );
          })}
        </div>

        {/* Bottom: notifications */}
        <div className="flex flex-col items-center gap-3 mt-auto">
          <Link href="/live" className="relative w-10 h-10 flex items-center justify-center rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Live">
            <span className="absolute top-1.5 right-1.5 w-2 h-2">
              <span className="live-dot block w-full h-full" />
            </span>
            <Zap size={18} />
          </Link>
          <button className="relative w-10 h-10 flex items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-all" title="Notifications">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-pink-500 rounded-full" />
          </button>
        </div>
      </nav>
    </>
  );
}
