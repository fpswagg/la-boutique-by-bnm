"use client";

import { useMemo, useState } from "react";
import { dayLabelFr, dashboardFr } from "@/lib/dashboard/fr";
import {
  hourMinuteToMsFromMidnight,
  msFromMidnightToHourMinute,
} from "@/lib/time-of-day";
import { DashboardTextField } from "./FormFields";

type OpeningHourItem = {
  day: string;
  label: { fr: string; en: string; tr: string };
  opensAt: number;
  closesAt: number;
};

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function HourMinuteSelects({
  legend,
  hour,
  minute,
  onHour,
  onMinute,
}: {
  legend: string;
  hour: number;
  minute: number;
  onHour: (value: number) => void;
  onMinute: (value: number) => void;
}) {
  const hours = useMemo(() => Array.from({ length: 24 }, (_, index) => index), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, index) => index), []);

  return (
    <fieldset className="space-y-2 border border-[var(--border)]/60 p-3">
      <legend className="text-xs uppercase tracking-widest text-[var(--muted)] px-1">
        {legend}
      </legend>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-[var(--muted)]">{dashboardFr.store.time.hour}</span>
          <select
            value={hour}
            onChange={(event) => onHour(Number.parseInt(event.target.value, 10))}
            className="min-h-10 min-w-[4.5rem] px-2 py-1 border border-[var(--border)] bg-[var(--bg)]"
          >
            {hours.map((h) => (
              <option key={h} value={h}>
                {pad2(h)} h
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-[var(--muted)]">{dashboardFr.store.time.minute}</span>
          <select
            value={minute}
            onChange={(event) => onMinute(Number.parseInt(event.target.value, 10))}
            className="min-h-10 min-w-[4.5rem] px-2 py-1 border border-[var(--border)] bg-[var(--bg)]"
          >
            {minutes.map((m) => (
              <option key={m} value={m}>
                {pad2(m)}
              </option>
            ))}
          </select>
        </label>
      </div>
    </fieldset>
  );
}

export function OpeningHoursDayRow({ hour }: { hour: OpeningHourItem }) {
  const openParts = useMemo(() => msFromMidnightToHourMinute(hour.opensAt), [hour.opensAt]);
  const closeParts = useMemo(() => msFromMidnightToHourMinute(hour.closesAt), [hour.closesAt]);

  const [openHour, setOpenHour] = useState(openParts.hour);
  const [openMinute, setOpenMinute] = useState(openParts.minute);
  const [closeHour, setCloseHour] = useState(closeParts.hour);
  const [closeMinute, setCloseMinute] = useState(closeParts.minute);

  return (
    <article className="border border-[var(--border)] bg-[var(--surface)] p-4 space-y-4">
      <h3 className="font-medium tracking-wide">{dayLabelFr(hour.day)}</h3>

      <input type="hidden" name="openingDay" value={hour.day} />
      <input
        type="hidden"
        name="openingOpens"
        value={String(hourMinuteToMsFromMidnight(openHour, openMinute))}
      />
      <input
        type="hidden"
        name="openingCloses"
        value={String(hourMinuteToMsFromMidnight(closeHour, closeMinute))}
      />

      <div className="grid sm:grid-cols-2 gap-3">
        <HourMinuteSelects
          legend={dashboardFr.store.fields.opensAt}
          hour={openHour}
          minute={openMinute}
          onHour={setOpenHour}
          onMinute={setOpenMinute}
        />
        <HourMinuteSelects
          legend={dashboardFr.store.fields.closesAt}
          hour={closeHour}
          minute={closeMinute}
          onHour={setCloseHour}
          onMinute={setCloseMinute}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <DashboardTextField
          label={dashboardFr.store.fields.labelFr}
          name="openingLabelFr"
          defaultValue={hour.label.fr}
        />
        <DashboardTextField
          label={dashboardFr.store.fields.labelEn}
          name="openingLabelEn"
          defaultValue={hour.label.en}
        />
        <DashboardTextField
          label={dashboardFr.store.fields.labelTr}
          name="openingLabelTr"
          defaultValue={hour.label.tr}
        />
      </div>
    </article>
  );
}
