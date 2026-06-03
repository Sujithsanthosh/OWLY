import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heart, MessageCircle, Share2, ShoppingCart, Plus } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { colors } from '../theme/colors';
import axios from 'axios';
import { getAuthToken } from '../services/authService';
import { API_URL } from '../config';

import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const FeedItem = ({ item }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    try {
      const token = await getAuthToken();
      await axios.post(`${API_URL}/posts/${item.id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLiked(true);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  useEffect(() => {
    const trackView = async () => {
        try {
            const token = await getAuthToken();
            if (token) {
                await axios.post(`${API_URL}/posts/${item.id}/view`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        } catch (e) {}
    };
    trackView();
  }, [item.id]);

  return (
    <View style={[styles.itemContainer, { height: height - 49 }]}>
      <Image source={{ uri: item.media_urls?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80' }} style={styles.backgroundMedia} resizeMode="cover" />
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      />

      <TouchableOpacity
        style={[styles.createPostBtn, { top: insets.top + 10 }]}
        onPress={() => navigation.navigate('CreatePost')}
      >
        <Plus color="white" size={24} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.liveBtn, { top: insets.top + 10 }]}
        onPress={() => navigation.navigate('LiveStream')}
      >
        <View style={styles.liveDot} />
        <Text style={styles.liveBtnText}>LIVE</Text>
      </TouchableOpacity>

      {/* Interaction Sidebar */}
      <View style={styles.sidebar}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: item.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.user_name}` }} style={styles.avatar} />
          <TouchableOpacity style={styles.followBtn}>
            <Plus color="white" size={12} strokeWidth={3} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
          <Heart color={liked ? colors.primary : "white"} fill={liked ? colors.primary : "transparent"} size={28} />
          <Text style={styles.actionText}>{item.likes_count}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <MessageCircle color="white" size={28} />
          <Text style={styles.actionText}>{item.comments_count}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Share2 color="white" size={28} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Content Overlay */}
      <View style={[styles.contentOverlay, { bottom: insets.bottom + 20 }]}>
        <Text style={styles.username}>@{item.user_name}</Text>
        <Text style={styles.caption} numberOfLines={2}>{item.content}</Text>

        {item.metadata && (
          <MotiView
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            style={styles.productCard}
          >
            <BlurView intensity={30} style={styles.blurCard}>
              <View style={styles.productInfo}>
                <View style={styles.productThumb} />
                <View>
                  <Text style={styles.productName}>{item.metadata.products?.[0]?.name || item.metadata.name || 'AI Pick'}</Text>
                  <Text style={styles.productPrice}>{item.metadata.products?.[0]?.estimated_price || item.metadata.estimated_price || '$ --'}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.buyBtn}>
                <ShoppingCart color="black" size={16} />
                <Text style={styles.buyText}>Buy</Text>
              </TouchableOpacity>
            </BlurView>
          </MotiView>
        )}
      </View>
    </View>
  );
};

export default function FeedScreen() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${API_URL}/posts/feed`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
        <View style={[styles.container, { justifyContent: 'center' }]}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={({ item }) => <FeedItem item={item} />}
        keyExtractor={item => item.id.toString()}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height - 49}
        snapToAlignment="start"
        decelerationRate="fast"
        onRefresh={fetchFeed}
        refreshing={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  itemContainer: {
    width: width,
    position: 'relative',
  },
  backgroundMedia: {
    ...StyleSheet.absoluteFillObject,
  },
  createPostBtn: {
    position: 'absolute',
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    zIndex: 10,
  },
  liveBtn: {
    position: 'absolute',
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    zIndex: 10,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF0050',
  },
  liveBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  sidebar: {
    position: 'absolute',
    right: 15,
    bottom: 150,
    alignItems: 'center',
    gap: 20,
  },
  avatarContainer: {
    marginBottom: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'white',
  },
  followBtn: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    backgroundColor: colors.secondary,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtn: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contentOverlay: {
    position: 'absolute',
    left: 15,
    right: 80,
  },
  username: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 17,
  },
  caption: {
    color: 'white',
    fontSize: 14,
    marginTop: 4,
    opacity: 0.9,
  },
  productCard: {
    marginTop: 15,
    borderRadius: 20,
    overflow: 'hidden',
  },
  blurCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  productThumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  productName: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  productPrice: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: 'bold',
  },
  buyBtn: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
  },
  buyText: {
    color: 'black',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
