import { getToken } from 'firebase/messaging';

import { messagingReady } from './firebaseConfig';

export async function getFcmToken() {
  const msg = await messagingReady;
  if (!msg) return null;

  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  const serviceWorkerRegistration = await navigator.serviceWorker.register(
    `${import.meta.env.BASE_URL}firebase-messaging-sw.js`
  );
  await navigator.serviceWorker.ready;

  return getToken(msg, {
    vapidKey: import.meta.env.VITE_VAPID_KEY,
    serviceWorkerRegistration,
  });
}
