"use client";

import { useMemo, useState } from "react";

import MoodEntryForm from "@/components/MoodEntryForm";
import MoodGrid from "@/components/MoodGrid";
import MoodTrendChart from "@/components/MoodTrendChart";
import { DAY_WINDOW, getLastDayKeys } from "@/lib/mood/dateRange";
import { getMoodEntriesForLastDays, writeMoodEntry } from "@/lib/mood/storage";
import type { DayKey, MoodEntry } from "@/lib/mood/types";

function buildWindow(referenceDate: Date = new Date()): DayKey[] {
  return getLastDayKeys(DAY_WINDOW, referenceDate);
}

export default function Home() {
  const dayKeys = useMemo(() => buildWindow(), []);
  const [entriesByDay, setEntriesByDay] = useState<Record<DayKey, MoodEntry | null>>(() =>
    getMoodEntriesForLastDays(DAY_WINDOW),
  );
  const [selectedDayKey, setSelectedDayKey] = useState<DayKey | null>(null);

  const selectedEntry = selectedDayKey ? entriesByDay[selectedDayKey] ?? null : null;

  function handleSave(entry: MoodEntry): void {
    writeMoodEntry(entry);
    setEntriesByDay((current) => ({
      ...current,
      [entry.dayKey]: {
        dayKey: entry.dayKey,
        mood: entry.mood,
        note: entry.note?.trim() ? entry.note.trim() : undefined,
      },
    }));
  }

  return (
    <main className="dashboard">
      <header>
        <h1>Personal Mood Tracker</h1>
      </header>

      <MoodGrid
        dayKeys={dayKeys}
        entriesByDay={entriesByDay}
        selectedDayKey={selectedDayKey}
        onSelectDay={setSelectedDayKey}
      />

      <MoodTrendChart dayKeys={dayKeys} entriesByDay={entriesByDay} />

      {selectedDayKey ? (
        <MoodEntryForm dayKey={selectedDayKey} initialEntry={selectedEntry} onSubmit={handleSave} />
      ) : (
        <p className="mood-form-placeholder">Select a day to add or edit your mood entry.</p>
      )}
    </main>
  );
}
