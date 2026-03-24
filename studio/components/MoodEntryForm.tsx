import { useEffect, useMemo, useState, type FormEvent } from "react";

import type { DayKey, MoodEntry, MoodRating } from "@/lib/mood/types";

interface MoodEntryFormProps {
  dayKey: DayKey;
  initialEntry: MoodEntry | null;
  onSubmit: (entry: MoodEntry) => void;
}

function parseMood(value: string): MoodRating {
  const parsed = Number.parseInt(value, 10);
  if (parsed >= 1 && parsed <= 5) {
    return parsed as MoodRating;
  }

  return 3;
}

export default function MoodEntryForm({ dayKey, initialEntry, onSubmit }: MoodEntryFormProps) {
  const [mood, setMood] = useState<MoodRating>(initialEntry?.mood ?? 3);
  const [note, setNote] = useState<string>(initialEntry?.note ?? "");

  useEffect(() => {
    setMood(initialEntry?.mood ?? 3);
    setNote(initialEntry?.note ?? "");
  }, [initialEntry, dayKey]);

  const actionLabel = useMemo(() => (initialEntry ? "Update mood" : "Save mood"), [initialEntry]);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    onSubmit({
      dayKey,
      mood,
      note,
    });
  }

  return (
    <section className="mood-form-section">
      <h2>Mood Entry</h2>
      <p className="mood-form-day">{dayKey}</p>
      <form aria-label="Mood entry form" onSubmit={handleSubmit}>
        <label htmlFor="mood-rating">Mood</label>
        <select
          id="mood-rating"
          name="mood"
          value={String(mood)}
          onChange={(event) => setMood(parseMood(event.target.value))}
        >
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>

        <label htmlFor="mood-note">Note</label>
        <textarea
          id="mood-note"
          name="note"
          rows={4}
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />

        <button type="submit">{actionLabel}</button>
      </form>
    </section>
  );
}
