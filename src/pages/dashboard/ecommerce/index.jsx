import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/config-global';
import ExploreView from 'src/sections/active-sections/explore-view/explore-view';

const metadata = { title: `Explore | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <ExploreView />
    </>
  );
}
