import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import Home from "@/app/page";
import { getLastDayKeys } from "@/lib/mood/dateRange";
import { MOOD_STORAGE_KEY } from "@/lib/mood/storage";

const REFERENCE_DATE = new Date("2026-03-24T12:00:00.000Z");

type StoredEntry = {
  dayKey: string;
  mood: number;
  note?: string;
};

function storeEntries(entries: Record<string, StoredEntry>): void {
  window.localStorage.setItem(MOOD_STORAGE_KEY, JSON.stringify(entries));
}

function readStoredEntries(): Record<string, StoredEntry> {
  return JSON.parse(window.localStorage.getItem(MOOD_STORAGE_KEY) ?? "{}") as Record<string, StoredEntry>;
}

describe("mood tracker regression", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(REFERENCE_DATE);
    window.localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("supports create and edit on the same day while keeping a single persisted daily record", () => {
    const dayKeys = getLastDayKeys(30, REFERENCE_DATE);
    const targetDay = dayKeys[29];

    render(<Home />);

    expect(screen.getByLabelText(`Open mood entry for ${targetDay}`)).toHaveAttribute("data-mood-color", "gray");
    expect(document.querySelector(`circle[data-day-key="${targetDay}"]`)).toHaveAttribute("data-mood-value", "missing");

    fireEvent.click(screen.getByLabelText(`Open mood entry for ${targetDay}`));
    fireEvent.change(screen.getByLabelText("Mood"), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText("Note"), { target: { value: "rough morning" } });
    fireEvent.click(screen.getByRole("button", { name: "Save mood" }));

    expect(screen.getByLabelText(`Open mood entry for ${targetDay}`)).toHaveAttribute("data-mood-color", "orange");
    expect(document.querySelector(`circle[data-day-key="${targetDay}"]`)).toHaveAttribute("data-mood-value", "2");

    fireEvent.click(screen.getByLabelText(`Open mood entry for ${targetDay}`));
    expect(screen.getByLabelText("Mood")).toHaveValue("2");
    expect(screen.getByLabelText("Note")).toHaveValue("rough morning");

    fireEvent.change(screen.getByLabelText("Mood"), { target: { value: "5" } });
    fireEvent.change(screen.getByLabelText("Note"), { target: { value: "great evening" } });
    fireEvent.click(screen.getByRole("button", { name: "Update mood" }));

    expect(screen.getByLabelText(`Open mood entry for ${targetDay}`)).toHaveAttribute("data-mood-color", "bright-green");
    expect(document.querySelector(`circle[data-day-key="${targetDay}"]`)).toHaveAttribute("data-mood-value", "5");

    const persisted = readStoredEntries();
    expect(Object.keys(persisted)).toHaveLength(1);
    expect(persisted[targetDay]).toMatchObject({
      dayKey: targetDay,
      mood: 5,
      note: "great evening",
    });
  });

  it("keeps the exact 30-day grid and chart in sync with persisted localStorage data across remounts", () => {
    const dayKeys = getLastDayKeys(30, REFERENCE_DATE);
    const firstDay = dayKeys[0];
    const middleDay = dayKeys[14];
    const lastDay = dayKeys[29];

    storeEntries({
      [firstDay]: { dayKey: firstDay, mood: 1, note: "low" },
      [middleDay]: { dayKey: middleDay, mood: 3, note: "steady" },
      [lastDay]: { dayKey: lastDay, mood: 4, note: "good" },
    });

    const initialRender = render(<Home />);

    expect(screen.getAllByRole("button", { name: /Open mood entry for/ })).toHaveLength(30);
    expect(document.querySelectorAll("circle[data-day-key]")).toHaveLength(30);

    expect(screen.getByLabelText(`Open mood entry for ${firstDay}`)).toHaveAttribute("data-mood-color", "deep-red");
    expect(screen.getByLabelText(`Open mood entry for ${middleDay}`)).toHaveAttribute("data-mood-color", "yellow");
    expect(screen.getByLabelText(`Open mood entry for ${lastDay}`)).toHaveAttribute("data-mood-color", "light-green");
    expect(screen.getByLabelText(`Open mood entry for ${dayKeys[10]}`)).toHaveAttribute("data-mood-color", "gray");

    fireEvent.click(screen.getByLabelText(`Open mood entry for ${lastDay}`));
    expect(screen.getByLabelText("Mood")).toHaveValue("4");
    expect(screen.getByLabelText("Note")).toHaveValue("good");
    expect(document.querySelector(`circle[data-day-key="${lastDay}"]`)).toHaveAttribute("data-mood-value", "4");

    initialRender.unmount();
    render(<Home />);

    expect(screen.getByLabelText(`Open mood entry for ${firstDay}`)).toHaveAttribute("data-mood-color", "deep-red");
    expect(document.querySelector(`circle[data-day-key="${firstDay}"]`)).toHaveAttribute("data-mood-value", "1");

    fireEvent.click(screen.getByLabelText(`Open mood entry for ${middleDay}`));
    expect(screen.getByLabelText("Mood")).toHaveValue("3");
    expect(screen.getByLabelText("Note")).toHaveValue("steady");
  });
});
