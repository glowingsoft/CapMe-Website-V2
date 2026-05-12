import { useAuth0 } from '@auth0/auth0-react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import Button from '@mui/material/Button';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';

import { toast } from 'src/components/snackbar';

import { signOut as amplifySignOut } from 'src/auth/context/amplify/action';
import { signOut as firebaseSignOut } from 'src/auth/context/firebase/action';
import { signOut as jwtSignOut } from 'src/auth/context/jwt/action';
import { signOut as supabaseSignOut } from 'src/auth/context/supabase/action';
import { useAuthContext } from 'src/auth/hooks';
import { logout } from 'src/store/slices/userSlice';
import { walletsApi } from 'src/store/Reducer/wallets-api';
import { categoriesApi } from 'src/store/Reducer/categories-api';
import { authApi } from 'src/store/Reducer/auth';

// ----------------------------------------------------------------------

const signOut =
  (CONFIG.auth.method === 'supabase' && supabaseSignOut) ||
  (CONFIG.auth.method === 'firebase' && firebaseSignOut) ||
  (CONFIG.auth.method === 'amplify' && amplifySignOut) ||
  jwtSignOut;

// ----------------------------------------------------------------------

export function SignOutButton({ onClose, ...other }) {
  const router = useRouter();
  const dispatch = useDispatch();

  const { checkUserSession } = useAuthContext();
  const { logout: signOutAuth0 } = useAuth0();

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      await checkUserSession?.();

      // Clear all RTK Query caches
      dispatch(walletsApi.util.resetApiState());
      dispatch(categoriesApi.util.resetApiState());
      dispatch(authApi.util.resetApiState());

      // Logout user
      dispatch(logout());

      // Clear localStorage
      localStorage.clear();

      // Close modal if open
      onClose?.();

      // Redirect to login
      router.replace(paths.auth.jwt.signIn);

      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Unable to logout!');
    }
  }, [checkUserSession, dispatch, onClose, router]);

  const handleLogoutAuth0 = useCallback(async () => {
    try {
      await signOutAuth0();

      // Clear all RTK Query caches
      dispatch(walletsApi.util.resetApiState());
      dispatch(categoriesApi.util.resetApiState());
      dispatch(authApi.util.resetApiState());

      onClose?.();
      router.refresh();

      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Unable to logout!');
    }
  }, [onClose, router, signOutAuth0, dispatch]);

  return (
    <Button
      fullWidth
      variant="soft"
      size="large"
      color="error"
      onClick={CONFIG.auth.method === 'auth0' ? handleLogoutAuth0 : handleLogout}
      {...other}
    >
      Logout
    </Button>
  );
}

// import { useAuth0 } from '@auth0/auth0-react';
// import { useCallback } from 'react';

// import Button from '@mui/material/Button';

// import { useRouter } from 'src/routes/hooks';

// import { CONFIG } from 'src/config-global';

// import { toast } from 'src/components/snackbar';

// import { useDispatch } from 'react-redux';
// import { signOut as amplifySignOut } from 'src/auth/context/amplify/action';
// import { signOut as firebaseSignOut } from 'src/auth/context/firebase/action';
// import { signOut as jwtSignOut } from 'src/auth/context/jwt/action';
// import { signOut as supabaseSignOut } from 'src/auth/context/supabase/action';
// import { useAuthContext } from 'src/auth/hooks';
// import { logout } from 'src/store/slices/userSlice';

// // ----------------------------------------------------------------------

// const signOut =
//   (CONFIG.auth.method === 'supabase' && supabaseSignOut) ||
//   (CONFIG.auth.method === 'firebase' && firebaseSignOut) ||
//   (CONFIG.auth.method === 'amplify' && amplifySignOut) ||
//   jwtSignOut;

// // ----------------------------------------------------------------------

// export function SignOutButton({ onClose, ...other }) {
//   const router = useRouter();
//   const dispatch = useDispatch();

//   const { checkUserSession } = useAuthContext();

//   const { logout: signOutAuth0 } = useAuth0();

//   // const handleLogout = useCallback(async () => {
//   //   try {
//   //     await signOut();
//   //     await checkUserSession?.();

//   //     onClose?.();
//   //     router.refresh();
//   //   } catch (error) {
//   //     console.error(error);
//   //     toast.error('Unable to logout!');
//   //   }
//   // }, [checkUserSession, onClose, router]);


//   const handleLogout = async () => {
//     try {
//       dispatch(logout());
//       localStorage.clear();
//       router.replace('/');
//     } catch (error) {
//       console.error(error);
//       toast.error('Unable to logout!', { variant: 'error' });
//     }
//   };

//   const handleLogoutAuth0 = useCallback(async () => {
//     try {
//       await signOutAuth0();

//       onClose?.();
//       router.refresh();
//     } catch (error) {
//       console.error(error);
//       toast.error('Unable to logout!');
//     }
//   }, [onClose, router, signOutAuth0]);

//   return (
//     <Button
//       fullWidth
//       variant="soft"
//       size="large"
//       color="error"
//       onClick={CONFIG.auth.method === 'auth0' ? handleLogoutAuth0 : handleLogout}
//       {...other}
//     >
//       Logout
//     </Button>
//   );
// }
