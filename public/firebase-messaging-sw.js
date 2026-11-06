importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

// Config is passed in the registration URL by src/firebase/get-fcm-token.js
// (values come from VITE_FIREBASE_* in .env), so no keys live in this file.
const firebaseConfig = Object.fromEntries(new URL(self.location.href).searchParams);

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  firebase.initializeApp(firebaseConfig);

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification?.title ?? 'Capme';
    const notificationOptions = {
      body: payload.notification?.body ?? '',
      icon: payload.notification?.image ?? '/logo.png',
      data: payload.data ?? {},
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}
