import { initializeApp } from 'firebase/app';
import { getMessaging, isSupported } from 'firebase/messaging';

// Values come from .env (see .env.example). The service worker receives the
// same config through its registration URL — see get-fcm-token.js.
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

if (!isConfigured) {
  console.warn('[Firebase] VITE_FIREBASE_* env vars missing — push notifications disabled.');
}

const app = isConfigured ? initializeApp(firebaseConfig) : null;

// messaging is null on unsupported browsers (iOS Safari non-PWA, etc.) or when unconfigured
export let messaging = null;

export const messagingReady = (app ? isSupported() : Promise.resolve(false))
  .then((supported) => {
    if (supported) messaging = getMessaging(app);
    return messaging;
  })
  .catch(() => null);
