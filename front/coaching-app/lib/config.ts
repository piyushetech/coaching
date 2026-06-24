import { Platform } from 'react-native';

const API_PORT = 4000;
const FALLBACK_HOST = 'http://192.168.1.7:4000';

function resolveServerUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${API_PORT}`;
  }

  return FALLBACK_HOST;
}

export const SERVER_URL = resolveServerUrl();
export const API_URL = `${SERVER_URL}/api`;
