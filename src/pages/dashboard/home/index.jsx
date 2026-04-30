import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import HomeView from 'src/sections/active-sections/home-view/home-view';

// ----------------------------------------------------------------------

const metadata = { title: `Home - Capme` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <HomeView />
    </>
  );
}
