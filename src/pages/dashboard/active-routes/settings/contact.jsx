import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/config-global';
import ContactUsView from 'src/sections/active-sections/settings-view/contact-us-view';

const metadata = { title: `Contact Us | ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>
      <ContactUsView />
    </>
  );
}
