import { test, expect } from "@playwright/test";
import { Keypair } from "@stellar/stellar-sdk";

import { stubApi, stubChain, streamingStream, TX_HASH, type StreamStore } from "./fixtures/chain";
import { installFreighterStub, TEST_ADDRESS } from "./fixtures/freighter";

// Cancelling end to end, as the sender of a stream paying someone else. The
// settlement is the surprising part: the vested half stays claimable by the
// recipient while the unvested half goes back to the sender, and the detail
// page has to say so rather than just drop the cancel button.

const RECIPIENT = Keypair.random().publicKey();

test.describe("cancel a stream", () => {
  test("cancels through the UI and shows the settled stream", async ({ page }) => {
    test.slow();
    const store: StreamStore = {
      streams: [streamingStream({ id: "1", sender: TEST_ADDRESS, recipient: RECIPIENT })],
    };

    await page.addInitScript(installFreighterStub, { address: TEST_ADDRESS });
    await stubApi(page, store);
    const chain = await stubChain(page, { address: TEST_ADDRESS });

    await page.goto("/");
    await page.getByRole("link", { name: /#1/ }).first().click();
    await expect(page).toHaveURL(/\/streams\/1$/);

    const status = page.getByRole("heading", { name: "Stream #1" }).locator("xpath=following-sibling::span");
    await expect(status).toHaveText("streaming");

    // Only the sender's control is offered: this wallet is not the recipient.
    await expect(page.getByRole("button", { name: "Withdraw", exact: true })).toHaveCount(0);

    await page.getByRole("button", { name: "Cancel stream", exact: true }).click();
    await expect(page.getByRole("alertdialog")).toBeVisible();

    // What the backend reports once the cancel lands: half had vested and stays
    // with the recipient, the other half is returned to the sender.
    store.streams = [
      streamingStream({
        id: "1",
        sender: TEST_ADDRESS,
        recipient: RECIPIENT,
        cancelled: true,
        status: "cancelled",
        vested: "500000000",
        withdrawable: "500000000",
        locked: "500000000",
      }),
    ];

    await page.getByRole("button", { name: "Yes, cancel stream" }).click();
    await expect.poll(() => chain.sendCount).toBe(1);

    // The page reloads the stream and reflects the cancellation.
    await expect(status).toHaveText("cancelled");
    const note = page.getByRole("note");
    await expect(note).toContainText("Stream cancelled");
    await expect(note).toContainText("returned to the sender");
    await expect(page.getByText("Remaining withdrawable")).toBeVisible();

    // "Locked" becomes "Returned to sender": 500000000 base units renders as 50.
    await expect(page.locator('dt:has-text("Locked")')).toHaveCount(0);
    await expect(page.locator('dt:has-text("Returned to sender") + dd')).toHaveText("50");

    // Nothing is left to cancel, and the transaction is linked.
    await expect(page.getByRole("button", { name: "Cancel stream", exact: true })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /view transaction/i })).toHaveAttribute(
      "href",
      `https://stellar.expert/explorer/testnet/tx/${TX_HASH}`,
    );

    // The dashboard lists the stream as cancelled too.
    await page.getByRole("link", { name: /back/i }).click();
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("link", { name: /#1/ }).first()).toContainText("cancelled");
    expect(chain.sendCount).toBe(1);
  });
});
