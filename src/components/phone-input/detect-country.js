import { getCountries } from 'react-phone-number-input';

import { TIMEZONE_TO_COUNTRY } from './timezone-countries';

// ----------------------------------------------------------------------

export const FALLBACK_COUNTRY = 'US';

const SUPPORTED = new Set(getCountries());

let cached = null;

/**
 * Best guess of the visitor's country from the device time zone
 * (e.g. Europe/Berlin -> DE), computed locally with no network call.
 * Falls back to FALLBACK_COUNTRY (US) when the zone is unknown, e.g. "UTC".
 */
export function detectCountry() {
  if (cached) return cached;

  let country = null;
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    country = TIMEZONE_TO_COUNTRY[tz] ?? null;
  } catch {
    // ignore
  }

  cached = country && SUPPORTED.has(country) ? country : FALLBACK_COUNTRY;
  return cached;
}
