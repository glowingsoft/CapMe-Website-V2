import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { useRouter, useSearchParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';

import { SplashScreen } from 'src/components/loading-screen';

import { useAuthContext } from '../hooks';
import { selectUser } from 'src/store/slices/userSlice';

// ----------------------------------------------------------------------

export function GuestGuard({ children }) {
  const router = useRouter();

  const searchParams = useSearchParams();

  const { loading, authenticated } = useAuthContext();
  const reduxUser = useSelector(selectUser);

  const [isChecking, setIsChecking] = useState(true);

  const returnTo = searchParams.get('returnTo') || CONFIG.auth.redirectPath;

  const checkPermissions = async () => {
    if (loading) {
      return;
    }

    if (authenticated || reduxUser) {
      router.replace(returnTo);
      return;
    }

    setIsChecking(false);
  };

  useEffect(() => {
    checkPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, loading, reduxUser]);

  if (isChecking) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}
