import { setSession } from './utils';
import { STORAGE_KEY, STORAGE_USER_KEY } from './constant';

function createMockAccessToken(email) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  const payload = btoa(
    JSON.stringify({
      sub: email,
      email,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    })
  )
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

  return `${header}.${payload}.mock-signature`;
}

/** **************************************
 * Sign in
 *************************************** */
export const signInWithPassword = async ({ email, password, role, user_type }) => {
  try {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const accessToken = createMockAccessToken(email);
    const userData = {
      id: email,
      email,
      basicInfo: { name: email.split('@')[0] },
      displayName: email.split('@')[0],
      role: role || (user_type === 1 ? 'admin' : 'user'),
      permission: user_type === 1 ? 1 : 2,
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
