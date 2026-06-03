import Constants from 'expo-constants';

// For development, use your machine's IP address.
// You can find it by running 'ipconfig' (Windows) or 'ifconfig' (Mac/Linux)
const DEV_IP = '192.168.1.10'; // <--- CHANGE THIS TO YOUR LOCAL IP

export const API_URL = __DEV__
  ? `http://${DEV_IP}:5000/api`
  : 'https://api.owly.app/api';

export const SOCKET_URL = __DEV__
  ? `http://${DEV_IP}:5000`
  : 'https://api.owly.app';
