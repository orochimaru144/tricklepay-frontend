import { describe, expect, it } from "vitest";

import { parseStreamView } from "@/lib/api-schema";
import { STREAM_STATUS_META } from "@/lib/stream-status";
import type { StreamStatus } from "@/types/stream";

// The badge, the legend and the tab title all read their text, icon and colour
// from STREAM_STATUS_META, so what it returns for each status is what a user
// sees for that point in a stream's life. The backend decides which status a
// stream is in (see the Glossary in the README); this table decides how each
// one is presented.
const LIFECYCLE: Array<{
  point: string;
  status: StreamStatus;
  label: string;
  icon: string;
  description: string;
  hue: string;
}> = [
  {
    point: "before the start time",
    status: "pending",
    label: "Pending",
    icon: "⏳",
    description: "Start time not yet reached",
    hue: "neutral",
  },
  {
    point: "between the start and end time",
    status: "streaming",
    label: "Streaming",
    icon: "●",
    description: "Tokens are actively vesting",
    hue: "green",
  },
  {
    point: "at and after the end time",
    status: "completed",
    label: "Completed",
    icon: "✓",
    description: "Fully vested and ended",
    hue: "blue",
  },
  {
    point: "stopped by the sender before the end",
    status: "cancelled",
    label: "Cancelled",
    icon: "✕",
    description: "Stopped before end time",
    hue: "red",
  },
];

const STATUSES = LIFECYCLE.map((entry) => entry.status);

describe("STREAM_STATUS_META", () => {
  describe.each(LIFECYCLE)("$status ($point)", ({ status, label, icon, description, hue }) => {
    it("has the label, icon and description shown for it", () => {
      expect(STREAM_STATUS_META[status]).toMatchObject({ label, icon, description });
    });

    it(`is coloured ${hue}`, () => {
      const meta = STREAM_STATUS_META[status];
      expect(meta.dot).toContain(hue);
      expect(meta.style).toContain(hue);
    });
  });

  describe("cancelled", () => {
    const cancelled = STREAM_STATUS_META.cancelled;

    it("is presented as a stopped stream, in red", () => {
      expect(cancelled.label).toBe("Cancelled");
      expect(cancelled.icon).toBe("✕");
      expect(cancelled.description).toBe("Stopped before end time");
      expect(cancelled.dot).toBe("bg-red-400");
      expect(cancelled.style).toContain("text-red-300");
    });

    it("is told apart from a completed stream by more than colour", () => {
      const completed = STREAM_STATUS_META.completed;

      expect(cancelled.icon).not.toBe(completed.icon);
      expect(cancelled.label).not.toBe(completed.label);
      expect(cancelled.description).not.toBe(completed.description);
    });
  });

  it("has an entry for every status, and nothing else", () => {
    expect(Object.keys(STREAM_STATUS_META).sort()).toEqual([...STATUSES].sort());
  });

  it("fills in every field of every entry", () => {
    for (const status of STATUSES) {
      const { dot, style, icon, label, description } = STREAM_STATUS_META[status];
      for (const value of [dot, style, icon, label, description]) {
        expect(value.trim()).not.toBe("");
      }
    }
  });

  it("labels each status with its own name, so the badge and the legend agree", () => {
    for (const status of STATUSES) {
      expect(STREAM_STATUS_META[status].label.toLowerCase()).toBe(status);
    }
  });

  it("gives every status its own icon, label, description and colours", () => {
    for (const field of ["icon", "label", "description", "dot", "style"] as const) {
      const values = STATUSES.map((status) => STREAM_STATUS_META[status][field]);
      expect(new Set(values).size).toBe(STATUSES.length);
    }
  });

  it("covers every status the API contract accepts", () => {
    // A status the backend can send must never fall through to a missing
    // entry, which would crash the badge that renders it.
    for (const status of STATUSES) {
      const parsed = parseStreamView({
        id: "1",
        sender: "GAAA",
        recipient: "GBBB",
        token: "CCCC",
        totalAmount: "10000000",
        withdrawn: "0",
        vested: "0",
        withdrawable: "0",
        locked: "10000000",
        startTime: "100",
        endTime: "200",
        cliffTime: "100",
        cancelled: status === "cancelled",
        status,
        progress: 0,
      });

      expect(STREAM_STATUS_META[parsed.status]).toBeDefined();
    }
  });
});
