import { describe, expect, it } from "vitest";

import type { StreamView } from "@/types/stream";

import { blockedReason, canSenderCancel } from "./stream-actions";

const SENDER = "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7";
const RECIPIENT = "GBBZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7";
const TOKEN = "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM";

function makeStream(overrides: Partial<StreamView> = {}): StreamView {
  const now = Math.floor(Date.now() / 1000);
  return {
    id: "1",
    sender: SENDER,
    recipient: RECIPIENT,
    token: TOKEN,
    totalAmount: "1000000000",
    withdrawn: "0",
    vested: "500000000",
    withdrawable: "500000000",
    locked: "500000000",
    startTime: String(now - 3600),
    endTime: String(now + 3600),
    cliffTime: String(now - 3600),
    cancelled: false,
    status: "streaming",
    progress: 5000,
    ...overrides,
  };
}

describe("canSenderCancel", () => {
  it("allows the sender to cancel an active stream", () => {
    expect(canSenderCancel(makeStream(), SENDER)).toBe(true);
  });

  it("rejects cancellation without a wallet, from a non-sender, or once finished", () => {
    expect(canSenderCancel(makeStream(), null)).toBe(false);
    expect(canSenderCancel(makeStream(), RECIPIENT)).toBe(false);
    expect(canSenderCancel(makeStream({ status: "cancelled", cancelled: true }), SENDER)).toBe(
      false,
    );
    expect(canSenderCancel(makeStream({ status: "completed" }), SENDER)).toBe(false);
  });
});

describe("blockedReason", () => {
  it("explains a stream that has not started yet", () => {
    const now = Math.floor(Date.now() / 1000);
    const stream = makeStream({
      startTime: String(now + 3600),
      cliffTime: String(now + 3600),
    });
    expect(blockedReason(stream)).toMatch(/^Starts /);
  });

  it("names the cliff when locked before it", () => {
    const now = Math.floor(Date.now() / 1000);
    const stream = makeStream({
      startTime: String(now - 100),
      cliffTime: String(now + 1000),
    });
    expect(blockedReason(stream)).toMatch(/cliff/i);
  });

  it("translates a fully withdrawn or cancelled stream into a readable message", () => {
    expect(
      blockedReason(
        makeStream({ totalAmount: "1000", withdrawn: "1000", vested: "1000" }),
      ),
    ).toBe("Fully withdrawn.");
    expect(blockedReason(makeStream({ cancelled: true }))).toBe(
      "This stream was cancelled.",
    );
  });

  it("falls back to nothing to withdraw yet", () => {
    expect(blockedReason(makeStream())).toBe("Nothing to withdraw yet.");
  });
});
