"use client";

import { STORE } from "@/constant";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "../../../middleware";

interface OpeningHoursProps {
  dict: Dictionary;
  locale: Locale;
}

function msToTime(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function isOpenNow(opensAt: number, closesAt: number): boolean {
  const now = new Date();
  const ms = (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) * 1000;
  return ms >= opensAt && ms < closesAt;
}

export function OpeningHours({ dict, locale }: OpeningHoursProps) {
  const now = new Date();
  const todayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1;

  return (
    <div className="border border-[var(--border)] p-6 bg-[var(--surface)]">
      <h3 className="text-xs font-medium tracking-[0.3em] uppercase text-[var(--muted)] mb-6">
        {dict.contact.hours_title}
      </h3>

      <ul className="space-y-3">
        {STORE.openingHours.map((slot, i) => {
          const isToday = i === todayIndex;
          const open = isToday && isOpenNow(slot.opensAt as unknown as number, slot.closesAt as unknown as number);

          return (
            <li
              key={slot.day}
              className={`flex items-center justify-between text-sm gap-4 ${
                isToday ? "font-medium" : "text-[var(--muted)]"
              }`}
            >
              <span className="w-28">{slot.label[locale]}</span>
              <span className="flex-1 border-b border-dashed border-[var(--border)]" />
              <span>
                {msToTime(slot.opensAt as unknown as number)} — {msToTime(slot.closesAt as unknown as number)}
              </span>
              {isToday && (
                <span
                  className={`text-[10px] font-medium tracking-widest uppercase px-2 py-0.5 ${
                    open
                      ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                      : "bg-[var(--border)] text-[var(--muted)]"
                  }`}
                >
                  {open ? dict.common.open_now : dict.common.closed_now}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
