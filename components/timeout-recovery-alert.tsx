import type { JSX } from "react";

import { config } from "@/lib/config";
import { txExplorerUrl } from "@/lib/explorer";

/**
 * Shown when a submitted transaction's confirmation timed out: the transaction
 * is on the network, so the user can re-check its status instead of
 * re-submitting it.
 *
 * @param hash - Hash of the submitted transaction
 * @param disabled - Disables "Re-check status" while another action is running
 * @param onRecheck - Re-polls the transaction's confirmation
 */
export function TimeoutRecoveryAlert({
  hash,
  disabled,
  onRecheck,
}: {
  hash: string;
  disabled: boolean;
  onRecheck: () => void;
}): JSX.Element {
  return (
    <div
      role="alert"
      className="my-2 rounded-lg border border-amber-800/60 bg-amber-950/30 p-3 text-xs text-amber-200"
    >
      <p className="font-semibold">Transaction confirmation timed out</p>
      <p className="mt-1 text-neutral-400">
        The transaction was submitted on-chain. You can re-check its status without re-submitting.
      </p>
      <div className="mt-2.5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onRecheck}
          disabled={disabled}
          className="rounded bg-amber-400 px-2.5 py-1 font-semibold text-neutral-950 hover:bg-amber-300 disabled:opacity-50"
        >
          Re-check status
        </button>
        <a
          href={txExplorerUrl(hash, config.network)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-300 underline hover:text-amber-100"
        >
          View on Stellar Expert
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </div>
  );
}
