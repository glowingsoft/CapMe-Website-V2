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

import { getToken, onMessage } from 'firebase/messaging';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AuthProvider as AmplifyAuthProvider } from 'src/auth/context/amplify';
import { AuthProvider as Auth0AuthProvider } from 'src/auth/context/auth0';
import { AuthProvider as FirebaseAuthProvider } from 'src/auth/context/firebase';
import { AuthProvider as JwtAuthProvider } from 'src/auth/context/jwt';
import { AuthProvider as SupabaseAuthProvider } from 'src/auth/context/supabase';
import { CustomToast } from './components/CustomToast';
import { RightDrawer } from './components/settings/drawer/right-drawer';
import { messaging } from './firebase/firebaseConfig';
import { setToken } from './store/slices/userSlice';

// ----------------------------------------------------------------------

const AuthProvider =
  (CONFIG.auth.method === 'amplify' && AmplifyAuthProvider) ||
  (CONFIG.auth.method === 'firebase' && FirebaseAuthProvider) ||
  (CONFIG.auth.method === 'supabase' && SupabaseAuthProvider) ||
  (CONFIG.auth.method === 'auth0' && Auth0AuthProvider) ||
  JwtAuthProvider;

export default function App() {
  const dispatch = useDispatch();
  const REACT_APP_VAPID_KEY = import.meta.env.VITE_VAPID_KEY

  useScrollToTop();

  async function requestPermission() {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: REACT_APP_VAPID_KEY,
      });

      console.log("token", token);

      dispatch(setToken(token));

    } else if (permission === "denied") {
      console.log("You denied for the notification");
    }
  }

  useEffect(() => {
    requestPermission();
  }, []);

  onMessage(messaging, (payload) => {
    console.log('Message received. ', payload);

    toast.custom((t) => (
      <CustomToast payload={payload} t={t} />
    ), {
      style: { background: 'transparent', boxShadow: 'none', padding: 0, border: 'none' },
    });
  });


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
