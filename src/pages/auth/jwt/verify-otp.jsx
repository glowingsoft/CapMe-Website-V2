import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { JwtVerifyOtpView } from 'src/sections/auth/jwt/jwt-verify-otp-view';

// ----------------------------------------------------------------------

const metadata = { title: `Verify OTP | ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <JwtVerifyOtpView />
    </>
  );
}
