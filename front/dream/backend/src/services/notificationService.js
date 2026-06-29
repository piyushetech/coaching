const { Notification } = require('../models');

let firebaseAdmin = null;

const PLACEHOLDER_PATTERN = /your-|xxx|changeme|placeholder/i;

const isFirebaseConfigured = () => {
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    return false;
  }
  if (
    PLACEHOLDER_PATTERN.test(FIREBASE_PROJECT_ID) ||
    PLACEHOLDER_PATTERN.test(FIREBASE_CLIENT_EMAIL) ||
    PLACEHOLDER_PATTERN.test(FIREBASE_PRIVATE_KEY)
  ) {
    return false;
  }
  const privateKey = FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
  return privateKey.includes('BEGIN PRIVATE KEY');
};

const initFirebase = () => {
  if (!isFirebaseConfigured()) {
    if (process.env.NODE_ENV === 'development') {
      console.info('Firebase FCM disabled (set valid FIREBASE_* env vars to enable push notifications).');
    }
    return;
  }

  try {
    firebaseAdmin = require('firebase-admin');
    if (!firebaseAdmin.apps.length) {
      firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      console.info('Firebase FCM initialized.');
    }
  } catch (err) {
    console.warn('Firebase initialization failed:', err.message);
    firebaseAdmin = null;
  }
};

const sendPushNotification = async (user, title, body, data = {}) => {
  await Notification.create({
    user: user._id || user,
    title,
    body,
    type: data.type || 'system',
    data,
  });

  if (firebaseAdmin && user.fcmToken) {
    try {
      await firebaseAdmin.messaging().send({
        token: user.fcmToken,
        notification: { title, body },
        data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
      });
    } catch (err) {
      console.warn('FCM send failed:', err.message);
    }
  }
};

initFirebase();

module.exports = { sendPushNotification, initFirebase };
