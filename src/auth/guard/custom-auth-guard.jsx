import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { SplashScreen } from 'src/components/loading-screen';

import { useAuthContext } from 'src/auth/hooks';
import { signOut } from 'src/auth/context/jwt/action';
import { logout } from 'src/store/slices/userSlice';

const ProtectedRoute = ({ children, requiredPermission }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { checkUserSession } = useAuthContext();

  const { user } = useSelector((state) => state.user);

  const hasPermission = Array.isArray(requiredPermission)
    ? requiredPermission.includes(user?.permission)
    : user?.permission === requiredPermission;

  const isWrongAccount = Boolean(user) && !hasPermission;

  useEffect(() => {
    if (!isWrongAccount) return;

    (async () => {
      await signOut();
      dispatch(logout());
      await checkUserSession?.();
      router.replace(paths.auth.jwt.signIn);
    })();
  }, [isWrongAccount, dispatch, checkUserSession, router]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (isWrongAccount) {
    return <SplashScreen />;
  }

  // Render children or nested routes if all checks pass
  return children || <Outlet />;
};

export default ProtectedRoute;
