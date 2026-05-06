import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import ActivityFeedView from 'src/sections/active-sections/activity-feed-view/activity-feed-view';

// ----------------------------------------------------------------------

const metadata = { title: `Activity Feed | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <ActivityFeedView />
    </>
  );
}
