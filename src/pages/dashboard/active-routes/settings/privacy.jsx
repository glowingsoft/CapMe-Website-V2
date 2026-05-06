import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/config-global';
import PrivacyPolicyView from 'src/sections/active-sections/settings-view/privacy-policy-view';

const metadata = { title: `Privacy Policy | ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>
      <PrivacyPolicyView />
    </>
  );
}
