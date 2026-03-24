import type { DayKey } from "@/lib/mood/types";

export const DAY_WINDOW = 30;

function padDatePart(value: number): string {
  return String(value).padStart(2, "0");
}

export function toDayKey(date: Date): DayKey {
  const year = date.getFullYear();
  const month = padDatePart(date.getMonth() + 1);
  const day = padDatePart(date.getDate());
  return `${year}-${month}-${day}`;
}

export function getLastDayKeys(days: number = DAY_WINDOW, referenceDate: Date = new Date()): DayKey[] {
  if (days <= 0) {
    return [];
  }

  const result: DayKey[] = [];
  const cursor = new Date(referenceDate);
  cursor.setHours(12, 0, 0, 0);

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const day = new Date(cursor);
    day.setDate(cursor.getDate() - offset);
    result.push(toDayKey(day));
  }

  return result;
}
