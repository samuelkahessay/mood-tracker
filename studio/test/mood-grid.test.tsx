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

describe("mood grid and day form", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(REFERENCE_DATE);
    window.localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders exactly the last 30 days", () => {
    render(<Home />);

    const dayButtons = screen.getAllByRole("button", { name: /Open mood entry for/ });
    expect(dayButtons).toHaveLength(30);
  });

  it("maps day colors to mood ratings and gray for empty days", () => {
    const days = getLastDayKeys(30, REFERENCE_DATE);
    storeEntries({
      [days[27]]: { dayKey: days[27], mood: 1 },
      [days[28]]: { dayKey: days[28], mood: 3 },
      [days[29]]: { dayKey: days[29], mood: 5 },
    });

    render(<Home />);

    expect(screen.getByLabelText(`Open mood entry for ${days[27]}`)).toHaveAttribute("data-mood-color", "deep-red");
    expect(screen.getByLabelText(`Open mood entry for ${days[28]}`)).toHaveAttribute("data-mood-color", "yellow");
    expect(screen.getByLabelText(`Open mood entry for ${days[29]}`)).toHaveAttribute("data-mood-color", "bright-green");
    expect(screen.getByLabelText(`Open mood entry for ${days[0]}`)).toHaveAttribute("data-mood-color", "gray");
  });

  it("opens the mood entry form when a day is clicked", () => {
    const days = getLastDayKeys(30, REFERENCE_DATE);
    render(<Home />);

    fireEvent.click(screen.getByLabelText(`Open mood entry for ${days[29]}`));

    expect(screen.getByRole("form", { name: "Mood entry form" })).toBeInTheDocument();
    expect(screen.getByText(days[29])).toBeInTheDocument();
  });

  it("pre-fills the form when an entry already exists", () => {
    const days = getLastDayKeys(30, REFERENCE_DATE);
    storeEntries({
      [days[29]]: { dayKey: days[29], mood: 4, note: "steady day" },
    });

    render(<Home />);
    fireEvent.click(screen.getByLabelText(`Open mood entry for ${days[29]}`));

    expect(screen.getByLabelText("Mood")).toHaveValue("4");
    expect(screen.getByLabelText("Note")).toHaveValue("steady day");
  });

  it("saves a new entry and updates the grid color immediately", () => {
    const days = getLastDayKeys(30, REFERENCE_DATE);
    render(<Home />);

    fireEvent.click(screen.getByLabelText(`Open mood entry for ${days[29]}`));
    fireEvent.change(screen.getByLabelText("Mood"), { target: { value: "4" } });
    fireEvent.change(screen.getByLabelText("Note"), { target: { value: "new note" } });
    fireEvent.click(screen.getByRole("button", { name: "Save mood" }));

    const targetCell = screen.getByLabelText(`Open mood entry for ${days[29]}`);
    expect(targetCell).toHaveAttribute("data-mood-color", "light-green");

    const persisted = JSON.parse(window.localStorage.getItem(MOOD_STORAGE_KEY) ?? "{}");
    expect(persisted[days[29]]).toMatchObject({ dayKey: days[29], mood: 4, note: "new note" });
  });
});
