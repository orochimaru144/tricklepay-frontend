import { describe, expect, it, vi } from "vitest";

import { TimeoutRecoveryAlert } from "./timeout-recovery-alert";

vi.mock("@/lib/config", () => ({
  config: { network: "testnet" },
}));

describe("TimeoutRecoveryAlert", () => {
  const txHash = "abc123def456abc123def456abc123def456abc123def456abc123def456abc123";

  it("renders and displays the transaction hash when given a timed-out transaction", () => {
    const element = TimeoutRecoveryAlert({
      hash: txHash,
      disabled: false,
      onRecheck: vi.fn(),
    });

    const rendered = JSON.stringify(element);

    // The alert should render
    expect(element).toBeDefined();
    expect(element.props.role).toBe("alert");

    // The transaction hash should appear in the explorer link
    expect(rendered).toContain(txHash);
    expect(rendered).toContain("Transaction confirmation timed out");
  });

  it("renders the recheck action and calls the handler when triggered", () => {
    const onRecheck = vi.fn();
    const element = TimeoutRecoveryAlert({
      hash: txHash,
      disabled: false,
      onRecheck,
    });

    const rendered = JSON.stringify(element);

    // The recheck button should be present
    expect(rendered).toContain("Re-check status");

    // Find the button in the component tree and fire its onClick
    const actionsDiv = element.props.children[2];
    const [recheckButton] = actionsDiv.props.children;

    expect(recheckButton.props.disabled).toBe(false);
    recheckButton.props.onClick();
    expect(onRecheck).toHaveBeenCalledTimes(1);
  });
});
