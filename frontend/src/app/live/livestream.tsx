"use client";

import { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  Send,
  Users,
  Eye,
  Gift,
  Package,
  Share2,
  Play,
  Volume2,
  VolumeX,
  Maximize2
} from 'lucide-react';
import { useLivestream } from '@/hooks/useApi';
import { AppContext } from '@/store/AppContext';

interface LivestreamSession {
  id: string;
  title: string;
  creator: {
    id: string;
    name: string;
    avatar: string;
    isVerified: boolean;
  };
  viewers: number;
  startedAt: string;
  products: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
  }>;
  comments: Array<{
    id: string;
    author: string;
    avatar: string;
    message: string;
    timestamp: string;
  }>;
}

export default function LivestreamPage() {
  const [livestreams, setLivestreams] = useState<LivestreamSession[]>([]);
  const [selectedStream, setSelectedStream] = useState<LivestreamSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [muted, setMuted] = useState(false);
  const [viewers, setViewers] = useState(1240);

  const { getLivestreams, sendLiveComment } = useLivestream?.() || {};
  const { user } = useContext(AppContext);

  useEffect(() => {
    loadLivestreams();
  }, []);

  const loadLivestreams = async () => {
    setLoading(true);
    try {
      if (getLivestreams) {
        const res = await getLivestreams();
        if (res?.success) {
          setLivestreams(res.data);
          if (res.data.length > 0) {
            setSelectedStream(res.data[0]);
          }
        }
      }
    } catch (err) {
      console.error('Error loading livestreams:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim() || !selectedStream) return;

    const comment = {
      id: Date.now().toString(),
      author: user?.name || 'Anonymous',
      avatar: user?.avatar || 'https://i.pravatar.cc/32',
      message: newComment,
      timestamp: 'now'
    };

    setSelectedStream({
      ...selectedStream,
      comments: [comment, ...selectedStream.comments]
    });
    setNewComment('');

    if (sendLiveComment) {
      await sendLiveComment(selectedStream.id, newComment);
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: "var(--color-bg)" }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-white/20 border-t-violet-500 rounded-full"
        />
      </div>
    );
  }

  return (
    <div style={{ background: "var(--color-bg)" }} className="min-h-dvh pb-10">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-black/40 border-b border-white/[0.08] px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-black text-white">🎥 Live Shopping</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
              <span className="text-white text-sm font-semibold">{livestreams.length} Live</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Livestream */}
          <div className="lg:col-span-2">
            {selectedStream ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {/* Video Container */}
                <div className="relative w-full aspect-video rounded-2xl bg-gradient-brand/10 border border-white/[0.1] overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center bg-black/20">
                    <Play size={64} className="text-white/40" />
                  </div>

                  {/* Live Badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/50">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-red-400 text-xs font-bold">LIVE</span>
                  </div>

                  {/* Viewer Count */}
                  <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.1] border border-white/[0.2]">
                    <Eye size={14} className="text-white" />
                    <span className="text-white text-xs font-semibold">{viewers.toLocaleString()} watching</span>
                  </div>

                  {/* Stream Controls */}
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <button
                      onClick={() => setMuted(!muted)}
                      className="p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-all"
                    >
                      {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                    <button className="p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-all">
                      <Maximize2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Creator Info */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.1]">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedStream.creator.avatar}
                      alt={selectedStream.creator.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-bold">{selectedStream.creator.name}</h3>
                        {selectedStream.creator.isVerified && (
                          <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400">{selectedStream.startedAt}</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-gradient-brand text-white font-semibold hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all">
                    Follow
                  </button>
                </div>

                {/* Pinned Products */}
                {selectedStream.products.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-white font-bold flex items-center gap-2">
                      <Package size={18} />
                      Featured Products
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedStream.products.map((product) => (
                        <motion.div
                          key={product.id}
                          whileHover={{ y: -4 }}
                          className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.1] hover:bg-white/[0.04] transition-all cursor-pointer"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full aspect-square rounded-lg mb-2 object-cover"
                          />
                          <p className="text-white text-sm font-semibold line-clamp-2">{product.name}</p>
                          <p className="text-violet-400 font-bold mt-1">${product.price}</p>
                          <button className="w-full mt-2 py-2 rounded-lg bg-gradient-brand text-white text-xs font-bold hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all">
                            Buy Now
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-96 rounded-2xl bg-white/[0.02] border border-white/[0.1]">
                <p className="text-zinc-400">No livestream selected</p>
              </div>
            )}
          </div>

          {/* Sidebar: Comments & Live List */}
          <div className="space-y-4">
            {/* Active Livestreams */}
            <div className="space-y-3">
              <h3 className="text-white font-bold">Now Streaming</h3>
              <div className="space-y-2">
                {livestreams.map((stream) => (
                  <motion.button
                    key={stream.id}
                    onClick={() => setSelectedStream(stream)}
                    whileHover={{ scale: 1.02 }}
                    className={`w-full text-left p-3 rounded-lg transition-all border ${
                      selectedStream?.id === stream.id
                        ? 'bg-gradient-brand/20 border-violet-500/50'
                        : 'bg-white/[0.02] border-white/[0.1] hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <p className="text-white text-sm font-semibold line-clamp-1">{stream.creator.name}</p>
                    </div>
                    <p className="text-xs text-zinc-400">{stream.viewers.toLocaleString()} watching</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Live Chat */}
            {selectedStream && (
              <div className="flex flex-col h-96 rounded-2xl bg-white/[0.02] border border-white/[0.1] overflow-hidden">
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {selectedStream.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2">
                      <img
                        src={comment.avatar}
                        alt={comment.author}
                        className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white">{comment.author}</p>
                        <p className="text-xs text-zinc-300 break-words">{comment.message}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Comment Input */}
                <div className="border-t border-white/[0.1] p-3 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Say something..."
                      className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/60"
                    />
                    <button
                      onClick={handleSendComment}
                      className="px-3 py-2 rounded-lg bg-gradient-brand text-white hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all"
                    >
                      <Send size={14} />
                    </button>
                  </div>

                  {/* Gift Button */}
                  <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-white/[0.1] text-white hover:bg-white/[0.05] transition-all text-xs font-semibold">
                    <Gift size={14} />
                    Send Gift (₹50+)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
