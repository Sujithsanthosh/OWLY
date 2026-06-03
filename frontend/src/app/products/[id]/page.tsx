"use client";

import { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import {
  Star,
  ShoppingBag,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Truck,
  Shield,
  RotateCcw,
  User,
  MessageSquare,
  ThumbsUp,
} from 'lucide-react';
import { useProducts } from '@/hooks/useApi';
import { AppContext } from '@/store/AppContext';

const SAMPLE_PRODUCT = {
  id: 1,
  name: "Premium Urban Oversized Hoodie",
  brand: "StreetVibe",
  brandDescription: "Leading streetwear brand trusted by 50K+ customers",
  seller_id: 1,
  price: 65.00,
  originalPrice: 85.00,
  rating: 4.8,
  totalReviews: 320,
  inStock: 145,
  sku: "SV-HOODIE-001",
  category: 'Fashion',
  subcategory: 'Hoodies & Sweatshirts',
  description: "Premium quality oversized hoodie made from 100% organic cotton. Perfect for everyday wear with a modern aesthetic.",
  images: [
    "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80",
    "https://images.unsplash.com/photo-1520026643146-42a8ff73e14a?w=800&q=80",
    "https://images.unsplash.com/photo-1556821552-3f6a50b95c4b?w=800&q=80",
    "https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=800&q=80",
  ],
  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  colors: ['Black', 'White', 'Gray', 'Navy', 'Olive'],
  specifications: {
    material: '100% Organic Cotton',
    fit: 'Oversized',
    care: 'Machine wash cold, tumble dry low',
    origin: 'Made in Portugal',
  },
  shipping: {
    cost: 'Free on orders over $100',
    delivery: '3-5 Business Days',
    returns: '30-Day Money Back Guarantee',
  },
  reviews: [
    {
      id: 1,
      author: "Alex Kumar",
      avatar: "https://i.pravatar.cc/48?u=alexkumar",
      rating: 5,
      date: "2 weeks ago",
      title: "Perfect fit and quality!",
      content: "Exactly what I was looking for. The quality is amazing and fits perfectly. Already ordered another one in a different color!",
      helpful: 42,
      verified: true,
    },
    {
      id: 2,
      author: "Sarah Chen",
      avatar: "https://i.pravatar.cc/48?u=sarahchen",
      rating: 5,
      date: "1 month ago",
      title: "Love this hoodie",
      content: "Super comfortable and the material feels premium. Shipping was fast too. Highly recommend!",
      helpful: 35,
      verified: true,
    },
    {
      id: 3,
      author: "Mike Johnson",
      avatar: "https://i.pravatar.cc/48?u=mikej",
      rating: 4,
      date: "1 month ago",
      title: "Great value for money",
      content: "Good quality hoodie. Slightly loose fit but that's what I wanted. Worth the price.",
      helpful: 28,
      verified: true,
    },
  ],
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getProduct, loading } = useProducts();
  const { addToCart, addFavorite, removeFavorite, isFavorite } = useContext(AppContext);
  const [product, setProduct] = useState(SAMPLE_PRODUCT);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Black');
  const [quantity, setQuantity] = useState(1);
  const [isFav, setIsFav] = useState(false);
  const productId = params.id as string;

  useEffect(() => {
    setIsFav(isFavorite(parseInt(productId)));
  }, [productId, isFavorite]);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images[0],
      type: 'product',
    });
  };

  const handleToggleFavorite = () => {
    if (isFav) {
      removeFavorite(product.id);
    } else {
      addFavorite(product.id);
    }
    setIsFav(!isFav);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const reviewStats = {
    5: 238,
    4: 56,
    3: 18,
    2: 6,
    1: 2,
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-zinc-900/80 backdrop-blur-lg border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <h2 className="font-bold text-lg">Product Details</h2>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-800 to-black group">
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />

              {discount > 0 && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold">
                  -{discount}%
                </div>
              )}

              {/* Image Navigation */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  whileHover={{ scale: 1.05 }}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === idx
                      ? 'border-violet-500'
                      : 'border-white/[0.08] hover:border-white/[0.14]'
                  }`}
                >
                  <img
                    src={img}
                    alt={`View ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Brand & Title */}
            <div>
              <p className="text-violet-400 text-sm font-bold uppercase mb-2">
                {product.brand}
              </p>
              <h1 className="text-4xl font-black mb-2">{product.name}</h1>
              <p className="text-zinc-400">{product.description}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={
                        i < Math.floor(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-zinc-600'
                      }
                    />
                  ))}
                </div>
                <span className="font-bold">{product.rating}</span>
              </div>
              <p className="text-zinc-400 text-sm">
                {product.totalReviews.toLocaleString()} reviews
              </p>
              <p className="text-green-400 text-sm font-bold">
                {product.inStock} in stock
              </p>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black">${product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="text-xl text-zinc-500 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              {product.originalPrice && (
                <p className="text-green-400 font-semibold">
                  Save ${(product.originalPrice - product.price).toFixed(2)}
                </p>
              )}
            </div>

            {/* Size Selection */}
            <div>
              <label className="text-sm font-bold text-zinc-400 mb-3 block">
                Select Size
              </label>
              <div className="grid grid-cols-3 gap-2">
                {product.sizes.map((size) => (
                  <motion.button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    whileTap={{ scale: 0.95 }}
                    className={`py-3 rounded-lg font-bold transition-all border-2 ${
                      selectedSize === size
                        ? 'bg-violet-500 border-violet-600 text-white'
                        : 'bg-zinc-800/50 border-white/[0.08] text-zinc-300 hover:border-white/[0.14]'
                    }`}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <label className="text-sm font-bold text-zinc-400 mb-3 block">
                Select Color
              </label>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <motion.button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    whileTap={{ scale: 0.9 }}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all border-2 ${
                      selectedColor === color
                        ? 'bg-violet-500 border-violet-600 text-white'
                        : 'bg-zinc-800/50 border-white/[0.08] text-zinc-300 hover:border-white/[0.14]'
                    }`}
                  >
                    {color}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-bold text-zinc-400">Quantity</label>
              <div className="flex items-center gap-3 bg-zinc-800/50 rounded-lg px-4 py-2 border border-white/[0.08]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  −
                </button>
                <span className="font-bold w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <motion.button
                onClick={handleAddToCart}
                whileTap={{ scale: 0.97 }}
                className="flex-1 py-4 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl font-black text-white flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
              >
                <ShoppingBag size={20} />
                Add to Cart
              </motion.button>
              <motion.button
                onClick={handleToggleFavorite}
                whileTap={{ scale: 0.97 }}
                className={`px-6 py-4 rounded-2xl font-bold transition-all border-2 ${
                  isFav
                    ? 'bg-red-500/20 border-red-500 text-red-400'
                    : 'bg-zinc-800/50 border-white/[0.08] text-zinc-400 hover:border-white/[0.14]'
                }`}
              >
                <Heart size={20} fill={isFav ? 'currentColor' : 'none'} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="px-6 py-4 bg-zinc-800/50 border-2 border-white/[0.08] rounded-2xl font-bold text-zinc-400 hover:border-white/[0.14] transition-all"
              >
                <Share2 size={20} />
              </motion.button>
            </div>

            {/* Shipping Info */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/[0.1]">
              <div className="text-center">
                <Truck className="mx-auto mb-2 text-violet-400" size={24} />
                <p className="text-xs text-zinc-400 font-semibold">{product.shipping.delivery}</p>
              </div>
              <div className="text-center">
                <RotateCcw className="mx-auto mb-2 text-violet-400" size={24} />
                <p className="text-xs text-zinc-400 font-semibold">{product.shipping.returns}</p>
              </div>
              <div className="text-center">
                <Shield className="mx-auto mb-2 text-violet-400" size={24} />
                <p className="text-xs text-zinc-400 font-semibold">Secure Payment</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Specifications & Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Specifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-8 border border-white/[0.1]"
          >
            <h3 className="text-xl font-black mb-6">Specifications</h3>
            <div className="space-y-4">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between items-start">
                  <span className="text-zinc-400 capitalize">{key}</span>
                  <span className="font-semibold text-right">{value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Rating Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-8 border border-white/[0.1]"
          >
            <h3 className="text-xl font-black mb-6">Rating Distribution</h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2">
                  <div className="flex items-center gap-1 w-8">
                    {rating}
                    <Star size={14} fill="currentColor" className="text-yellow-400" />
                  </div>
                  <div className="flex-1 bg-zinc-800/50 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-violet-500 to-purple-600 h-2 rounded-full"
                      style={{
                        width: `${(reviewStats[rating as keyof typeof reviewStats] / 320) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-zinc-500 w-8 text-right">
                    {reviewStats[rating as keyof typeof reviewStats]}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Seller Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-8 border border-white/[0.1]"
          >
            <h3 className="text-xl font-black mb-6">Seller Info</h3>
            <div className="flex items-center gap-4 mb-6">
              <img
                src={`https://i.pravatar.cc/64?u=${product.brand}`}
                alt={product.brand}
                className="w-16 h-16 rounded-full border-2 border-violet-500"
              />
              <div>
                <p className="font-bold">{product.brand}</p>
                <p className="text-xs text-zinc-400">{product.brandDescription}</p>
              </div>
            </div>
            <div className="space-y-2 mb-6">
              <p className="text-sm text-zinc-300">
                <span className="font-bold text-green-400">4.8★</span> Seller Rating
              </p>
              <p className="text-sm text-zinc-300">
                <span className="font-bold">98%</span> Positive Feedback
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl font-bold text-white transition-all"
            >
              Visit Store
            </motion.button>
          </motion.div>
        </div>

        {/* Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8 border border-white/[0.1]"
        >
          <h3 className="text-2xl font-black mb-8">Customer Reviews</h3>
          <div className="space-y-6">
            {product.reviews.map((review, idx) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="pb-6 border-b border-white/[0.1] last:border-b-0"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={review.avatar}
                      alt={review.author}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-bold">{review.author}</p>
                      <p className="text-xs text-zinc-500">{review.date}</p>
                    </div>
                  </div>
                  {review.verified && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-semibold">
                      ✓ Verified
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-zinc-600'
                        }
                      />
                    ))}
                  </div>
                  <p className="font-bold text-sm">{review.title}</p>
                </div>

                <p className="text-zinc-300 text-sm mb-4">{review.content}</p>

                <button className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
                  <ThumbsUp size={16} />
                  Helpful ({review.helpful})
                </button>
              </motion.div>
            ))}
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            className="w-full mt-8 py-4 bg-violet-500/20 border-2 border-violet-500/50 rounded-xl font-bold text-violet-300 hover:bg-violet-500/30 transition-all"
          >
            Load More Reviews
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
