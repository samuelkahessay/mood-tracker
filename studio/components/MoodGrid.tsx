import type { DayKey, MoodEntry } from "@/lib/mood/types";

type MoodColorToken = "deep-red" | "orange" | "yellow" | "light-green" | "bright-green" | "gray";

const moodStyles: Record<number, { token: MoodColorToken; color: string }> = {
  1: { token: "deep-red", color: "#8b0000" },
  2: { token: "orange", color: "#f97316" },
  3: { token: "yellow", color: "#facc15" },
  4: { token: "light-green", color: "#90ee90" },
  5: { token: "bright-green", color: "#22c55e" },
};

function getDayOfMonth(dayKey: DayKey): string {
  return dayKey.slice(-2);
}

function resolveColor(entry: MoodEntry | null): { token: MoodColorToken; color: string } {
  if (!entry) {
    return { token: "gray", color: "#9ca3af" };
  }

  return moodStyles[entry.mood];
}

interface MoodGridProps {
  dayKeys: DayKey[];
  entriesByDay: Record<DayKey, MoodEntry | null>;
  selectedDayKey: DayKey | null;
  onSelectDay: (dayKey: DayKey) => void;
}

export default function MoodGrid({ dayKeys, entriesByDay, selectedDayKey, onSelectDay }: MoodGridProps) {
  return (
    <section aria-label="30-day mood grid" className="mood-grid-section">
      <h2>Last 30 Days</h2>
      <div className="mood-grid" role="list">
        {dayKeys.map((dayKey) => {
          const { token, color } = resolveColor(entriesByDay[dayKey] ?? null);
          const isSelected = selectedDayKey === dayKey;

          return (
            <button
              key={dayKey}
              type="button"
              className="mood-day-cell"
              data-day-key={dayKey}
              data-mood-color={token}
              data-selected={isSelected ? "true" : "false"}
              aria-label={`Open mood entry for ${dayKey}`}
              style={{ backgroundColor: color }}
              onClick={() => onSelectDay(dayKey)}
            >
              <span aria-hidden="true">{getDayOfMonth(dayKey)}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
