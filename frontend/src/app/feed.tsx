"use client";

import { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Search, Settings } from 'lucide-react';
import { usePost } from '@/hooks/useApi';
import { AppContext } from '@/store/AppContext';

interface FeedPost {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    isVerified?: boolean;
  };
  content: string;
  images?: string[];
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  liked?: boolean;
  bookmarked?: boolean;
}

export default function FeedPage() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const { getFeed } = usePost();
  const { user } = useContext(AppContext);

  useEffect(() => {
    loadFeed();
  }, [filter]);

  const loadFeed = async () => {
    setLoading(true);
    try {
      const res = await getFeed({ filter, limit: 20 });
      if (res?.success) {
        setPosts(res.data);
      }
    } catch (err) {
      console.error('Error loading feed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? {
          ...post,
          liked: !post.liked,
          likes: post.liked ? post.likes - 1 : post.likes + 1
        }
        : post
    ));
  };

  const handleBookmark = (postId: string) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, bookmarked: !post.bookmarked }
        : post
    ));
  };

  const filteredPosts = posts.filter(post =>
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ background: "var(--color-bg)" }} className="min-h-dvh">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-black/40 border-b border-white/[0.08]">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-black text-white">Feed</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadFeed()}
                className="p-2 rounded-lg hover:bg-white/[0.05] transition-all text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-full pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/60 transition-all"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'following', 'trending'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2.5 rounded-full font-semibold text-sm transition-all capitalize ${
                    filter === f
                      ? 'bg-gradient-brand text-white'
                      : 'bg-white/[0.04] border border-white/[0.08] text-white hover:bg-white/[0.08]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-3 border-white/20 border-t-violet-500 rounded-full"
            />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-400 text-lg">No posts yet</p>
          </div>
        ) : (
          filteredPosts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.1]"
            >
              <div className="flex gap-3 mb-4">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{post.author.name}</h3>
                  <p className="text-xs text-zinc-500">{post.timestamp}</p>
                </div>
              </div>

              <p className="text-white mb-4">{post.content}</p>

              {post.images && (
                <div className="mb-4 grid grid-cols-2 gap-2">
                  {post.images.slice(0, 4).map((img, i) => (
                    <img key={i} src={img} alt="" className="w-full aspect-square rounded-lg object-cover" />
                  ))}
                </div>
              )}

              <div className="flex gap-4 py-3 text-sm text-zinc-400 mb-3">
                <span>{post.likes} Likes</span>
                <span>{post.comments} Comments</span>
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleLike(post.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold ${
                    post.liked
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-white/[0.04] text-white hover:bg-white/[0.08]'
                  }`}
                >
                  <Heart size={16} fill={post.liked ? "currentColor" : "none"} />
                  Like
                </motion.button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/[0.04] text-white hover:bg-white/[0.08] text-sm font-semibold">
                  <MessageCircle size={16} />
                  Comment
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/[0.04] text-white hover:bg-white/[0.08] text-sm font-semibold">
                  <Share2 size={16} />
                  Share
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
