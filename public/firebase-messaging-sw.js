// Scripts for firebase and firebase messaging
// importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
// importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

importScripts('https://gstatic.com');
importScripts('https://gstatic.com');

// Initialize the Firebase app in the service worker
// "Default" Firebase configuration (prevents errors)
const defaultConfig = {
  apiKey: true,
  projectId: true,
  messagingSenderId: true,
  appId: true,
};

// const firebaseConfig = {
//   apiKey: 'AIzaSyC2YbVXDesS4TtiaGMH_ZyiKJm1od0X354',
//   authDomain: 'palato-a508d.firebaseapp.com',
//   projectId: 'palato-a508d',
//   storageBucket: 'palato-a508d.firebasestorage.app',
//   messagingSenderId: '748562398718',
//   appId: '1:748562398718:web:a2c111d4cb10b5f5d914af',
//   measurementId: 'G-N1K5VKCMNC',
// };

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

// Retrieve firebase messaging
const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  console.log('Bg Paylod', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image,
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
