import { setSession } from './utils';
import { STORAGE_KEY, STORAGE_USER_KEY } from './constant';
import { stripDoubleS3Prefix } from 'src/utils/message-utils';

const FCM_TOKEN_STORAGE_KEY = 'capme_fcm_token';
const FALLBACK_DEVICE_ID_KEY = 'capme_ios_device_id';

function isIOS() {
  return typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isMacSafari() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /Macintosh/.test(ua) && /Safari/.test(ua) && !/Chrome|Chromium|CriOS/.test(ua);
}

// Stable per-browser ID for when there's no FCM token (iOS/Safari, notifications
// declined, in-app browsers/WebViews). The backend requires a non-empty device_id.
function getOrCreateFallbackDeviceId() {
  try {
    const stored = localStorage.getItem(FALLBACK_DEVICE_ID_KEY);
    if (stored) return stored;
    const id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `web-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(FALLBACK_DEVICE_ID_KEY, id);
    return id;
  } catch {
    return `web-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

function getClientTimeZone() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz || 'UTC';
  } catch (error) {
    return 'UTC';
  }
}

function getStoredFcmToken() {
  try {
    return localStorage.getItem(FCM_TOKEN_STORAGE_KEY);
  } catch (error) {
    return null;
  }
}

function storeFcmToken(token) {
  if (!token) return;

  try {
    localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
  } catch (error) {
    console.error('[FCM] Unable to cache token:', error);
  }
}

async function requestFcmToken() {
  try {
    if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
      return null;
    }

    const [{ getFcmToken }, { store }, { setToken }] = await Promise.all([
      import('src/firebase/get-fcm-token'),
      import('src/store/store'),
      import('src/store/slices/userSlice'),
    ]);

    const token = await getFcmToken();

    if (token) {
      store.dispatch(setToken(token));
      storeFcmToken(token);
    }

    return token;
  } catch (error) {
    console.error('[FCM] Unable to retrieve token for device_id:', error);
    return null;
  }
}

async function getDeviceId() {
  // iOS and macOS Safari don't support FCM reliably — use a stable random ID instead
  if (isIOS() || isMacSafari()) return getOrCreateFallbackDeviceId();

  try {
    const { store } = await import('src/store/store');
    const fcmToken = store.getState().user?.device_id;
    if (fcmToken) return fcmToken;
  } catch (_) {}

  const storedFcmToken = getStoredFcmToken();
  if (storedFcmToken) return storedFcmToken;

  const requestedFcmToken = await requestFcmToken();
  if (requestedFcmToken) return requestedFcmToken;

  // No push token available (permission denied/dismissed, WebView, unsupported browser).
  // Sign-up/login still need a device_id, so fall back to a stable ID — push just won't
  // reach this device until a later login with notifications allowed.
  return getOrCreateFallbackDeviceId();
}

function findAccessToken(payload) {
  if (!payload || typeof payload !== 'object') return null;

  // Backend sends token at: response.body.accesstoken (lowercase 'a')
  const accesstoken = payload?.body?.accesstoken;
  if (typeof accesstoken === 'string' && accesstoken) {
    return accesstoken;
  }

  return null;
}

function findUserObject(payload) {
  if (!payload || typeof payload !== 'object') return {};

  // Backend returns entire user object at body level
  return payload?.body ?? {};
}

function normalizeLoginResponse(response, fallbackEmail, fallbackUserType) {
  const payload = response ?? {};
  const accessToken = findAccessToken(payload);

  if (!accessToken) {
    console.error('Unexpected login response shape:', payload);
    throw new Error('Access token not found in login response');
  }

  const apiUser = findUserObject(payload);
  const userType = apiUser?.user_type ?? fallbackUserType ?? 2;
  const displayName = apiUser?.name ?? fallbackEmail?.split('@')?.[0] ?? 'User';
  const photoURL = stripDoubleS3Prefix(apiUser?.image ?? apiUser?.photoURL ?? null);

  return {
    accessToken,
    userData: {
      ...apiUser,
      id: apiUser?.id ?? apiUser?._id ?? fallbackEmail,
      _id: apiUser?._id ?? apiUser?.id ?? fallbackEmail,
      email: apiUser?.email ?? fallbackEmail,
      photoURL,
      displayName,
      mobile: apiUser?.mobile ?? '',
      basicInfo: {
        ...(apiUser?.basicInfo ?? {}),
        _id: apiUser?._id ?? apiUser?.id ?? '',
        name: displayName,
        email: apiUser?.email ?? fallbackEmail,
        mobile: apiUser?.mobile ?? '',
        image: photoURL,
      },
      role: userType === 1 ? 'admin' : 'user',
      permission: userType,
      token: accessToken,
    },
  };
}

/** **************************************
 * Sign in
 *************************************** */
export const signInWithPassword = async ({ email, password, role, user_type }) => {
  try {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const timezone = getClientTimeZone();
    const deviceId = await getDeviceId();
    const loginPayload = {
      email,
      password,
      timezone,
      user_type: user_type ?? 2,
      language: 'de',
      device_id: deviceId,
      device_type: 'web',
    };

    const { authApi } = await import('src/store/Reducer/auth');
    const { store } = await import('src/store/store');
    const response = await store.dispatch(authApi.endpoints.login.initiate(loginPayload)).unwrap();
    const normalized = normalizeLoginResponse(response, email, loginPayload.user_type);
    const accessToken = normalized.accessToken;
    const userData = {
      ...normalized.userData,
      role: role || normalized.userData.role,
    };

    await setSession(accessToken);
    sessionStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userData));

    return userData;
  } catch (error) {
    console.error('Error during sign in:', error?.message, error?.stack);
    throw error;
  }
};

/** **************************************
 * Sign up
 *************************************** */
export const signUp = async ({ name, email, password, phone, image = 'noImg.png', user_type = 2 }) => {
  try {
    const timezone = getClientTimeZone();
    const deviceId = await getDeviceId();

    const { authApi } = await import('src/store/Reducer/auth');
    const { store } = await import('src/store/store');

    const response = await store
      .dispatch(
        authApi.endpoints.register.initiate({
          name,
          email,
          password,
          phone,
          timezone,
          image,
          device_id: deviceId,
          device_type: 'web',
          user_type,
        })
      )
      .unwrap();

    return response;
  } catch (error) {
    console.error('Error during sign up:', error);
    throw error;
  }
};

/** **************************************
 * Google / Social sign in
 *************************************** */
export const signInWithGoogle = async (googleUser) => {
  try {
    const timezone = getClientTimeZone();
    const deviceId = await getDeviceId();

    const body = {
      social_id: googleUser.sub,
      social_type: 'google',
      email: googleUser.email,
      name: googleUser.name,

      ...(googleUser.picture && { image: googleUser.picture }),
      device_id: deviceId,
      device_type: 'web',
      timezone,
    };

    const { authApi } = await import('src/store/Reducer/auth');
    const { store } = await import('src/store/store');
    const response = await store.dispatch(authApi.endpoints.socialLogin.initiate(body)).unwrap();
    const normalized = normalizeLoginResponse(response, googleUser.email, 2);

    const hasStoredImage = normalized.userData.photoURL && !normalized.userData.photoURL.includes('noImg');

    if (!hasStoredImage && googleUser.picture) {
      normalized.userData.photoURL = googleUser.picture;
      if (normalized.userData.basicInfo) {
        normalized.userData.basicInfo.image = googleUser.picture;
      }
    }

    normalized.userData.loginMethod = 'social';

    await setSession(normalized.accessToken);
    sessionStorage.setItem(STORAGE_USER_KEY, JSON.stringify(normalized.userData));

    return normalized.userData;
  } catch (error) {
    console.error('Error during Google sign in:', error);
    throw error;
  }
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async () => {
  try {
    // Hit the backend logout endpoint (fire-and-forget — don't block local cleanup on failure)
    const { authApi } = await import('src/store/Reducer/auth');
    const { store } = await import('src/store/store');
    await store
      .dispatch(authApi.endpoints.logout.initiate())
      .unwrap()
      .catch(() => {});

    await setSession(null);
    sessionStorage.removeItem(STORAGE_USER_KEY);
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};
