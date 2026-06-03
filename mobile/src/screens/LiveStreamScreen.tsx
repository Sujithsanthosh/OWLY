import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, TextInput, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { io, Socket } from 'socket.io-client';
import { X, Heart, Share2, Users, Zap, Gavel } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, AnimatePresence } from 'moti';
import { colors } from '../theme/colors';
import { SOCKET_URL } from '../config';

const { width, height } = Dimensions.get('window');

export default function LiveStreamScreen({ navigation }: any) {
  const [messages, setMessages] = useState<any[]>([
    { id: '1', user: 'hype_beast', text: 'LETS GOOO! 🔥' },
    { id: '2', user: 'sneaker_head', text: 'Is this 1 of 1?' },
  ]);
  const [currentBid, setCurrentBid] = useState(120);
  const [bids, setBids] = useState<any[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    const streamId = 'stream_123';

    socketRef.current.emit('join_stream', streamId);

    socketRef.current.on('new_bid', (data: any) => {
      setBids((prev) => [data, ...prev].slice(0, 3));
      setCurrentBid(data.bidAmount);
    });

    socketRef.current.on('new_message', (data: any) => {
      setMessages((prev) => [...prev, { id: Math.random().toString(), user: data.userName, text: data.message }]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const handlePlaceBid = () => {
    const nextBid = currentBid + 10;
    socketRef.current?.emit('place_bid', {
      streamId: 'stream_123',
      productId: 'prod_1',
      bidAmount: nextBid,
      userId: 'mobile_user_1',
      userName: 'Alex (You)'
    });
  };

  return (
    <View style={styles.container}>
      {/* Mock Video Background */}
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&q=80' }}
        style={styles.backgroundVideo}
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.hostInfo}>
          <Image
            source={{ uri: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Host' }}
            style={styles.hostAvatar}
          />
          <View>
            <Text style={styles.hostName}>StreetVibe</Text>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
              <Users size={10} color="white" style={{ marginLeft: 8 }} />
              <Text style={styles.viewerCount}>4.2k</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <X color="white" size={24} />
        </TouchableOpacity>
      </View>

      {/* Product Auction Card */}
      <MotiView
        from={{ translateX: 300, opacity: 0 }}
        animate={{ translateX: 0, opacity: 1 }}
        style={styles.auctionCard}
      >
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=200&q=80' }}
          style={styles.productImage}
        />
        <View style={styles.auctionDetails}>
          <Text style={styles.productName}>Owly StreetVibe V1</Text>
          <Text style={styles.bidLabel}>CURRENT BID</Text>
          <Text style={styles.bidAmount}>${currentBid}</Text>

          <TouchableOpacity style={styles.bidBtn} onPress={handlePlaceBid}>
            <Gavel size={16} color="black" />
            <Text style={styles.bidBtnText}>BID +$10</Text>
          </TouchableOpacity>
        </View>
      </MotiView>

      {/* Messages and Interaction */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.bottomSection}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.messageBubble}>
              <Text style={styles.messageUser}>{item.user}</Text>
              <Text style={styles.messageText}>{item.text}</Text>
            </View>
          )}
          style={styles.messageList}
          contentContainerStyle={{ paddingBottom: 20 }}
        />

        <View style={styles.inputRow}>
          <TextInput
            placeholder="Say something..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            style={styles.input}
          />
          <TouchableOpacity style={styles.iconBtn}>
            <Heart color="white" size={24} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, styles.accentBtn]}>
            <Zap color="white" size={24} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  backgroundVideo: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hostAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  hostName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF0050',
    marginRight: 4,
  },
  liveText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '900',
  },
  viewerCount: {
    color: 'white',
    fontSize: 10,
    marginLeft: 4,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  auctionCard: {
    position: 'absolute',
    right: 20,
    top: 150,
    width: 160,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  productImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
  },
  auctionDetails: {
    marginTop: 10,
    alignItems: 'center',
  },
  productName: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bidLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 8,
    fontWeight: '900',
    marginTop: 8,
  },
  bidAmount: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: '900',
  },
  bidBtn: {
    backgroundColor: 'white',
    width: '100%',
    height: 36,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  bidBtnText: {
    color: 'black',
    fontSize: 12,
    fontWeight: '900',
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    maxHeight: height * 0.4,
  },
  messageList: {
    flex: 1,
  },
  messageBubble: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 8,
    maxWidth: '80%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  messageUser: {
    color: colors.secondary,
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 2,
  },
  messageText: {
    color: 'white',
    fontSize: 13,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
    paddingHorizontal: 20,
    color: 'white',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  accentBtn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  }
});
