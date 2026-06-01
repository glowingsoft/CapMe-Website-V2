importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: 'AIzaSyBDLk3YCcKu30thVdai19TpEcpxFp5JDhU',
  authDomain: 'capme-72d73.firebaseapp.com',
  projectId: 'capme-72d73',
  storageBucket: 'capme-72d73.firebasestorage.app',
  messagingSenderId: '793149237331',
  appId: '1:793149237331:web:b09951d16f11c8c13dfea6',
  measurementId: 'G-3303TPS973',
};

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
