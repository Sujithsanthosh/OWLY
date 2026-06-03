"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  Gift,
  Share2,
  Volume2,
  VolumeX,
  Maximize,
  Send,
  Users,
  ShoppingBag,
  Star,
  ArrowLeft,
  Eye,
} from 'lucide-react';

interface LiveComment {
  id: number;
  author: string;
  avatar: string;
  message: string;
  timestamp: string;
}

interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  rating: number;
  inStock: number;
  discount: number;
}

interface Gift {
  id: number;
  name: string;
  emoji: string;
  price: number;
}

const LIVE_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Premium Wireless Earbuds',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
    price: 89.99,
    originalPrice: 149.99,
    rating: 4.8,
    inStock: 245,
    discount: 40,
  },
  {
    id: 2,
    name: 'Smart Watch Series 5',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
    price: 199.99,
    originalPrice: 299.99,
    rating: 4.6,
    inStock: 89,
    discount: 33,
  },
  {
    id: 3,
    name: 'Portable Charger 30000mAh',
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&q=80',
    price: 45.99,
    originalPrice: 79.99,
    rating: 4.7,
    inStock: 512,
    discount: 42,
  },
];

const GIFTS: Gift[] = [
  { id: 1, name: 'Heart', emoji: '❤️', price: 1 },
  { id: 2, name: 'Star', emoji: '⭐', price: 5 },
  { id: 3, name: 'Fire', emoji: '🔥', price: 10 },
  { id: 4, name: 'Diamond', emoji: '💎', price: 50 },
];

export default function LivestreamPage() {
  const [comments, setComments] = useState<LiveComment[]>([
    {
      id: 1,
      author: 'Sarah Chen',
      avatar: 'https://i.pravatar.cc/64?u=sarahchen',
      message: 'This is amazing! 😍',
      timestamp: '2m ago',
    },
    {
      id: 2,
      author: 'Mike Johnson',
      avatar: 'https://i.pravatar.cc/64?u=mikej',
      message: 'Just bought 2 pairs!',
      timestamp: '1m ago',
    },
  ]);
  const [newComment, setNewComment] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    LIVE_PRODUCTS[0]
  );
  const [viewerCount, setViewerCount] = useState(12453);
  const [likes, setLikes] = useState(0);
  const [showGifts, setShowGifts] = useState(false);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Simulate live comments
  useEffect(() => {
    const interval = setInterval(() => {
      const newMsg: LiveComment = {
        id: Math.random(),
        author: ['Emma Wilson', 'Alex Kumar', 'Lisa Park', 'David Brown'][
          Math.floor(Math.random() * 4)
        ],
        avatar: `https://i.pravatar.cc/64?u=${Math.random()}`,
        message: [
          'This product is 🔥',
          'Already added to cart!',
          'Great deal!',
          'Love your live streams',
        ][Math.floor(Math.random() * 4)],
        timestamp: 'now',
      };
      setComments((prev) => [...prev.slice(-19), newMsg]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Auto scroll to latest comment
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: LiveComment = {
      id: Math.random(),
      author: 'You',
      avatar: 'https://i.pravatar.cc/64?u=you',
      message: newComment,
      timestamp: 'now',
    };

    setComments((prev) => [...prev.slice(-19), comment]);
    setNewComment('');
  };

  const sendGift = (gift: Gift) => {
    setSelectedGift(gift);
    setLikes((prev) => prev + gift.price * 10);
    setTimeout(() => setSelectedGift(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Feed
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Player */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <div className="relative bg-black rounded-2xl overflow-hidden border border-white/[0.1] aspect-video">
              {/* Live Video Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 via-black to-purple-600/30 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-pulse">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-500/20 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-violet-500/40"></div>
                    </div>
                  </div>
                  <p className="text-zinc-400">Live Stream</p>
                </div>
              </div>

              {/* Live Badge & Stats */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-red-500/90 backdrop-blur-lg px-3 py-1 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                    <span className="font-bold text-sm">LIVE</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-white/[0.1] backdrop-blur-lg px-3 py-1 rounded-full">
                    <Eye size={14} />
                    <span className="text-sm font-bold">{viewerCount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Video Controls */}
              <div className="absolute bottom-4 right-4 flex items-center gap-3 z-10">
                <motion.button
                  onClick={() => setIsMuted(!isMuted)}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 bg-white/[0.1] hover:bg-white/[0.2] backdrop-blur-lg rounded-lg transition-all border border-white/[0.2]"
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </motion.button>
                <motion.button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 bg-white/[0.1] hover:bg-white/[0.2] backdrop-blur-lg rounded-lg transition-all border border-white/[0.2]"
                >
                  <Maximize size={20} />
                </motion.button>
              </div>

              {/* Gift Animation */}
              {selectedGift && (
                <motion.div
                  initial={{ opacity: 1, scale: 0.5, y: 0 }}
                  animate={{ opacity: 1, scale: 1, y: -100 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-1/2 left-1/2 transform -translate-x-1/2 z-20"
                >
                  <div className="text-6xl">{selectedGift.emoji}</div>
                </motion.div>
              )}
            </div>

            {/* Livestream Header */}
            <div className="mt-6 pb-6 border-b border-white/[0.08]">
              <h1 className="text-3xl font-black mb-2">Live Shopping Event</h1>
              <p className="text-zinc-400 mb-4">
                Join us for exclusive deals on tech gadgets! 🎉
              </p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Heart size={18} className="text-red-500" />
                  <span className="font-bold">{likes.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={18} />
                  <span className="font-bold">{viewerCount.toLocaleString()} watching</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sidebar - Products & Chat */}
          <div className="flex flex-col gap-6">
            {/* Featured Product */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass rounded-2xl p-6 border border-white/[0.1]"
            >
              <h3 className="text-lg font-bold mb-4">Featured Product</h3>

              {selectedProduct && (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-full h-40 object-cover rounded-xl"
                    />
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      -{selectedProduct.discount}%
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold mb-2">{selectedProduct.name}</h4>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-bold">{selectedProduct.rating}</span>
                      </div>
                      <span className="text-xs text-zinc-500">
                        {selectedProduct.inStock} in stock
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-black text-violet-400">
                        ${selectedProduct.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-zinc-500 line-through">
                        ${selectedProduct.originalPrice.toFixed(2)}
                      </span>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      className="w-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg py-2 font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                    >
                      <ShoppingBag size={18} />
                      Add to Cart
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Product Carousel */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {LIVE_PRODUCTS.map((product) => (
                  <motion.button
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    whileTap={{ scale: 0.95 }}
                    className={`p-2 rounded-lg border transition-all ${
                      selectedProduct?.id === product.id
                        ? 'border-violet-500 bg-violet-500/10'
                        : 'border-white/[0.1] hover:border-white/[0.2]'
                    }`}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-12 object-cover rounded"
                    />
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Gift Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-6 border border-white/[0.1]"
            >
              <h3 className="text-lg font-bold mb-3">Send Gifts</h3>
              <div className="grid grid-cols-4 gap-2">
                {GIFTS.map((gift) => (
                  <motion.button
                    key={gift.id}
                    onClick={() => sendGift(gift)}
                    whileTap={{ scale: 0.9 }}
                    className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-white/[0.05] transition-colors"
                  >
                    <span className="text-3xl">{gift.emoji}</span>
                    <span className="text-xs text-zinc-400">${gift.price}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Live Comments */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-6 border border-white/[0.1] flex-1 flex flex-col"
            >
              <h3 className="text-lg font-bold mb-4">Live Chat</h3>

              <div className="flex-1 space-y-3 mb-4 overflow-y-auto max-h-60">
                <AnimatePresence mode="popLayout">
                  {comments.map((comment) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex gap-2 text-sm"
                    >
                      <img
                        src={comment.avatar}
                        alt={comment.author}
                        className="w-6 h-6 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-xs">{comment.author}</span>
                          <span className="text-zinc-500 text-xs">{comment.timestamp}</span>
                        </div>
                        <p className="text-zinc-300 text-sm break-words">
                          {comment.message}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={commentsEndRef} />
              </div>

              {/* Comment Input */}
              <div className="flex gap-2 pt-4 border-t border-white/[0.08]">
                <input
                  type="text"
                  placeholder="Say something..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === 'Enter' && handleAddComment()
                  }
                  className="flex-1 bg-zinc-800/50 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/60"
                />
                <motion.button
                  onClick={handleAddComment}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-violet-500/20 border border-violet-500/50 rounded-lg text-violet-400 hover:bg-violet-500/30 transition-all"
                >
                  <Send size={16} />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
