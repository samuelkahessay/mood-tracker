import { getLastDayKeys } from "@/lib/mood/dateRange";
import {
  getMoodEntriesForLastDays,
  getMoodEntry,
  MOOD_STORAGE_KEY,
  readMoodEntries,
  writeMoodEntry,
} from "@/lib/mood/storage";

describe("mood storage", () => {
  const referenceDate = new Date("2026-03-24T12:00:00.000Z");

  beforeEach(() => {
    window.localStorage.clear();
    jest.resetModules();
  });

  it("creates a daily mood entry", () => {
    writeMoodEntry({ dayKey: "2026-03-24", mood: 4, note: "solid day" });

    expect(readMoodEntries()).toEqual({
      "2026-03-24": { dayKey: "2026-03-24", mood: 4, note: "solid day" },
    });
  });

  it("overwrites the same day instead of creating duplicates", () => {
    writeMoodEntry({ dayKey: "2026-03-24", mood: 2, note: "rough morning" });
    writeMoodEntry({ dayKey: "2026-03-24", mood: 5, note: "better evening" });

    const stored = readMoodEntries();
    expect(Object.keys(stored)).toHaveLength(1);
    expect(stored["2026-03-24"]).toEqual({
      dayKey: "2026-03-24",
      mood: 5,
      note: "better evening",
    });
  });

  it("persists entries in localStorage across module reload", async () => {
    writeMoodEntry({ dayKey: "2026-03-24", mood: 3, note: "steady" });

    const reloadedStorage = await import("@/lib/mood/storage");
    expect(reloadedStorage.readMoodEntries()).toEqual({
      "2026-03-24": { dayKey: "2026-03-24", mood: 3, note: "steady" },
    });
    expect(window.localStorage.getItem(MOOD_STORAGE_KEY)).not.toBeNull();
  });

  it("returns a 30-day keyed view with null for missing days", () => {
    writeMoodEntry({ dayKey: "2026-03-24", mood: 1, note: "difficult" });

    const result = getMoodEntriesForLastDays(30, referenceDate);
    const keys = Object.keys(result);

    expect(keys).toHaveLength(30);
    expect(keys).toEqual(getLastDayKeys(30, referenceDate));
    expect(result["2026-03-24"]).toEqual({
      dayKey: "2026-03-24",
      mood: 1,
      note: "difficult",
    });
    expect(result["2026-03-23"]).toBeNull();
  });

  it("returns null for a day with no entry", () => {
    expect(getMoodEntry("2026-03-24")).toBeNull();
  });

  it("handles corrupted localStorage values by returning no entries", () => {
    window.localStorage.setItem(MOOD_STORAGE_KEY, "{bad json");

    expect(readMoodEntries()).toEqual({});
  });
});
