import Constants from 'expo-constants';

export const API_URL =
  Constants.expoConfig?.extra?.apiUrl || 'http://localhost:5000/api';
export const SOCKET_URL =
  Constants.expoConfig?.extra?.socketUrl || 'http://localhost:5000';

export const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY || '';
