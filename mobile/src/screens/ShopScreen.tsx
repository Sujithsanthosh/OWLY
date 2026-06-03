import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, Image, Dimensions } from 'react-native';
import { Search, Filter, ShoppingBag, Utensils, Zap, Star } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { colors } from '../theme/colors';

import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'all', name: 'All', icon: ShoppingBag },
  { id: 'fashion', name: 'Fashion', icon: Zap },
  { id: 'food', name: 'Food', icon: Utensils },
];

const PRODUCTS = [
  {
    id: '1',
    name: "Urban Oversized Hoodie",
    brand: "StreetVibe",
    price: 65.00,
    priceStr: "$65.00",
    rating: 4.8,
    category: 'fashion',
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&q=80",
    isNew: true
  },
  {
    id: '2',
    name: "Signature Truffle Burger",
    brand: "Gourmet Lab",
    price: 22.50,
    priceStr: "$22.50",
    rating: 4.9,
    category: 'food',
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
    isNew: false
  },
  {
    id: '3',
    name: "Linen Summer Set",
    brand: "EcoWear",
    price: 110.00,
    priceStr: "$110.00",
    rating: 4.7,
    category: 'fashion',
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80",
    isNew: true
  },
  {
    id: '4',
    name: "Artisanal Sourdough",
    brand: "The Crusty Loaf",
    price: 12.00,
    priceStr: "$12.00",
    rating: 5.0,
    category: 'food',
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80",
    isNew: false
  }
];

export default function ShopScreen() {
  const [activeCategory, setActiveCategory] = useState('all');
  const navigation = useNavigation<any>();

  const filteredProducts = activeCategory === 'all'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === activeCategory);

  const handleAddToCart = (product: any) => {
    navigation.navigate('Checkout', { amount: product.price });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Marketplace</Text>
          <Text style={styles.subtitle}>Curated drops from your tribes</Text>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Search color={colors.textMuted} size={20} style={styles.searchIcon} />
            <TextInput
              placeholder="Search products, brands..."
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Filter color="white" size={20} />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setActiveCategory(cat.id)}
              style={[
                styles.categoryChip,
                activeCategory === cat.id && styles.activeCategoryChip
              ]}
            >
              <cat.icon size={16} color={activeCategory === cat.id ? 'black' : colors.textMuted} />
              <Text style={[
                styles.categoryText,
                activeCategory === cat.id && styles.activeCategoryText
              ]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={styles.liveDrop}
        >
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.liveDropGradient}
          >
            <View style={styles.liveDropInfo}>
              <View style={styles.liveBadge}>
                <Zap size={14} color="white" fill="white" />
              </View>
              <View>
                <Text style={styles.liveDropLabel}>LIVE NOW</Text>
                <Text style={styles.liveDropTitle}>Supreme x Owly Drop</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.joinBtn}>
              <Text style={styles.joinBtnText}>Join</Text>
            </TouchableOpacity>
          </LinearGradient>
        </MotiView>

        <View style={styles.grid}>
          {filteredProducts.map((product, index) => (
            <MotiView
              key={product.id}
              from={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 100 }}
              style={styles.productCard}
            >
              <View style={styles.imageContainer}>
                <Image source={{ uri: product.image }} style={styles.productImage} />
                {product.isNew && (
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>NEW</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.cartBtn}
                  onPress={() => handleAddToCart(product)}
                >
                  <ShoppingBag size={18} color="white" />
                </TouchableOpacity>
              </View>
              <View style={styles.productDetails}>
                <Text style={styles.brand}>{product.brand}</Text>
                <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>{product.priceStr}</Text>
                  <View style={styles.ratingRow}>
                    <Star size={10} color="#EAB308" fill="#EAB308" />
                    <Text style={styles.rating}>{product.rating}</Text>
                  </View>
                </View>
              </View>
            </MotiView>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: -1,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    marginTop: 4,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  searchContainer: {
    flex: 1,
    height: 54,
    backgroundColor: colors.surface,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 15,
  },
  filterBtn: {
    width: 54,
    height: 54,
    backgroundColor: colors.surface,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  categories: {
    marginBottom: 24,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: colors.surface,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  activeCategoryChip: {
    backgroundColor: 'white',
    borderColor: 'white',
  },
  categoryText: {
    color: colors.textMuted,
    fontWeight: 'bold',
    fontSize: 14,
  },
  activeCategoryText: {
    color: 'black',
  },
  liveDrop: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
  },
  liveDropGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  liveDropInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  liveBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveDropLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  liveDropTitle: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  },
  joinBtn: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  joinBtnText: {
    color: 'black',
    fontWeight: '900',
    fontSize: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  productCard: {
    width: (width - 56) / 2,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 0.8,
    borderRadius: 24,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  newBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  newBadgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: '900',
  },
  cartBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  productDetails: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  brand: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  price: {
    color: colors.primary,
    fontWeight: '900',
    fontSize: 15,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: 'bold',
  },
});
