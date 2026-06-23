import 'src/global.css';

// ----------------------------------------------------------------------

import { GoogleOAuthProvider } from '@react-oauth/google';
import { Router } from 'src/routes/sections';

import { useScrollToTop } from 'src/hooks/use-scroll-to-top';

import { CONFIG } from 'src/config-global';
import { LocalizationProvider } from 'src/locales';
import { I18nProvider } from 'src/locales/i18n-provider';
import { ThemeProvider } from 'src/theme/theme-provider';

import { MotionLazy } from 'src/components/animate/motion-lazy';
import { ProgressBar } from 'src/components/progress-bar';
import { defaultSettings, SettingsDrawer, SettingsProvider } from 'src/components/settings';
import { Snackbar, toast } from 'src/components/snackbar';

import { CheckoutProvider } from 'src/sections/checkout/context';

import { onMessage } from 'firebase/messaging';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AuthProvider as AmplifyAuthProvider } from 'src/auth/context/amplify';
import { AuthProvider as Auth0AuthProvider } from 'src/auth/context/auth0';
import { AuthProvider as FirebaseAuthProvider } from 'src/auth/context/firebase';
import { AuthProvider as JwtAuthProvider } from 'src/auth/context/jwt';
import { AuthProvider as SupabaseAuthProvider } from 'src/auth/context/supabase';
import { CustomToast } from './components/CustomToast';
import { RightDrawer } from './components/settings/drawer/right-drawer';
import { messagingReady } from './firebase/firebaseConfig';
import { getFcmToken } from './firebase/get-fcm-token';
import { setToken } from './store/slices/userSlice';
import { addNotification } from './store/slices/notificationsSlice';

// ----------------------------------------------------------------------

const FCM_TOKEN_STORAGE_KEY = 'capme_fcm_token';

const AuthProvider =
  (CONFIG.auth.method === 'amplify' && AmplifyAuthProvider) ||
  (CONFIG.auth.method === 'firebase' && FirebaseAuthProvider) ||
  (CONFIG.auth.method === 'supabase' && SupabaseAuthProvider) ||
  (CONFIG.auth.method === 'auth0' && Auth0AuthProvider) ||
  JwtAuthProvider;

export default function App() {
  const dispatch = useDispatch();

  useScrollToTop();

  useEffect(() => {
    async function requestPermission() {
      try {
        if (typeof Notification === 'undefined') return;
        const msg = await messagingReady;
        if (!msg) return;

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const token = await getFcmToken();
          if (token) {
            dispatch(setToken(token));
            localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
          }
        }
      } catch (error) {
        console.error('[FCM] Unable to initialize notifications:', error);
      }
    }
    requestPermission();
  }, [dispatch]);

  useEffect(() => {
    let unsubscribe;
    messagingReady
      .then((msg) => {
        if (!msg) return;
        unsubscribe = onMessage(msg, (payload) => {
          dispatch(addNotification({
            title: payload?.notification?.title ?? 'Notification',
            body: payload?.notification?.body ?? '',
            image: payload?.notification?.image ?? null,
            data: payload?.data ?? {},
          }));
          toast.custom((t) => (
            <CustomToast payload={payload} t={t} />
          ), {
            duration: 5000,
            style: { background: 'transparent', boxShadow: 'none', padding: 0, border: 'none' },
          });
        });
      })
      .catch((err) => {
        console.warn('[FCM] onMessage setup failed:', err?.message);
      });
    return () => unsubscribe?.();
  }, [dispatch]);


  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''}>
      <I18nProvider>
        <LocalizationProvider>
          <AuthProvider>
            <SettingsProvider settings={defaultSettings}>
              <ThemeProvider>
                <MotionLazy>
                  <CheckoutProvider>
                    <Snackbar />
                    <ProgressBar />
                    <RightDrawer />
                    <Router />
                  </CheckoutProvider>
                </MotionLazy>
              </ThemeProvider>
            </SettingsProvider>
          </AuthProvider>
        </LocalizationProvider>
      </I18nProvider>
    </GoogleOAuthProvider>
  );
}
