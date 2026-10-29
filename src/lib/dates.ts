const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function parseDay(value: string): Date {
  if (!DAY_PATTERN.test(value)) throw new Error("Date must be in YYYY-MM-DD format");
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (formatDay(date) !== value) throw new Error("Invalid calendar date");
  return date;
}

export function formatDay(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

export function todayUTC(): string {
  return formatDay(new Date());
}

export function addDays(day: string, amount: number): string {
  const date = parseDay(day);
  date.setUTCDate(date.getUTCDate() + amount);
  return formatDay(date);
}

export function daysBetweenInclusive(from: string, to: string): number {
  return Math.floor((parseDay(to).getTime() - parseDay(from).getTime()) / 86_400_000) + 1;
}
