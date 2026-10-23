/** Site settings from the environment (see .env.example). Server-only. */

function clean(value: string | undefined): string {
  return (value ?? "").trim();
}

export const config = {
  /** The SSS business shown by this site. */
  storeSlug: clean(process.env.SSS_STORE_SLUG) || "la-boutique-by-bnm",
  /** SSS API origin, without a trailing slash. */
  apiUrl: (clean(process.env.SSS_API_URL) || "https://sss-api.fpswagg.site").replace(/\/+$/, ""),
  /** Seconds before SSS data is fetched again (dashboard edits clear the cache at once). */
  revalidate: Math.max(30, Number(process.env.SSS_REVALIDATE) || 300),
  /** POST /api/revalidate?secret=… clears the cache (e.g. after an edit in the SSS app). */
  revalidateSecret: clean(process.env.REVALIDATE_SECRET),
  siteUrl: (clean(process.env.SITE_URL) || clean(process.env.NEXT_PUBLIC_APP_URL) || "http://localhost:3000").replace(/\/+$/, ""),
  /** Business API key (sss_…): website orders and view counters. Server-only. */
  apiKey: clean(process.env.SSS_API_KEY),
  /** "Sign in with SSS" (OAuth) for /dashboard. Empty client id = dashboard off. */
  oauthClientId: clean(process.env.SSS_OAUTH_CLIENT_ID),
  oauthClientSecret: clean(process.env.SSS_OAUTH_CLIENT_SECRET),
  oauthScope: clean(process.env.SSS_OAUTH_SCOPE) || "profile email business",
  /** Encrypts the sign-in cookie. At least 32 random characters in production. */
  sessionSecret: clean(process.env.SESSION_SECRET),
  /** The SSS web app, linked from the dashboard. */
  appUrl: (clean(process.env.SSS_APP_URL) || "https://sss.fpswagg.site").replace(/\/+$/, ""),
};

/** Cache tag on every SSS fetch: dashboard edits and POST /api/revalidate clear it. */
export const SSS_TAG = "sss";
