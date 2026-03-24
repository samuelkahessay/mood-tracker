import { DAY_WINDOW, getLastDayKeys } from "@/lib/mood/dateRange";
import type { DayKey, MoodEntry, MoodRating } from "@/lib/mood/types";

export const MOOD_STORAGE_KEY = "mood-tracker.entries.v1";

type MoodEntryRecord = Record<DayKey, MoodEntry>;

function isMoodRating(value: unknown): value is MoodRating {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5;
}

function hasLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function normalizeNote(note?: string): string | undefined {
  if (typeof note !== "string") {
    return undefined;
  }

  const trimmed = note.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function sanitizeEntry(candidate: unknown): MoodEntry | null {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const entry = candidate as Partial<MoodEntry>;
  if (typeof entry.dayKey !== "string" || !isMoodRating(entry.mood)) {
    return null;
  }

  return {
    dayKey: entry.dayKey as DayKey,
    mood: entry.mood,
    note: normalizeNote(entry.note),
  };
}

export function readMoodEntries(): MoodEntryRecord {
  if (!hasLocalStorage()) {
    return {} as MoodEntryRecord;
  }

  const raw = window.localStorage.getItem(MOOD_STORAGE_KEY);
  if (!raw) {
    return {} as MoodEntryRecord;
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const entries = Object.values(parsed)
      .map((candidate) => sanitizeEntry(candidate))
      .filter((entry): entry is MoodEntry => entry !== null);

    return entries.reduce<MoodEntryRecord>((record, entry) => {
      record[entry.dayKey] = entry;
      return record;
    }, {} as MoodEntryRecord);
  } catch {
    return {} as MoodEntryRecord;
  }
}

export function writeMoodEntry(entry: MoodEntry): void {
  const existing = readMoodEntries();
  const normalized: MoodEntry = {
    dayKey: entry.dayKey,
    mood: entry.mood,
    note: normalizeNote(entry.note),
  };
  existing[normalized.dayKey] = normalized;

  if (!hasLocalStorage()) {
    return;
  }

  window.localStorage.setItem(MOOD_STORAGE_KEY, JSON.stringify(existing));
}

export function getMoodEntry(dayKey: DayKey): MoodEntry | null {
  const entries = readMoodEntries();
  return entries[dayKey] ?? null;
}

export function getMoodEntriesForLastDays(
  days: number = DAY_WINDOW,
  referenceDate: Date = new Date(),
): Record<DayKey, MoodEntry | null> {
  const entries = readMoodEntries();
  const dayKeys = getLastDayKeys(days, referenceDate);

  return dayKeys.reduce<Record<DayKey, MoodEntry | null>>((record, dayKey) => {
    record[dayKey] = entries[dayKey] ?? null;
    return record;
  }, {} as Record<DayKey, MoodEntry | null>);
}
