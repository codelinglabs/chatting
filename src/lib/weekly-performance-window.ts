export function utcDay(value: Date) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

export function addUtcDays(value: Date, days: number) {
  const next = new Date(value);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function startOfUtcWeek(value: Date) {
  const day = utcDay(value);
  const diff = day.getUTCDay() === 0 ? -6 : 1 - day.getUTCDay();
  return addUtcDays(day, diff);
}

export function dateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function buildDateRangeLabel(start: Date, end: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  });

  return `${formatter.format(start)} - ${formatter.format(addUtcDays(end, -1))}`;
}
