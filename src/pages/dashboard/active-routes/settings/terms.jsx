import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/config-global';
import TermsView from 'src/sections/active-sections/settings-view/terms-view';

const metadata = { title: `Terms & Conditions | ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>
      <TermsView />
    </>
  );
}
