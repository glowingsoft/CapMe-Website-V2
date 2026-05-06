import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/config-global';
import SubscriptionView from 'src/sections/active-sections/subscription-view/subscription-view';

const metadata = { title: `Subscription | ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>
      <SubscriptionView />
    </>
  );
}
