import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import Home from "@/app/page";
import { getLastDayKeys } from "@/lib/mood/dateRange";
import { MOOD_STORAGE_KEY } from "@/lib/mood/storage";

const REFERENCE_DATE = new Date("2026-03-24T12:00:00.000Z");

function storeEntries(entries: Record<string, { dayKey: string; mood: number; note?: string }>): void {
  window.localStorage.setItem(MOOD_STORAGE_KEY, JSON.stringify(entries));
}

describe("mood trend chart", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(REFERENCE_DATE);
    window.localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders the trend chart below the mood grid", () => {
    render(<Home />);

    const grid = screen.getByRole("region", { name: "30-day mood grid" });
    const chart = screen.getByRole("region", { name: "30-day mood trend chart" });

    expect(grid.compareDocumentPosition(chart) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("plots exactly the same 30-day window used by the grid", () => {
    const days = getLastDayKeys(30, REFERENCE_DATE);
    storeEntries({
      [days[0]]: { dayKey: days[0], mood: 2 },
      [days[29]]: { dayKey: days[29], mood: 5 },
    });

    render(<Home />);

    const points = document.querySelectorAll("circle[data-day-key]");
    expect(points).toHaveLength(30);
    expect(document.querySelector(`circle[data-day-key=\"${days[0]}\"]`)).toHaveAttribute("data-mood-value", "2");
    expect(document.querySelector(`circle[data-day-key=\"${days[29]}\"]`)).toHaveAttribute("data-mood-value", "5");
  });

  it("updates trend points after editing a day mood entry", () => {
    const days = getLastDayKeys(30, REFERENCE_DATE);

    render(<Home />);
    fireEvent.click(screen.getByLabelText(`Open mood entry for ${days[29]}`));
    fireEvent.change(screen.getByLabelText("Mood"), { target: { value: "4" } });
    fireEvent.click(screen.getByRole("button", { name: "Save mood" }));

    expect(document.querySelector(`circle[data-day-key=\"${days[29]}\"]`)).toHaveAttribute("data-mood-value", "4");
  });
});
