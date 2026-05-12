import { setSession } from './utils';
import { STORAGE_KEY, STORAGE_USER_KEY } from './constant';

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

  return {
    accessToken,
    userData: {
      ...apiUser,
      id: apiUser?.id ?? apiUser?._id ?? fallbackEmail,
      email: apiUser?.email ?? fallbackEmail,
      basicInfo: apiUser?.basicInfo ?? { name: displayName },
      displayName,
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
export const signUp = async ({ email, password, firstName, lastName }) => {
  const params = {
    email,
    password,
    firstName,
    lastName,
  };

  try {
    const res = await axios.post(endpoints.auth.signUp, params);

    const { accessToken } = res.data;

    if (!accessToken) {
      throw new Error('Access token not found in response');
    }

    sessionStorage.setItem(STORAGE_KEY, accessToken);
  } catch (error) {
    console.error('Error during sign up:', error);
    throw error;
  }
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async () => {
  try {
    await setSession(null);
    sessionStorage.removeItem(STORAGE_USER_KEY);
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};
