"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, Plus, MoreVertical, Hash, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

const MOCK_MESSAGES: Message[] = [
  { id: '1', sender: 'hypebeast_99', avatar: 'https://i.pravatar.cc/40?u=hype99', text: "Did anyone catch the drop this morning? 👀", timestamp: '10:05 AM', isMe: false },
  { id: '2', sender: 'marcus_v', avatar: 'https://i.pravatar.cc/40?u=marcusv', text: "Yeah, managed to cop the hoodie! Quality is 🔥🔥", timestamp: '10:07 AM', isMe: false },
  { id: '3', sender: 'You', avatar: 'https://i.pravatar.cc/40?u=alex', text: "Lucky! I missed out by seconds. 😭", timestamp: '10:08 AM', isMe: true },
  { id: '4', sender: 'street_queen', avatar: 'https://i.pravatar.cc/40?u=streetq', text: "Same, was literally in cart 😤 hoping for a restock", timestamp: '10:09 AM', isMe: false },
];

export default function CommunityChat({ communityName }: { communityName: string }) {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'You',
      avatar: 'https://i.pravatar.cc/40?u=alex',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
  };

  return (
    <div
      className="flex flex-col h-[600px] rounded-3xl overflow-hidden border border-white/[0.07]"
      style={{ background: "var(--color-surface)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]"
        style={{ background: "var(--color-card)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center font-black text-white text-sm shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            {communityName[0]}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <Hash size={13} className="text-zinc-500" />
              <h3 className="font-bold text-sm text-white">{communityName}</h3>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-[10px] text-zinc-400 font-semibold">42 online</span>
            </div>
          </div>
        </div>
        <button className="w-8 h-8 rounded-xl text-zinc-500 hover:text-white hover:bg-white/[0.06] flex items-center justify-center transition-all">
          <MoreVertical size={16} />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-none"
        style={{ background: "var(--color-bg)" }}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => {
            const prevMsg = messages[idx - 1];
            const isGrouped = prevMsg && prevMsg.sender === msg.sender && !msg.isMe;

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "flex items-end gap-2.5",
                  msg.isMe ? "flex-row-reverse" : "flex-row",
                  isGrouped ? "mt-0.5" : "mt-4"
                )}
              >
                {/* Avatar */}
                {!msg.isMe && (
                  <div className={cn("w-7 h-7 rounded-lg overflow-hidden shrink-0 transition-opacity", isGrouped && "opacity-0")}>
                    <img src={msg.avatar} alt={msg.sender} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Bubble */}
                <div className={cn("max-w-[72%] group", msg.isMe ? "items-end" : "items-start", "flex flex-col")}>
                  {!msg.isMe && !isGrouped && (
                    <span className="text-[10px] font-bold text-zinc-500 ml-1 mb-1">{msg.sender}</span>
                  )}
                  <div
                    className={cn(
                      "px-4 py-2.5 rounded-2xl text-sm relative",
                      msg.isMe
                        ? "bg-gradient-brand text-white rounded-br-sm"
                        : "bg-white/[0.07] border border-white/[0.06] text-zinc-200 rounded-bl-sm"
                    )}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-zinc-600 font-medium mt-1 mx-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {msg.timestamp}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Input bar */}
      <div className="px-4 py-3 border-t border-white/[0.06]" style={{ background: "var(--color-card)" }}>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-xl text-zinc-500 hover:text-violet-400 hover:bg-violet-500/10 flex items-center justify-center transition-all">
            <Plus size={18} />
          </button>

          <div className="flex-1 flex items-center bg-white/[0.05] border border-white/[0.08] rounded-2xl px-4 gap-2 focus-within:border-violet-500/50 focus-within:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={`Message #${communityName.toLowerCase().replace(/\s/g, '-')}…`}
              className="flex-1 bg-transparent py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none"
            />
            <button className="text-zinc-500 hover:text-violet-400 transition-colors shrink-0">
              <Smile size={18} />
            </button>
          </div>

          <button className="w-8 h-8 rounded-xl text-zinc-500 hover:text-violet-400 hover:bg-violet-500/10 flex items-center justify-center transition-all">
            <Mic size={16} />
          </button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center disabled:opacity-40 transition-opacity shadow-[0_0_15px_rgba(139,92,246,0.3)]"
          >
            <Send size={15} className="text-white" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
