export const SUPPORTED_DESKTOP_BROWSERS = [
  "Google Chrome",
  "Brave Browser",
  "Mozilla Firefox",
  "Microsoft Edge",
] as const;

export function isSupportedBrowser(userAgent: string): boolean {
  const lower = userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(lower);
  if (isMobile) return false;

  // Major desktop browsers supporting extensions
  return (
    lower.includes("chrome") ||
    lower.includes("brave") ||
    lower.includes("firefox") ||
    lower.includes("edg")
  );
}

/**
 * Whether the browser support note should be shown for this user agent: only
 * for browsers the wallet extension can't run in. A `null` user agent means it
 * isn't known yet (server render, or the first client render before the
 * browser is read) — the note stays hidden then, so visitors on a supported
 * browser never see it flash and server and client markup agree on hydration.
 */
export function shouldShowBrowserSupportNote(userAgent: string | null): boolean {
  return userAgent !== null && !isSupportedBrowser(userAgent);
}
