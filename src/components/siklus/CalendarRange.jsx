"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatDisplayDate } from "@/lib/siklus/cycleMath";

const WEEKDAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function classNames(...values) {
  return values.filter(Boolean).join(" ");
}

function normalizeInputDate(value) {
  if (!value && value !== 0) {
    return null;
  }
  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
  if (typeof value === "string") {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      const [, year, month, day] = match;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date, amount) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

function isSameMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function toISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function CalendarRange({
  value = {},
  onChange,
  max,
  min,
  className
}) {
  const today = normalizeInputDate(new Date());
  const maxDate = normalizeInputDate(max) || today;
  const minDate = normalizeInputDate(min);
  const startDate = normalizeInputDate(value.start);
  const endDate = normalizeInputDate(value.end);

  const initialView = startDate || endDate || maxDate || today;
  const [viewDate, setViewDate] = useState(initialView);
  const [simpleMode, setSimpleMode] = useState(false);
  const pendingFocusRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    if (startDate && !isSameMonth(startDate, viewDate)) {
      setViewDate(startDate);
    }
  }, [value.start]);

  useEffect(() => {
    if (!startDate && endDate && !isSameMonth(endDate, viewDate)) {
      setViewDate(endDate);
    }
  }, [value.end]);

  useEffect(() => {
    if (pendingFocusRef.current && gridRef.current) {
      const selector = `[data-day="${pendingFocusRef.current}"]`;
      const target = gridRef.current.querySelector(selector);
      if (target) {
        target.focus();
        pendingFocusRef.current = null;
      }
    }
  }, [viewDate, startDate, endDate]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(viewDate);
    const firstWeekday = (monthStart.getDay() + 6) % 7; // Monday-first grid
    const gridStart = addDays(monthStart, -firstWeekday);
    return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
  }, [viewDate]);

  const canGoPrev = !minDate || viewDate.getFullYear() > minDate.getFullYear() || (viewDate.getFullYear() === minDate.getFullYear() && viewDate.getMonth() > minDate.getMonth());
  const canGoNext = !maxDate || viewDate.getFullYear() < maxDate.getFullYear() || (viewDate.getFullYear() === maxDate.getFullYear() && viewDate.getMonth() < maxDate.getMonth());

  const startTime = startDate ? startDate.getTime() : null;
  const endTime = endDate ? endDate.getTime() : null;
  const maxTime = maxDate ? maxDate.getTime() : null;
  const minTime = minDate ? minDate.getTime() : null;

  const rangeValue = useMemo(
    () => ({
      start: startDate ? toISO(startDate) : null,
      end: endDate ? toISO(endDate) : null
    }),
    [startDate, endDate]
  );

  function emitRange(nextRange) {
    if (typeof onChange !== "function") {
      return;
    }
    onChange({
      start: nextRange.start || null,
      end: nextRange.end || null
    });
  }

  function selectDay(dateIso, dateObj) {
    if ((minTime !== null && dateObj.getTime() < minTime) || (maxTime !== null && dateObj.getTime() > maxTime)) {
      return;
    }

    const startIso = rangeValue.start;
    const endIso = rangeValue.end;

    if (!startIso || endIso) {
      emitRange({ start: dateIso, end: null });
      return;
    }

    if (dateIso < startIso) {
      emitRange({ start: dateIso, end: startIso });
    } else {
      emitRange({ start: startIso, end: dateIso });
    }
  }

  function focusDay(dateIso) {
    if (!gridRef.current) {
      pendingFocusRef.current = dateIso;
      return;
    }
    const target = gridRef.current.querySelector(`[data-day="${dateIso}"]`);
    if (target) {
      target.focus();
      pendingFocusRef.current = null;
    } else {
      pendingFocusRef.current = dateIso;
    }
  }

  function handleNavigation(targetDate, focusIso) {
    setViewDate(targetDate);
    pendingFocusRef.current = focusIso;
  }

  function handleDayKeyDown(event, dateObj) {
    const keyMap = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowUp: -7,
      ArrowDown: 7
    };

    if (keyMap[event.key]) {
      event.preventDefault();
      const targetDate = addDays(dateObj, keyMap[event.key]);
      const targetIso = toISO(targetDate);
      if (!isSameMonth(targetDate, viewDate)) {
        handleNavigation(targetDate, targetIso);
      } else {
        focusDay(targetIso);
      }
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectDay(toISO(dateObj), dateObj);
    }
  }

  function renderDay(dateObj) {
    const iso = toISO(dateObj);
    const time = dateObj.getTime();
    const isDisabled = (minTime !== null && time < minTime) || (maxTime !== null && time > maxTime);
    const isSelectedStart = startTime !== null && time === startTime;
    const isSelectedEnd = endTime !== null && time === endTime;
    const isInRange = startTime !== null && endTime !== null && time > startTime && time < endTime;
    const isOutsideMonth = !isSameMonth(dateObj, viewDate);
    const isToday = today && time === today.getTime();

    const dayClasses = classNames(
      "flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500",
      isDisabled && "cursor-not-allowed text-slate-300",
      !isDisabled && isSelectedStart && "bg-pink-500 text-white",
      !isDisabled && isSelectedEnd && "bg-pink-500 text-white",
      !isDisabled && !isSelectedStart && !isSelectedEnd && isInRange && "bg-pink-100 text-pink-600",
      !isDisabled && !isSelectedStart && !isSelectedEnd && !isInRange && isOutsideMonth && "text-slate-400",
      !isDisabled && !isSelectedStart && !isSelectedEnd && !isInRange && !isOutsideMonth && "text-slate-700 hover:bg-pink-50"
    );

    const ariaLabelParts = [formatDisplayDate(iso) || iso];
    if (isToday) {
      ariaLabelParts.push("(hari ini)");
    }

    return (
      <button
        key={iso}
        type="button"
        data-day={iso}
        className={dayClasses}
        onClick={() => selectDay(iso, dateObj)}
        onKeyDown={(event) => handleDayKeyDown(event, dateObj)}
        disabled={isDisabled}
        role="gridcell"
        aria-selected={isSelectedStart || isSelectedEnd}
        aria-label={ariaLabelParts.join(" ")}
      >
        <span className="relative">
          {dateObj.getDate()}
          {isToday ? <span className="absolute left-1/2 top-[85%] -translate-x-1/2 block h-1 w-1 rounded-full bg-pink-500"></span> : null}
        </span>
      </button>
    );
  }

  const monthFormatter = useMemo(() => new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }), []);

  return (
    <div className={classNames("space-y-3", className)}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-slate-700">Pilih rentang tanggal</h4>
            <p className="text-xs text-slate-500">Klik tanggal mulai lalu tanggal selesai haidmu.</p>
          </div>
          <button
            type="button"
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500"
            onClick={() => setSimpleMode((previous) => !previous)}
            aria-pressed={simpleMode}
          >
            {simpleMode ? "Gunakan kalender interaktif" : "Gunakan input sederhana"}
          </button>
        </div>

        {simpleMode ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Tanggal mulai
              <input
                type="date"
                min={minDate ? toISO(minDate) : undefined}
                max={maxDate ? toISO(maxDate) : undefined}
                value={rangeValue.start || ""}
                onChange={(event) => {
                  const nextStart = event.target.value || null;
                  emitRange({ start: nextStart, end: rangeValue.end });
                }}
                className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Tanggal selesai
              <input
                type="date"
                min={rangeValue.start || (minDate ? toISO(minDate) : undefined)}
                max={maxDate ? toISO(maxDate) : undefined}
                value={rangeValue.end || ""}
                onChange={(event) => {
                  const nextEnd = event.target.value || null;
                  emitRange({ start: rangeValue.start, end: nextEnd });
                }}
                className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500"
              />
              <span className="text-xs text-slate-400">Kalau belum selesai, pilih perkiraan terbaikmu.</span>
            </label>
          </div>
        ) : (
          <>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!canGoPrev) return;
                  const previousMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
                  handleNavigation(previousMonth, toISO(previousMonth));
                }}
                disabled={!canGoPrev}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!canGoNext) return;
                  const nextMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
                  handleNavigation(nextMonth, toISO(nextMonth));
                }}
                disabled={!canGoNext}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 disabled:opacity-40"
              >
                Berikutnya
              </button>
            </div>
            <div className="rounded-2xl border border-pink-100 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">{monthFormatter.format(viewDate)}</p>
              </div>
              <div role="grid" aria-label="Kalender pemilihan rentang haid" className="grid grid-cols-7 gap-1" ref={gridRef}>
                {WEEKDAY_LABELS.map((label) => (
                  <div key={label} role="columnheader" className="h-8 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {label}
                  </div>
                ))}
                {calendarDays.map(renderDay)}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="rounded-xl bg-pink-50 px-4 py-3 text-xs text-pink-700">
        <p>
          Terpilih: {rangeValue.start ? formatDisplayDate(rangeValue.start) : "Belum ada"}
          {rangeValue.start ? " → " : ""}
          {rangeValue.start ? (rangeValue.end ? formatDisplayDate(rangeValue.end) : "pilih tanggal selesai") : ""}
        </p>
      </div>
    </div>
  );
}