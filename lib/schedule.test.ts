import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { formatDuration, formatTime } from "@/lib/format";
import {
  formatRemaining,
  formatSchedule,
  hasCliff,
  NO_CLIFF_LABEL,
  type ScheduleInput,
} from "@/lib/schedule";
import type { StreamStatus } from "@/types/stream";

const NOW = Date.UTC(2026, 0, 1, 12, 0, 0);
const NOW_SECONDS = Math.floor(NOW / 1000);
const at = (offsetSeconds: number): string => String(NOW_SECONDS + offsetSeconds);

const DAY = 86_400;
const HOUR = 3_600;
const MINUTE = 60;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

// Starts in 2 days 3 hours, has a cliff a day after that, ends 10 days out.
const schedule: ScheduleInput = {
  startTime: at(2 * DAY + 3 * HOUR),
  cliffTime: at(3 * DAY + 3 * HOUR),
  endTime: at(10 * DAY),
};

describe("hasCliff", () => {
  it("is false when the cliff is the start time", () => {
    expect(hasCliff({ startTime: "1700000000", cliffTime: "1700000000" })).toBe(false);
  });

  it("is true when the cliff falls after the start", () => {
    expect(hasCliff({ startTime: "1700000000", cliffTime: "1700003600" })).toBe(true);
  });

  it("compares by value whether the times are strings or bigints", () => {
    expect(hasCliff({ startTime: "1700000000", cliffTime: 1700000000n })).toBe(false);
    expect(hasCliff({ startTime: 1700000000n, cliffTime: "1700003600" })).toBe(true);
  });
});

describe("formatSchedule", () => {
  it("gives every moment its local time, UTC time and countdown", () => {
    const { start, cliff, end } = formatSchedule(schedule);

    expect(start).toEqual({
      local: formatTime(schedule.startTime as string),
      utc: "2026-01-03 15:00 UTC",
      countdown: "starts in 2d 3h",
    });
    expect(cliff).toEqual({
      local: formatTime(schedule.cliffTime as string),
      utc: "2026-01-04 15:00 UTC",
      countdown: "cliff in 3d 3h",
    });
    expect(end).toEqual({
      local: formatTime(schedule.endTime as string),
      utc: "2026-01-11 12:00 UTC",
      countdown: "ends in 10d 0h",
    });
  });

  it("switches each countdown to its past form once the moment has gone by", () => {
    vi.setSystemTime(NOW + 11 * DAY * 1000);
    const { start, cliff, end } = formatSchedule(schedule);

    expect(start.countdown).toBe("started");
    expect(cliff?.countdown).toBe("cliff passed");
    expect(end.countdown).toBe("ended");
  });

  it("reports no cliff when the cliff is the start time", () => {
    expect(formatSchedule({ ...schedule, cliffTime: schedule.startTime }).cliff).toBeNull();
  });

  it("formats bigint times exactly as it formats the same times as strings", () => {
    const asBigints: ScheduleInput = {
      startTime: BigInt(schedule.startTime as string),
      cliffTime: BigInt(schedule.cliffTime as string),
      endTime: BigInt(schedule.endTime as string),
    };

    expect(formatSchedule(asBigints)).toEqual(formatSchedule(schedule));
  });
});

describe("NO_CLIFF_LABEL", () => {
  it("is the single wording for a stream with no cliff", () => {
    expect(NO_CLIFF_LABEL).toBe("None (streams from the start)");
  });
});

describe("formatRemaining", () => {
  it.each(["streaming", "pending"] as const)("counts down to the end of a %s stream", (status) => {
    expect(formatRemaining({ endTime: at(2 * DAY + 3 * HOUR), status })).toBe("ends in 2d 3h");
  });

  it.each(["completed", "cancelled"] as const)(
    "has nothing to show for a %s stream",
    (status) => {
      expect(formatRemaining({ endTime: at(2 * DAY), status })).toBeNull();
    },
  );

  it("says ended for an active stream whose end time has passed", () => {
    expect(formatRemaining({ endTime: at(-MINUTE), status: "streaming" })).toBe("ended");
  });
});

// The point of one helper: the same fact reads the same on every screen.
describe("consistency across views", () => {
  it("phrases the end countdown the same in the lists (remaining) and on the detail page (End)", () => {
    const active: StreamStatus[] = ["streaming", "pending"];
    for (const status of active) {
      for (const offset of [2 * DAY + 3 * HOUR, 5 * HOUR + 30 * MINUTE, 45 * MINUTE, 59, -DAY]) {
        const endTime = at(offset);
        expect(formatRemaining({ endTime, status })).toBe(
          formatSchedule({ startTime: at(-10 * DAY), cliffTime: at(-10 * DAY), endTime }).end
            .countdown,
        );
      }
    }
  });

  it("phrases a span the same in a countdown as in a duration", () => {
    for (const seconds of [2 * DAY + 3 * HOUR, 3 * DAY, 5 * HOUR + 30 * MINUTE, 2 * HOUR, 45 * MINUTE, 59]) {
      expect(formatRemaining({ endTime: at(seconds), status: "streaming" })).toBe(
        `ends in ${formatDuration(BigInt(seconds))}`,
      );
    }
  });
});
