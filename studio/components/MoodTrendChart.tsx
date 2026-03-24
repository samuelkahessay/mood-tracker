import type { DayKey, MoodEntry } from "@/lib/mood/types";

interface MoodTrendChartProps {
  dayKeys: DayKey[];
  entriesByDay: Record<DayKey, MoodEntry | null>;
}

const SVG_WIDTH = 640;
const SVG_HEIGHT = 220;
const PADDING_X = 32;
const PADDING_TOP = 20;
const PADDING_BOTTOM = 28;
const MIN_MOOD = 1;
const MAX_MOOD = 5;

function yForMood(mood: number): number {
  const range = MAX_MOOD - MIN_MOOD;
  const normalized = (MAX_MOOD - mood) / range;
  return PADDING_TOP + normalized * (SVG_HEIGHT - PADDING_TOP - PADDING_BOTTOM);
}

function xForIndex(index: number, total: number): number {
  if (total <= 1) {
    return PADDING_X;
  }

  const width = SVG_WIDTH - PADDING_X * 2;
  return PADDING_X + (index / (total - 1)) * width;
}

export default function MoodTrendChart({ dayKeys, entriesByDay }: MoodTrendChartProps) {
  let previous: { x: number; y: number } | null = null;

  return (
    <section aria-label="30-day mood trend chart" className="mood-trend-section">
      <h2>30-Day Mood Trend</h2>
      <svg
        aria-label="Mood trend line chart for last 30 days"
        className="mood-trend-chart"
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        role="img"
      >
        <line
          className="mood-trend-axis"
          x1={PADDING_X}
          y1={SVG_HEIGHT - PADDING_BOTTOM}
          x2={SVG_WIDTH - PADDING_X}
          y2={SVG_HEIGHT - PADDING_BOTTOM}
        />

        {[1, 2, 3, 4, 5].map((mood) => {
          const y = yForMood(mood);
          return (
            <g key={`y-${mood}`}>
              <line
                className="mood-trend-grid-line"
                x1={PADDING_X}
                y1={y}
                x2={SVG_WIDTH - PADDING_X}
                y2={y}
              />
              <text className="mood-trend-axis-label" x={10} y={y + 4}>
                {mood}
              </text>
            </g>
          );
        })}

        {dayKeys.map((dayKey, index) => {
          const entry = entriesByDay[dayKey] ?? null;
          const x = xForIndex(index, dayKeys.length);
          const y = entry ? yForMood(entry.mood) : SVG_HEIGHT - PADDING_BOTTOM;
          const markerY = entry ? y : y - 1;
          const line =
            previous && entry
              ? {
                  x1: previous.x,
                  y1: previous.y,
                  x2: x,
                  y2: y,
                }
              : null;

          previous = entry ? { x, y } : null;

          return (
            <g key={dayKey}>
              {line ? (
                <line
                  className="mood-trend-line"
                  data-day-key={dayKey}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                />
              ) : null}
              <circle
                className={entry ? "mood-trend-point" : "mood-trend-point-missing"}
                cx={x}
                cy={markerY}
                r={entry ? 3.5 : 2}
                data-day-key={dayKey}
                data-mood-value={entry ? String(entry.mood) : "missing"}
              />
            </g>
          );
        })}
      </svg>
    </section>
  );
}
