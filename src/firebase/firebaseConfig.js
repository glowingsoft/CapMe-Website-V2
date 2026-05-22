// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getMessaging } from 'firebase/messaging';

// Your web app's Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Messaging service
export const messaging = getMessaging(app);
