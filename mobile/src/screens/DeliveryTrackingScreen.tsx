import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Phone, MessageSquare, MapPin, Package, Clock, ShieldCheck } from 'lucide-react-native';
import { MotiView, AnimatePresence } from 'moti';
import { colors } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config';

const { width, height } = Dimensions.get('window');

export default function DeliveryTrackingScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { orderId = '#OWLY-8291' } = route.params || {};
  const [status, setStatus] = useState('Out for Delivery');
  const [deliveryLocation, setDeliveryLocation] = useState({ lat: 40.7484, lng: -73.9857 });
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    socketRef.current.emit('join_order_tracking', orderId);

    socketRef.current.on('delivery_location_update', (data: any) => {
      setDeliveryLocation({ lat: data.lat, lng: data.lng });
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [orderId]);

  // Mock tracking steps
  const steps = [
    { title: 'Order Confirmed', time: '10:30 AM', completed: true },
    { title: 'Preparing your order', time: '10:45 AM', completed: true },
    { title: 'Out for Delivery', time: '11:15 AM', current: true },
    { title: 'Delivered', time: 'Estimated 11:35 AM', future: true },
  ];

  return (
    <View style={styles.container}>
      {/* Mock Map Background */}
      <View style={styles.mapPlaceholder}>
        <Image
          source={{ uri: `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/pin-s-l+ff0000(${deliveryLocation.lng},${deliveryLocation.lat})/-73.9784,40.7658,13/800x800@2x?access_token=pk.eyJ1IjoicGxhY2Vob2xkZXIiLCJhIjoiY2p3emh5ejR0MDFrMTN5cGVndnZ5eHh5ZSJ9` }}
          style={styles.mapImage}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'transparent', 'transparent', 'rgba(0,0,0,0.8)']}
          style={StyleSheet.absoluteFill}
        />

        {/* Animated Delivery Marker (Simulated) */}
        <MotiView
          animate={{ translateY: -20, translateX: 10 }}
          transition={{ loop: true, duration: 4000, type: 'timing' }}
          style={styles.deliveryMarker}
        >
          <View style={styles.markerCircle}>
             <Package color="white" size={16} />
          </View>
          <View style={styles.markerTail} />
        </MotiView>
      </View>

      {/* Header */}
      <View style={[styles.header, { top: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color="white" size={24} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Track Order</Text>
          <Text style={styles.headerSubtitle}>{orderId}</Text>
        </View>
      </View>

      {/* Bottom Sheet UI */}
      <MotiView
        from={{ translateY: 300 }}
        animate={{ translateY: 0 }}
        style={[styles.bottomSheet, { paddingBottom: insets.bottom + 20 }]}
      >
        <View style={styles.dragHandle} />

        {/* Delivery Partner Info */}
        <View style={styles.partnerCard}>
          <Image
            source={{ uri: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Delivery' }}
            style={styles.partnerAvatar}
          />
          <View style={styles.partnerInfo}>
            <Text style={styles.partnerName}>Rahul Sharma</Text>
            <View style={styles.ratingRow}>
              <ShieldCheck size={14} color={colors.primary} />
              <Text style={styles.ratingText}>Verified Partner • 4.9 ★</Text>
            </View>
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionIcon}>
              <MessageSquare size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionIcon, styles.phoneIcon]}>
              <Phone size={20} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Status Timeline */}
        <ScrollView showsVerticalScrollIndicator={false} style={styles.timelineContainer}>
          <View style={styles.etaRow}>
            <Clock size={20} color={colors.primary} />
            <View>
              <Text style={styles.etaLabel}>Estimated Delivery</Text>
              <Text style={styles.etaTime}>11:35 AM (20 mins away)</Text>
            </View>
          </View>

          {steps.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={styles.stepIndicator}>
                <View style={[
                  styles.stepDot,
                  step.completed && styles.stepDotCompleted,
                  step.current && styles.stepDotCurrent
                ]} />
                {index !== steps.length - 1 && <View style={[styles.stepLine, step.completed && styles.stepLineCompleted]} />}
              </View>
              <View style={styles.stepContent}>
                <Text style={[
                  styles.stepTitle,
                  step.future && styles.stepTitleFuture,
                  step.current && { color: colors.primary }
                ]}>
                  {step.title}
                </Text>
                <Text style={styles.stepTime}>{step.time}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  mapPlaceholder: {
    height: height * 0.6,
    width: width,
  },
  mapImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.8,
  },
  deliveryMarker: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    alignItems: 'center',
  },
  markerCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'black',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  markerTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.primary,
    marginTop: -2,
  },
  header: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerInfo: {
    marginLeft: 15,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#121212',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: height * 0.5,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  partnerCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partnerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  partnerInfo: {
    flex: 1,
    marginLeft: 15,
  },
  partnerName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  ratingText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneIcon: {
    backgroundColor: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 20,
  },
  timelineContainer: {
    flex: 1,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    backgroundColor: 'rgba(255,215,0,0.05)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.1)',
  },
  etaLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  etaTime: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepRow: {
    flexDirection: 'row',
    gap: 20,
  },
  stepIndicator: {
    alignItems: 'center',
    width: 20,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    zIndex: 2,
  },
  stepDotCompleted: {
    backgroundColor: colors.primary,
  },
  stepDotCurrent: {
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  stepLine: {
    width: 2,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 4,
  },
  stepLineCompleted: {
    backgroundColor: colors.primary,
  },
  stepContent: {
    paddingBottom: 25,
  },
  stepTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  stepTitleFuture: {
    color: 'rgba(255,255,255,0.3)',
  },
  stepTime: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  }
});
