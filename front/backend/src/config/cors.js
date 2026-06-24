/**
 * CORS for web clients (Expo web, Angular dev server, LAN testing).
 * Native Expo Go / React Native apps send no Origin header — always allowed.
 */

const explicitOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const LOCALHOST = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const PRIVATE_LAN =
  /^https?:\/\/(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/;
const EXPO_TUNNEL = /^https?:\/\/[\w-]+\.(exp\.direct|expo\.dev|ngrok(?:-free)?\.app)(:\d+)?$/;

export function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (explicitOrigins.includes(origin)) return true;
  if (LOCALHOST.test(origin)) return true;
  if (PRIVATE_LAN.test(origin)) return true;
  if (EXPO_TUNNEL.test(origin)) return true;
  // Dev: allow any origin so Expo web / mobile browser testing never hits CORS
  if (process.env.NODE_ENV !== 'production') return true;
  return false;
}

export function applyCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
}

export const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, origin || true);
    } else {
      callback(new Error(`CORS blocked origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
};
