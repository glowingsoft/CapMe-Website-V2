import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import NotificationsView from 'src/sections/active-sections/notifications-view/notifications-view';


// ----------------------------------------------------------------------

const metadata = { title: `Notifications | ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <NotificationsView />
    </>
  );
}
