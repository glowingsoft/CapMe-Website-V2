import { setSession } from './utils';
import { STORAGE_KEY, STORAGE_USER_KEY } from './constant';
import { stripDoubleS3Prefix } from 'src/utils/message-utils';

const DEVICE_ID_STORAGE_KEY = 'capme_device_id';

function getClientTimeZone() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz || 'UTC';
  } catch (error) {
    return 'UTC';
  }
}

function createDeviceId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `device-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getClientDeviceId() {
  try {
    const existingId = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
    if (existingId) return existingId;

    const newId = createDeviceId();
    localStorage.setItem(DEVICE_ID_STORAGE_KEY, newId);
    return newId;
  } catch (error) {
    return createDeviceId();
  }
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
    const deviceId = getClientDeviceId();
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
    console.error('Error during sign in:', error);
    throw error;
  }
};

/** **************************************
 * Sign up
 *************************************** */
export const signUp = async ({ name, email, password, phone, image = 'noImg.png', user_type = 2 }) => {
  try {
    const timezone = getClientTimeZone();
    const deviceId = getClientDeviceId();

    const { authApi } = await import('src/store/Reducer/auth');
    const { store } = await import('src/store/store');

    const response = await store.dispatch(
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
    ).unwrap();

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
    const deviceId = getClientDeviceId();

    const body = {
      social_id: googleUser.sub,
      social_type: 'google',
      email: googleUser.email,
      name: googleUser.name,
      device_id: deviceId,
      device_type: 'web',
      timezone,
    };

    const { authApi } = await import('src/store/Reducer/auth');
    const { store } = await import('src/store/store');
    const response = await store.dispatch(authApi.endpoints.socialLogin.initiate(body)).unwrap();
    const normalized = normalizeLoginResponse(response, googleUser.email, 2);

    // If the backend has no stored image yet (new account), display Google picture locally.
    // We do not push it to the backend so subsequent logins never overwrite a custom DP.
    const hasStoredImage =
      normalized.userData.photoURL &&
      !normalized.userData.photoURL.includes('noImg');

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
    await store.dispatch(authApi.endpoints.logout.initiate()).unwrap().catch(() => {});

    await setSession(null);
    sessionStorage.removeItem(STORAGE_USER_KEY);
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};
