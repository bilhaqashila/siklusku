"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatDisplayDate } from "@/lib/siklus/cycleMath";

const WEEKDAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function cx(...vals) {
  return vals.filter(Boolean).join(" ");
}

function normalizeInputDate(value) {
  if (!value && value !== 0) return null;
  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
  if (typeof value === "string") {
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function addDays(date, n) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
}
function isSameMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}
function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function CalendarRange({
  value = {},
  onChange,
  max,
  min,
  className,
  ariaInvalid = false,
  ariaDescribedBy,
}) {
  const today = normalizeInputDate(new Date());
  const maxDate = normalizeInputDate(max) || today;
  const minDate = normalizeInputDate(min);
  const startDate = normalizeInputDate(value.start);
  const endDate = normalizeInputDate(value.end);

  const initialView = startDate || endDate || maxDate || today;
  const [viewDate, setViewDate] = useState(initialView);

  const pendingFocusRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    if (startDate && !isSameMonth(startDate, viewDate)) setViewDate(startDate);
  }, [value.start]);
  useEffect(() => {
    if (!startDate && endDate && !isSameMonth(endDate, viewDate)) setViewDate(endDate);
  }, [value.end]);

  useEffect(() => {
    if (pendingFocusRef.current && gridRef.current) {
      const el = gridRef.current.querySelector(`[data-day="${pendingFocusRef.current}"]`);
      if (el) {
        el.focus();
        pendingFocusRef.current = null;
      }
    }
  }, [viewDate, startDate, endDate]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(viewDate);
    const firstWeekday = (monthStart.getDay() + 6) % 7; // Monday-first
    const gridStart = addDays(monthStart, -firstWeekday);
    return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  }, [viewDate]);

  const canGoPrev =
    !minDate ||
    viewDate.getFullYear() > minDate.getFullYear() ||
    (viewDate.getFullYear() === minDate.getFullYear() &&
      viewDate.getMonth() > minDate.getMonth());
  const canGoNext =
    !maxDate ||
    viewDate.getFullYear() < maxDate.getFullYear() ||
    (viewDate.getFullYear() === maxDate.getFullYear() &&
      viewDate.getMonth() < maxDate.getMonth());

  const startTime = startDate ? startDate.getTime() : null;
  const endTime = endDate ? endDate.getTime() : null;
  const maxTime = maxDate ? maxDate.getTime() : null;
  const minTime = minDate ? minDate.getTime() : null;

  const rangeValue = useMemo(
    () => ({
      start: startDate ? toISO(startDate) : null,
      end: endDate ? toISO(endDate) : null,
    }),
    [startDate, endDate]
  );

  function emitRange(nextRange) {
    if (typeof onChange !== "function") return;
    onChange({
      start: nextRange.start || null,
      end: nextRange.end || null,
    });
  }

  function selectDay(dateIso, dateObj) {
    const t = dateObj.getTime();
    if ((minTime !== null && t < minTime) || (maxTime !== null && t > maxTime)) return;

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
    const el = gridRef.current.querySelector(`[data-day="${dateIso}"]`);
    if (el) {
      el.focus();
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
    const keyMap = { ArrowRight: 1, ArrowLeft: -1, ArrowUp: -7, ArrowDown: 7 };
    if (keyMap[event.key]) {
      event.preventDefault();
      const target = addDays(dateObj, keyMap[event.key]);
      const iso = toISO(target);
      if (!isSameMonth(target, viewDate)) handleNavigation(target, iso);
      else focusDay(iso);
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
    const disabled =
      (minTime !== null && time < minTime) || (maxTime !== null && time > maxTime);
    const isStart = startTime !== null && time === startTime;
    const isEnd = endTime !== null && time === endTime;
    const inRange =
      startTime !== null && endTime !== null && time > startTime && time < endTime;
    const outside = !isSameMonth(dateObj, viewDate);
    const isToday = today && time === today.getTime();

    const classes = cx(
      "flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500",
      disabled && "cursor-not-allowed text-slate-300",
      !disabled && (isStart || isEnd) && "bg-pink-500 text-white",
      !disabled && !isStart && !isEnd && inRange && "bg-pink-100 text-pink-600",
      !disabled && !isStart && !isEnd && !inRange && outside && "text-slate-400",
      !disabled && !isStart && !isEnd && !inRange && !outside && "text-slate-700 hover:bg-pink-50"
    );

    const aria = [formatDisplayDate(iso) || iso];
    if (isToday) aria.push("(hari ini)");

    return (
      <button
        key={iso}
        type="button"
        data-day={iso}
        className={classes}
        onClick={() => selectDay(iso, dateObj)}
        onKeyDown={(e) => handleDayKeyDown(e, dateObj)}
        disabled={disabled}
        role="gridcell"
        aria-selected={isStart || isEnd}
        aria-label={aria.join(" ")}
      >
        <span className="relative">
          {dateObj.getDate()}
          {isToday ? (
            <span className="absolute left-1/2 top-[85%] -translate-x-1/2 block h-1 w-1 rounded-full bg-pink-500" />
          ) : null}
        </span>
      </button>
    );
  }

  const monthFormatter = useMemo(
    () => new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }),
    []
  );

  return (
    <div className={cx("space-y-3", className)}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-slate-700">Pilih rentang tanggal</h4>
            <p className="text-xs text-slate-500">
              Klik tanggal mulai lalu tanggal selesai haidmu.
            </p>
          </div>

          {/* Month navigation only */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                if (!canGoPrev) return;
                const prev = new Date(
                  viewDate.getFullYear(),
                  viewDate.getMonth() - 1,
                  1
                );
                handleNavigation(prev, toISO(prev));
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
                const next = new Date(
                  viewDate.getFullYear(),
                  viewDate.getMonth() + 1,
                  1
                );
                handleNavigation(next, toISO(next));
              }}
              disabled={!canGoNext}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 disabled:opacity-40"
            >
              Berikutnya
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-pink-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">
              {monthFormatter.format(viewDate)}
            </p>
          </div>

          <div
            role="grid"
            aria-label="Kalender pemilihan rentang haid"
            aria-invalid={ariaInvalid ? "true" : undefined}
            aria-describedby={ariaDescribedBy}
            className="grid grid-cols-7 gap-1"
            ref={gridRef}
          >
            {WEEKDAY_LABELS.map((label) => (
              <div
                key={label}
                role="columnheader"
                className="h-8 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400"
              >
                {label}
              </div>
            ))}
            {calendarDays.map(renderDay)}
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-pink-50 px-4 py-3 text-xs text-pink-700">
        <p>
          Terpilih:{" "}
          {rangeValue.start ? formatDisplayDate(rangeValue.start) : "Belum ada"}
          {rangeValue.start ? " → " : ""}
          {rangeValue.start
            ? rangeValue.end
              ? formatDisplayDate(rangeValue.end)
              : "pilih tanggal selesai"
            : ""}
        </p>
      </div>
    </div>
  );
}
