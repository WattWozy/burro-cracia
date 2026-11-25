
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const ES_DATE = /^(\d{1,2})[/. -](\d{1,2})[/. -](\d{4})$/;

export function normalizeDate(value: unknown): string {
  if (value == null || value === "") return "";

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return "";
    return value.toISOString().split("T")[0];
  }

  if (typeof value !== "string") return "";

  const v = value.trim();
  if (!v) return "";
  const iso = ISO_DATE.exec(v);

  if (iso && isValidDateOnly(v)) return v;

  const es = ES_DATE.exec(v);
  if (!es) return v;

  const [, day, month, year] = es;
  const normalized =
    `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

  return isValidDateOnly(normalized) ? normalized : v;
}

export function isValidDateOnly(value: string): boolean {
  const match = ISO_DATE.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function formatSpanishDate(value?: string): string {
  const normalized = normalizeDate(value);
  if (!isValidDateOnly(normalized)) return "";

  const [year, month, day] = normalized.split("-");
  return `${day}/${month}/${year}`;
}
