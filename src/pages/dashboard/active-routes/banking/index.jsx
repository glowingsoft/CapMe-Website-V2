import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import ChatMeView from 'src/sections/active-sections/chat-me-view/chat-me-view';

// ----------------------------------------------------------------------

const metadata = { title: `Chat Me | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <ChatMeView />
    </>
  );
}
