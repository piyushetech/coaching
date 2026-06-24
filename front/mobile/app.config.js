/** Loads .env before Expo reads EXPO_PUBLIC_* vars. */
import 'dotenv/config';
import appJson from './app.json';

// Fallback LAN IP for physical-device testing when .env is missing.
const FALLBACK_API_URL = 'http://192.168.1.7:4000';

const apiUrl = (process.env.EXPO_PUBLIC_API_URL || FALLBACK_API_URL).replace(/\/$/, '');

export default {
  expo: {
    ...appJson.expo,
    extra: {
      ...appJson.expo.extra,
      apiUrl
    }
  }
};
