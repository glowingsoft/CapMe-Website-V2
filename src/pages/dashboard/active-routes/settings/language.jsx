import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/config-global';
import LanguageView from 'src/sections/active-sections/settings-view/language-view';

const metadata = { title: `App Language | ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>
      <LanguageView />
    </>
  );
}
