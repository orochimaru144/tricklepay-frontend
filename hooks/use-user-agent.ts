"use client";

import { useSyncExternalStore } from "react";

// The user agent never changes during a page's life, so there is nothing to
// subscribe to.
const subscribe = (): (() => void) => () => {};

/**
 * The visitor's user agent string, or `null` while it isn't available: on the
 * server, and during hydration. React renders the server snapshot first and
 * then switches to the real value, so markup that depends on it can't cause a
 * hydration mismatch.
 */
export function useUserAgent(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => navigator.userAgent,
    () => null,
  );
}
