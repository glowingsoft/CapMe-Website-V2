// core (MUI)
import { frFR as frFRCore, deDE as deDECore } from '@mui/material/locale';
// date pickers (MUI)
import { enUS as enUSDate, frFR as frFRDate, deDE as deDEDate } from '@mui/x-date-pickers/locales';
// data grid (MUI)
import {
  enUS as enUSDataGrid,
  frFR as frFRDataGrid,
  deDE as deDEDataGrid,
} from '@mui/x-data-grid/locales';

// ----------------------------------------------------------------------

export const allLangs = [
  {
    value: 'en',
    label: 'English',
    countryCode: 'GB',
    adapterLocale: 'en',
    numberFormat: { code: 'en-US', currency: 'USD' },
    systemValue: {
      components: { ...enUSDate.components, ...enUSDataGrid.components },
    },
  },
  {
    value: 'de',
    label: 'Deutsch',
    countryCode: 'DE',
    adapterLocale: 'de',
    numberFormat: { code: 'de-DE', currency: 'EUR' },
    systemValue: {
      components: { ...deDECore.components, ...deDEDate.components, ...deDEDataGrid.components },
    },
  },
  {
    value: 'fr',
    label: 'Français',
    countryCode: 'FR',
    adapterLocale: 'fr',
    numberFormat: { code: 'fr-FR', currency: 'EUR' },
    systemValue: {
      components: { ...frFRCore.components, ...frFRDate.components, ...frFRDataGrid.components },
    },
  },
];

/**
 * Country code:
 * https://flagcdn.com/en/codes.json
 *
 * Number format code:
 * https://gist.github.com/raushankrjha/d1c7e35cf87e69aa8b4208a8171a8416
 */
