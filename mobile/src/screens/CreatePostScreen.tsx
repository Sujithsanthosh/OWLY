import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { X, Camera as CameraIcon, Image as ImageIcon, Check } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { pickAndUploadImage } from '../services/uploadService';

export default function CreatePostScreen({ navigation }: any) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [media, setMedia] = useState<any>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const requestPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
    if (status === 'granted') setShowCamera(true);
  };

  const handlePickImage = async () => {
    setLoading(true);
    const result = await pickAndUploadImage();
    if (result) {
      setMedia(result);
    }
    setLoading(false);
  };

  const handlePost = async () => {
    if (!content && !media) return;
    setLoading(true);
    // Logic to save post to backend would go here
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Success", "Post shared to your tribe!");
      navigation.goBack();
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <X color="white" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Post</Text>
        <TouchableOpacity onPress={handlePost} disabled={loading || (!content && !media)}>
          <Text style={[styles.postBtn, (loading || (!content && !media)) && { opacity: 0.5 }]}>Post</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TextInput
          placeholder="What's happening in your tribe?"
          placeholderTextColor={colors.textMuted}
          multiline
          style={styles.input}
          value={content}
          onChangeText={setContent}
        />

        {media ? (
          <View style={styles.mediaPreview}>
            <Image source={{ uri: media.url }} style={styles.previewImage} />
            <TouchableOpacity style={styles.removeMedia} onPress={() => setMedia(null)}>
              <X color="white" size={16} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.mediaButtons}>
            <TouchableOpacity style={styles.mediaBtn} onPress={requestPermission}>
              <CameraIcon color={colors.primary} size={24} />
              <Text style={styles.mediaBtnText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mediaBtn} onPress={handlePickImage}>
              <ImageIcon color={colors.secondary} size={24} />
              <Text style={styles.mediaBtnText}>Library</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  postBtn: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  content: {
    padding: 20,
  },
  input: {
    color: 'white',
    fontSize: 18,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
  },
  mediaBtn: {
    flex: 1,
    height: 100,
    backgroundColor: colors.surface,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  mediaBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  mediaPreview: {
    marginTop: 20,
    position: 'relative',
    borderRadius: 24,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    aspectRatio: 1,
  },
  removeMedia: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  }
});
