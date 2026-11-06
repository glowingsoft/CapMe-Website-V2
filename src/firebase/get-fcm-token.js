import { getToken } from 'firebase/messaging';

import { firebaseConfig, messagingReady } from './firebaseConfig';

export async function getFcmToken() {
  try {
    const msg = await messagingReady;
    if (!msg) return null;

    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return null;
    }

    // Files in public/ can't read import.meta.env, so hand the config to the SW via its URL.
    const swParams = new URLSearchParams(
      Object.entries(firebaseConfig).filter(([, value]) => Boolean(value))
    );
    const serviceWorkerRegistration = await navigator.serviceWorker.register(
      `${import.meta.env.BASE_URL}firebase-messaging-sw.js?${swParams}`
    );
    await navigator.serviceWorker.ready;

    return await getToken(msg, {
      vapidKey: import.meta.env.VITE_VAPID_KEY,
      serviceWorkerRegistration,
    });
  } catch (err) {
    console.warn('[FCM] getToken failed (unsupported env):', err?.message);
    return null;
  }
}
