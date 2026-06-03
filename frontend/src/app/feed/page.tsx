"use client";

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  Share2,
  Search,
  Filter,
  Star,
  Zap,
  Image as ImageIcon,
  Smile,
  Send,
  MoreVertical,
  X,
} from 'lucide-react';

interface Comment {
  id: number;
  author: string;
  avatar: string;
  content: string;
  date: string;
  likes: number;
}

interface Post {
  id: number;
  author: string;
  brand: string;
  avatar: string;
  image?: string;
  content: string;
  category: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  liked: boolean;
  commentsData: Comment[];
}

const INITIAL_POSTS: Post[] = [
  {
    id: 1,
    author: 'Alex Kumar',
    brand: 'StreetVibe',
    avatar: 'https://i.pravatar.cc/64?u=alexkumar',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80',
    content: 'Just dropped our new summer collection! 🔥 Available now with 20% off for the first 100 customers. Don\'t miss out!',
    category: 'Fashion',
    timestamp: '2 hours ago',
    likes: 324,
    comments: 18,
    shares: 42,
    liked: false,
    commentsData: [
      {
        id: 1,
        author: 'Sarah Chen',
        avatar: 'https://i.pravatar.cc/64?u=sarahchen',
        content: 'Love this! Already placed my order 💯',
        date: '1h ago',
        likes: 24,
      },
      {
        id: 2,
        author: 'Mike Johnson',
        avatar: 'https://i.pravatar.cc/64?u=mikej',
        content: 'Quality looks amazing',
        date: '1h ago',
        likes: 12,
      },
    ],
  },
  {
    id: 2,
    author: 'Gourmet Lab',
    brand: 'Food & Beverage',
    avatar: 'https://i.pravatar.cc/64?u=gourmetlab',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
    content: 'Our signature truffle burger is now available at 15 locations! 🍔 Fresh ingredients, made daily. Tag a friend who needs to try this!',
    category: 'Food',
    timestamp: '3 hours ago',
    likes: 512,
    comments: 42,
    shares: 89,
    liked: false,
    commentsData: [
      {
        id: 1,
        author: 'Emma Wilson',
        avatar: 'https://i.pravatar.cc/64?u=emmaw',
        content: 'This looks insane! Going there this weekend',
        date: '2h ago',
        likes: 38,
      },
    ],
  },
  {
    id: 3,
    author: 'EcoWear',
    brand: 'Sustainable Fashion',
    avatar: 'https://i.pravatar.cc/64?u=ecowear',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80',
    content: 'Sustainability is not just a trend, it\'s our responsibility. 🌿 Every piece of EcoWear is made from 100% recycled materials.',
    category: 'Fashion',
    timestamp: '4 hours ago',
    likes: 245,
    comments: 28,
    shares: 56,
    liked: false,
    commentsData: [],
  },
];

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [showComments, setShowComments] = useState<number | null>(null);
  const [newComment, setNewComment] = useState('');
  const [filteredCategory, setFilteredCategory] = useState('All');
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  const categories = ['All', 'Fashion', 'Food', 'Beauty', 'Trending'];

  const toggleLike = (postId: number) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const addComment = (postId: number) => {
    if (!newComment.trim()) return;

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              commentsData: [
                ...post.commentsData,
                {
                  id: post.commentsData.length + 1,
                  author: 'You',
                  avatar: 'https://i.pravatar.cc/64?u=you',
                  content: newComment,
                  date: 'now',
                  likes: 0,
                },
              ],
              comments: post.comments + 1,
            }
          : post
      )
    );
    setNewComment('');
  };

  const loadMorePosts = useCallback(() => {
    // Simulate loading more posts
    const newPosts = INITIAL_POSTS.map((post, idx) => ({
      ...post,
      id: post.id + 100 + idx,
    }));
    setPosts((prev) => [...prev, ...newPosts]);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-zinc-900/80 backdrop-blur-lg border-b border-white/[0.08]">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-black">Your Feed</h1>
            <button className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors border border-white/[0.08]">
              <Search size={20} />
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <motion.button
                key={cat}
                onClick={() => setFilteredCategory(cat)}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all ${
                  filteredCategory === cat
                    ? 'bg-violet-500 text-white'
                    : 'bg-white/[0.04] border border-white/[0.08] text-zinc-400 hover:bg-white/[0.07]'
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 pb-20">
        {/* Create Post Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 border border-white/[0.1] mb-6"
        >
          <div className="flex items-start gap-4">
            <img
              src="https://i.pravatar.cc/64?u=you"
              alt="Your avatar"
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1">
              <input
                type="text"
                placeholder="What's on your mind?"
                className="w-full bg-zinc-800/50 border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/60 mb-3"
              />
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors">
                    <ImageIcon size={18} className="text-zinc-400" />
                  </button>
                  <button className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors">
                    <Smile size={18} className="text-zinc-400" />
                  </button>
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-2 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg font-bold flex items-center gap-2"
                >
                  <Send size={16} />
                  Post
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass rounded-2xl border border-white/[0.1] overflow-hidden hover:border-white/[0.2] transition-all"
            >
              {/* Post Header */}
              <div className="p-6 border-b border-white/[0.08]">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.avatar}
                      alt={post.author}
                      className="w-12 h-12 rounded-full border-2 border-violet-500"
                    />
                    <div>
                      <p className="font-bold text-sm">{post.author}</p>
                      <p className="text-xs text-zinc-400">{post.brand}</p>
                      <p className="text-xs text-zinc-500">{post.timestamp}</p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </div>

                {/* Category Badge */}
                <div className="flex gap-2 mb-2">
                  <span className="text-xs bg-violet-500/20 text-violet-400 px-3 py-1 rounded-full font-bold">
                    {post.category}
                  </span>
                </div>

                {/* Post Content */}
                <p className="text-sm text-zinc-300 leading-relaxed">{post.content}</p>
              </div>

              {/* Post Image */}
              {post.image && (
                <div className="w-full h-96 overflow-hidden bg-zinc-800">
                  <img
                    src={post.image}
                    alt="Post"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              {/* Engagement Stats */}
              <div className="px-6 py-3 border-b border-white/[0.08] text-xs text-zinc-400 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span>❤️ {post.likes} likes</span>
                  <span>💬 {post.comments} comments</span>
                  <span>📤 {post.shares} shares</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-4 flex items-center justify-around border-b border-white/[0.08]">
                <motion.button
                  onClick={() => toggleLike(post.id)}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                    post.liked
                      ? 'bg-red-500/20 text-red-400'
                      : 'text-zinc-400 hover:bg-white/[0.05]'
                  }`}
                >
                  <Heart
                    size={18}
                    fill={post.liked ? 'currentColor' : 'none'}
                  />
                  Like
                </motion.button>
                <button
                  onClick={() =>
                    setShowComments(showComments === post.id ? null : post.id)
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-zinc-400 hover:bg-white/[0.05] transition-all"
                >
                  <MessageCircle size={18} />
                  Comment
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-zinc-400 hover:bg-white/[0.05] transition-all">
                  <Share2 size={18} />
                  Share
                </button>
              </div>

              {/* Comments Section */}
              {showComments === post.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-6 py-4 bg-zinc-800/30 space-y-4 border-t border-white/[0.08]"
                >
                  {/* Existing Comments */}
                  <div className="space-y-4">
                    {post.commentsData.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <img
                          src={comment.avatar}
                          alt={comment.author}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="bg-zinc-800/50 rounded-lg p-3 mb-1">
                            <p className="text-sm font-bold">{comment.author}</p>
                            <p className="text-sm text-zinc-300">{comment.content}</p>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-zinc-500">
                            <span>{comment.date}</span>
                            <button className="hover:text-white transition-colors">
                              Like ({comment.likes})
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Comment */}
                  <div className="flex gap-3 pt-4 border-t border-white/[0.08]">
                    <img
                      src="https://i.pravatar.cc/64?u=you"
                      alt="Your avatar"
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="flex-1 bg-zinc-800/50 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/60"
                      />
                      <motion.button
                        onClick={() => addComment(post.id)}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-violet-500/20 border border-violet-500/50 rounded-lg font-bold text-violet-400 hover:bg-violet-500/30 transition-all"
                      >
                        <Send size={16} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Load More / Infinite Scroll */}
        <div
          ref={observerTarget}
          className="flex flex-col items-center justify-center py-12 gap-4"
        >
          <motion.button
            onClick={loadMorePosts}
            whileTap={{ scale: 0.97 }}
            className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg font-bold flex items-center gap-2 hover:shadow-lg transition-all"
          >
            <Zap size={18} />
            Load More Posts
          </motion.button>
          <p className="text-sm text-zinc-500">
            {hasMore ? 'Scroll for more' : 'No more posts'}
          </p>
        </div>
      </div>
    </div>
  );
}
