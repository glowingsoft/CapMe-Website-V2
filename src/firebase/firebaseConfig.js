import { initializeApp } from 'firebase/app';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyBDLk3YCcKu30thVdai19TpEcpxFp5JDhU',
  authDomain: 'capme-72d73.firebaseapp.com',
  projectId: 'capme-72d73',
  storageBucket: 'capme-72d73.firebasestorage.app',
  messagingSenderId: '793149237331',
  appId: '1:793149237331:web:b09951d16f11c8c13dfea6',
  measurementId: 'G-3303TPS973',
};

const app = initializeApp(firebaseConfig);

// messaging is null on unsupported browsers (iOS Safari non-PWA, etc.)
export let messaging = null;

export const messagingReady = isSupported()
  .then((supported) => {
    if (supported) messaging = getMessaging(app);
    return messaging;
  })
  .catch(() => null);
