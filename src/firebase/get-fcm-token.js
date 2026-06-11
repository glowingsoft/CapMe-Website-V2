import { getToken } from 'firebase/messaging';

import { messaging } from './firebaseConfig';

export async function getFcmToken() {
  const vapidKey = import.meta.env.VITE_VAPID_KEY;

  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  const serviceWorkerRegistration = await navigator.serviceWorker.register(
    `${import.meta.env.BASE_URL}firebase-messaging-sw.js`
  );
  await navigator.serviceWorker.ready;

  return getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration,
  });
}
