type FormatResponseTimeOptions = {
  emptyLabel?: string;
};

export function formatResponseTime(
  seconds: number | null | undefined,
  options: FormatResponseTimeOptions = {}
) {
  if (seconds == null || Number.isNaN(seconds)) {
    return options.emptyLabel ?? "—";
  }

  const totalSeconds = Math.max(0, Math.round(seconds));

  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }

  const totalMinutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  if (totalMinutes < 60) {
    return remainingSeconds === 0 ? `${totalMinutes}m` : `${totalMinutes}m ${remainingSeconds}s`;
  }

  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  if (totalHours < 24) {
    return remainingMinutes === 0 ? `${totalHours}h` : `${totalHours}h ${remainingMinutes}m`;
  }

  const days = Math.floor(totalHours / 24);
  const remainingHours = totalHours % 24;
  return remainingHours === 0 ? `${days}d` : `${days}d ${remainingHours}h`;
}
