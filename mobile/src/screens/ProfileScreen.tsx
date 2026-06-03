import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Settings, Award, Share2, Clock, ChevronRight, Gift, Star, Package, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { colors } from '../theme/colors';

import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const RECENT_ACTIVITY = [
  { id: 1, type: 'purchase', title: 'Ordered Spicy Ramen', points: '+20', date: '2 hours ago' },
  { id: 2, type: 'referral', title: 'Friend joined: @marcus_v', points: '+100', date: 'Yesterday' },
  { id: 3, type: 'post', title: 'Shared an outfit in StreetVibe', points: '+10', date: '2 days ago' },
];

export default function ProfileScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarBorder}>
              <Image
                source={{ uri: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' }}
                style={styles.avatar}
              />
            </View>
            <TouchableOpacity style={styles.settingsBtn}>
              <Settings size={16} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>Alex Thompson</Text>
          <Text style={styles.username}>@alex_cooks • Creator Tribe Member</Text>
        </View>

        {/* AI Stylist Entry Point */}
        <TouchableOpacity
          style={styles.stylistCard}
          onPress={() => navigation.navigate('AIStylist')}
        >
          <LinearGradient
            colors={['#8B5CF6', '#6366F1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.stylistGradient}
          >
            <View style={styles.stylistContent}>
              <View style={styles.stylistIcon}>
                <Sparkles size={24} color="white" />
              </View>
              <View>
                <Text style={styles.stylistTitle}>Consult AI Stylist</Text>
                <Text style={styles.stylistSub}>Find your fashion tribe</Text>
              </View>
            </View>
            <ChevronRight size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Rewards Card */}
        <MotiView
          from={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.rewardsCardWrapper}
        >
          <LinearGradient
            colors={[colors.surface, '#000000']}
            style={styles.rewardsCard}
          >
            <View style={styles.rewardsHeader}>
              <View>
                <Text style={styles.rewardsLabel}>YOUR BALANCE</Text>
                <View style={styles.pointsRow}>
                  <Text style={styles.pointsValue}>1,450</Text>
                  <Text style={styles.pointsUnit}>PTS</Text>
                </View>
              </View>
              <View style={styles.awardIcon}>
                <Award size={32} color={colors.primary} />
              </View>
            </View>

            <View style={styles.rewardsActions}>
              <TouchableOpacity style={styles.redeemBtn}>
                <Gift size={16} color="black" />
                <Text style={styles.redeemText}>Redeem</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareBtn}>
                <Share2 size={16} color="white" />
                <Text style={styles.shareText}>Invite</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </MotiView>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { v: '12', l: 'Orders' },
            { v: '5', l: 'Tribes' },
            { v: '850', l: 'Following' }
          ].map((s, i) => (
            <View key={i} style={styles.statBox}>
              <Text style={styles.statValue}>{s.v}</Text>
              <Text style={styles.statLabel}>{s.l}</Text>
            </View>
          ))}
        </View>

        {/* Referral */}
        <View style={styles.referralCard}>
          <View style={styles.referralInfo}>
            <View style={styles.starIcon}>
              <Star size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.referralTitle}>Refer & Earn</Text>
              <Text style={styles.referralSub}>Get 500 pts for every friend</Text>
            </View>
          </View>
          <View style={styles.promoCode}>
            <Text style={styles.promoText}>ALEX500</Text>
          </View>
        </View>

        {/* Activity */}
        <View style={styles.activityHeader}>
          <Text style={styles.activityTitle}>Activity</Text>
          <TouchableOpacity style={styles.historyBtn}>
            <Text style={styles.historyText}>History</Text>
            <Clock size={14} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.activityList}>
          {RECENT_ACTIVITY.map((item) => (
            <TouchableOpacity key={item.id} style={styles.activityItem}>
              <View style={styles.activityLeft}>
                <View style={styles.activityIcon}>
                  {item.type === 'purchase' ? <Package size={18} color="white" /> : <Share2 size={18} color="white" />}
                </View>
                <View>
                  <Text style={styles.activityItemTitle}>{item.title}</Text>
                  <Text style={styles.activityDate}>{item.date}</Text>
                </View>
              </View>
              <View style={styles.activityRight}>
                <Text style={styles.activityPoints}>{item.points}</Text>
                <ChevronRight size={14} color={colors.border} />
              </View>
            </TouchableOpacity>
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarBorder: {
    width: 100,
    height: 100,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: colors.primary,
    padding: 3,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    backgroundColor: colors.surface,
  },
  settingsBtn: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.surface,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  name: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  username: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  stylistCard: {
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
  },
  stylistGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  stylistContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stylistIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stylistTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stylistSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  rewardsCardWrapper: {
    marginBottom: 24,
  },
  rewardsCard: {
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  rewardsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rewardsLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 4,
  },
  pointsValue: {
    color: 'white',
    fontSize: 36,
    fontWeight: '900',
  },
  pointsUnit: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  awardIcon: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardsActions: {
    flexDirection: 'row',
    gap: 12,
  },
  redeemBtn: {
    flex: 1,
    backgroundColor: 'white',
    height: 48,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  redeemText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 14,
  },
  shareBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    height: 48,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  shareText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  referralCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    marginBottom: 30,
  },
  referralInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  starIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  referralTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  referralSub: {
    color: colors.textMuted,
    fontSize: 11,
  },
  promoCode: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  promoText: {
    color: colors.primary,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    backgroundColor: colors.surface,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityItemTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  activityDate: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
  activityRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activityPoints: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '900',
  },
});
