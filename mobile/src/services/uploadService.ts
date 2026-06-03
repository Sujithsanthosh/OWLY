import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { getAuthToken } from './authService';
import { API_URL } from '../config';

export const pickAndUploadImage = async () => {
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (permissionResult.granted === false) {
    alert("Permission to access camera roll is required!");
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.All,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });

  if (!result.canceled) {
    const formData = new FormData();
    const uri = result.assets[0].uri;
    const type = result.assets[0].type;
    const name = uri.split('/').pop();

    formData.append('file', {
      uri,
      type: type === 'video' ? 'video/mp4' : 'image/jpeg',
      name,
    } as any);

    const token = await getAuthToken();

    try {
      const response = await axios.post(`${API_URL}/upload/single`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });
      return response.data;
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    }
  }
  return null;
};
