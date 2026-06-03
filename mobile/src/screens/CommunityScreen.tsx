import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Users, Lock, Plus, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

const COMMUNITIES = [
  {
    id: '1',
    name: "Sneaker Heads NYC",
    description: "Exclusive drops, trading, and legit checks for the culture.",
    members: "12.5k",
    type: "Fashion",
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400&q=80",
    isPrivate: false
  },
  {
    id: '2',
    name: "Cloud Kitchen Collective",
    description: "Discover the best hidden gems and home-run kitchens.",
    members: "8.2k",
    type: "Food",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&q=80",
    isPrivate: false
  },
];

export default function CommunityScreen() {
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Tribes</Text>
            <Text style={styles.subtitle}>Join communities that match your vibe</Text>
          </View>
          <TouchableOpacity style={styles.addBtn}>
            <Plus color="white" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {COMMUNITIES.map((community, index) => (
            <MotiView
              key={community.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 100 }}
              style={styles.card}
            >
              <View style={styles.imageContainer}>
                <Image source={{ uri: community.image }} style={styles.image} />
                <View style={styles.typeBadge}>
                  <Text style={styles.typeText}>{community.type}</Text>
                </View>
                {community.isPrivate && (
                  <View style={styles.lockBadge}>
                    <Lock size={12} color="white" />
                  </View>
                )}
              </View>
              <View style={styles.details}>
                <Text style={styles.name}>{community.name}</Text>
                <Text style={styles.description} numberOfLines={2}>{community.description}</Text>
                <View style={styles.footer}>
                  <View style={styles.memberInfo}>
                    <Users size={14} color={colors.textMuted} />
                    <Text style={styles.memberCount}>{community.members}</Text>
                  </View>
                  <TouchableOpacity style={styles.joinBtn}>
                    <Text style={styles.joinText}>Join</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </MotiView>
          ))}
        </View>

        <LinearGradient
          colors={['#4C1D95', '#831843']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.trendingCard}
        >
          <View style={styles.trendingHeader}>
            <TrendingUp size={20} color="#F472B6" />
            <Text style={styles.trendingTitle}>Trending Topics</Text>
          </View>
          {[1, 2].map((i) => (
            <TouchableOpacity key={i} style={styles.topicItem}>
              <View style={styles.topicHash}>
                <Text style={styles.hashText}>#{i}</Text>
              </View>
              <View>
                <Text style={styles.topicText}>New Yeezy drop predictions...</Text>
                <Text style={styles.topicSub}>45 members active</Text>
              </View>
            </TouchableOpacity>
          ))}
        </LinearGradient>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  addBtn: {
    width: 50,
    height: 50,
    backgroundColor: colors.surface,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  grid: {
    gap: 20,
    marginBottom: 30,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  imageContainer: {
    height: 150,
    width: '100%',
    position: 'relative',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.7,
  },
  typeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  typeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  lockBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.primary,
    padding: 6,
    borderRadius: 8,
  },
  details: {
    padding: 16,
  },
  name: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberCount: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  joinBtn: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
  },
  joinText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 12,
  },
  trendingCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  trendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  trendingTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  topicHash: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hashText: {
    color: 'white',
    fontWeight: 'bold',
  },
  topicText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  topicSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 2,
  },
});
