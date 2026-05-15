const DAY_MS = 24 * 60 * 60 * 1000;

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function msFromMidnightToTimeInputValue(ms: number): string {
  const safe = Number.isFinite(ms) ? Math.max(0, Math.min(ms, DAY_MS - 1)) : 0;
  const totalMinutes = Math.floor(safe / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${pad(hours)}:${pad(minutes)}`;
}

export function timeInputValueToMsFromMidnight(value: string): number {
  const [hoursRaw, minutesRaw] = value.split(":");
  const hours = Number.parseInt(hoursRaw ?? "", 10);
  const minutes = Number.parseInt(minutesRaw ?? "", 10);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0;
  const normalizedHours = Math.max(0, Math.min(hours, 23));
  const normalizedMinutes = Math.max(0, Math.min(minutes, 59));
  return (normalizedHours * 60 + normalizedMinutes) * 60 * 1000;
}

export function msFromMidnightToHourMinute(ms: number): { hour: number; minute: number } {
  const safe = Number.isFinite(ms) ? Math.max(0, Math.min(ms, DAY_MS - 1)) : 0;
  const totalMinutes = Math.floor(safe / 60000);
  return {
    hour: Math.floor(totalMinutes / 60),
    minute: totalMinutes % 60,
  };
}

export function hourMinuteToMsFromMidnight(hour: number, minute: number): number {
  const h = Math.max(0, Math.min(Math.floor(hour), 23));
  const m = Math.max(0, Math.min(Math.floor(minute), 59));
  return (h * 60 + m) * 60 * 1000;
}
