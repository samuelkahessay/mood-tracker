export type MoodRating = 1 | 2 | 3 | 4 | 5;

export type DayKey = string;

export interface MoodEntry {
  dayKey: DayKey;
  mood: MoodRating;
  note?: string;
}
