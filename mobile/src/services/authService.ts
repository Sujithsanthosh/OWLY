import axios from 'axios';
import { API_URL } from '../config';

export const getAuthToken = async () => {
  // In a real app, use SecureStore from expo-secure-store
  // For now, mocking token retrieval
  return "mock-token";
};
