import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = 4000;

function configuredApiUrl(): string | undefined {
  const fromExtra = Constants.expoConfig?.extra?.apiUrl;
  if (typeof fromExtra === 'string' && fromExtra.trim()) {
    return fromExtra.replace(/\/$/, '');
  }
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv?.trim()) return fromEnv.replace(/\/$/, '');
  return undefined;
}

/** Metro / Expo Go host, e.g. "192.168.1.7:8081" — same machine as the Node API. */
function devMachineHost(): string | null {
  const debuggerHost = Constants.expoGoConfig?.debuggerHost;
  if (debuggerHost) {
    const host = debuggerHost.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') return host;
  }
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') return host;
  }
  return null;
}

function resolveServerUrl(): string {
  const configured = configuredApiUrl();
  if (configured) return configured;

  if (Platform.OS === 'web') {
    return `http://localhost:${API_PORT}`;
  }

  const devHost = devMachineHost();
  if (devHost) {
    return `http://${devHost}:${API_PORT}`;
  }

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${API_PORT}`;
  }

  return `http://localhost:${API_PORT}`;
}

export const SERVER_URL = resolveServerUrl();
export const API_URL = `${SERVER_URL}/api`;

if (__DEV__) {
  console.log('[Sankalp] API base:', API_URL);
}
