"use client";

import React from "react";

import { useUserAgent } from "@/hooks/use-user-agent";
import { shouldShowBrowserSupportNote } from "@/lib/browser-support";

export interface BrowserSupportNoteProps {
  /** Additional CSS classes to apply to the component. Defaults to empty string. */
  className?: string;
  /** When true, renders a condensed single-line version. When false, displays full note with icon. Defaults to false. */
  compact?: boolean;
  /**
   * User agent to check instead of the visitor's own. Leave unset in the app so
   * the note reflects the browser actually in use; it exists so tests and
   * previews can render the note for a specific browser.
   */
  userAgent?: string;
}

/**
 * An accessible note informing users about browser and wallet extension compatibility.
 * TricklePay connects to the Stellar network using the Freighter wallet extension,
 * available on modern desktop browsers (Chrome, Brave, Firefox, and Microsoft Edge).
 *
 * It renders only for a browser the extension can't run in (see
 * `shouldShowBrowserSupportNote`) and renders nothing for a supported one, or
 * until the browser is known, so it never flashes for the common case.
 */
export function BrowserSupportNote({
  className = "",
  compact = false,
  userAgent,
}: BrowserSupportNoteProps): React.JSX.Element | null {
  const detectedUserAgent = useUserAgent();

  if (!shouldShowBrowserSupportNote(userAgent ?? detectedUserAgent)) {
    return null;
  }

  if (compact) {
    return (
      <div
        role="note"
        aria-label="Browser support notice"
        className={`rounded-md border border-neutral-800 bg-neutral-900/50 px-3 py-2 text-xs text-neutral-400 ${className}`}
      >
        <p>
          <strong className="font-semibold text-neutral-300">Browser support:</strong>{" "}
          Requires the{" "}
          <a
            href="https://www.freighter.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-200 underline underline-offset-2 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
          >
            Freighter wallet
          </a>{" "}
          extension on desktop Chrome, Brave, Firefox, or Edge.
        </p>
      </div>
    );
  }

  return (
    <aside
      role="note"
      aria-label="Browser and wallet compatibility information"
      className={`rounded-lg border border-neutral-800 bg-neutral-900/40 p-4 text-xs text-neutral-400 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-neutral-800 p-1.5 text-neutral-300" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="space-y-1">
          <h3 className="font-medium text-neutral-200">Browser &amp; Wallet Support</h3>
          <p className="text-neutral-400">
            TricklePay interacts with Soroban smart contracts on Stellar via the{" "}
            <a
              href="https://www.freighter.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-200 underline underline-offset-2 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
            >
              Freighter extension
            </a>
            . Supported desktop browsers include Google Chrome, Brave, Mozilla Firefox, and
            Microsoft Edge.
          </p>
        </div>
      </div>
    </aside>
  );
}
