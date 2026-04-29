export type LocalDateTimeParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

export const timezoneOptions = [
  { value: "Europe/Moscow", label: "Москва" },
  { value: "Europe/Kaliningrad", label: "Калининград" },
  { value: "Europe/Samara", label: "Самара" },
  { value: "Asia/Yekaterinburg", label: "Екатеринбург" },
  { value: "Asia/Omsk", label: "Омск" },
  { value: "Asia/Krasnoyarsk", label: "Красноярск" },
  { value: "Asia/Irkutsk", label: "Иркутск" },
  { value: "Asia/Yakutsk", label: "Якутск" },
  { value: "Asia/Vladivostok", label: "Владивосток" },
  { value: "Asia/Kamchatka", label: "Камчатка" },
  { value: "UTC", label: "UTC" },
] as const;

export function toLocalDateTimeValueInZone(value: string | null, timezone: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return formatDateTimeInZone(date, timezone);
}

export function toComparableDateTime(value: string, timezone: string): string | undefined {
  if (!value) return undefined;
  const normalizedTimezone = timezone.trim();
  const parts = parseLocalDateTime(value);
  if (!parts) return value;
  return normalizedTimezone ? toRfc3339(value, normalizedTimezone) : formatLocalDateTimeValue(parts);
}

export function toRfc3339(localValue: string, timezone: string): string {
  if (!localValue) return "";
  const parts = parseLocalDateTime(localValue);
  if (!parts) throw new Error("invalid local datetime");
  const initialUtc = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, 0));
  const firstOffset = getTimezoneOffsetMinutes(initialUtc, timezone);
  const adjustedUtc = new Date(initialUtc.getTime() - firstOffset * 60_000);
  const finalOffset = getTimezoneOffsetMinutes(adjustedUtc, timezone);
  return `${formatLocalDateTimeValue(parts)}:00${formatOffset(finalOffset)}`;
}

function formatDateTimeInZone(date: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    hour12: false,
  }).formatToParts(date);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";
  const hour = value("hour") === "24" ? "00" : value("hour");
  return `${value("day")}.${value("month")}.${value("year")} ${hour}:${value("minute")}`;
}

function getTimezoneOffsetMinutes(date: Date, timezone: string): number {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    hour12: false,
  }).formatToParts(date);
  const numeric = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  const localAsUtc = Date.UTC(
    numeric("year"),
    numeric("month") - 1,
    numeric("day"),
    numeric("hour"),
    numeric("minute"),
    numeric("second"),
  );
  return Math.round((localAsUtc - date.getTime()) / 60_000);
}

function formatOffset(offsetMinutes: number): string {
  if (offsetMinutes === 0) return "Z";
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const hours = String(Math.floor(abs / 60)).padStart(2, "0");
  const minutes = String(abs % 60).padStart(2, "0");
  return `${sign}${hours}:${minutes}`;
}

function parseLocalDateTime(value: string): LocalDateTimeParts | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const russianMatch = trimmed.match(/^(\d{2})\.(\d{2})\.(\d{4})[ T](\d{2}):(\d{2})$/);
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  const parts = russianMatch
    ? {
        day: Number(russianMatch[1]),
        month: Number(russianMatch[2]),
        year: Number(russianMatch[3]),
        hour: Number(russianMatch[4]),
        minute: Number(russianMatch[5]),
      }
    : isoMatch
      ? {
          year: Number(isoMatch[1]),
          month: Number(isoMatch[2]),
          day: Number(isoMatch[3]),
          hour: Number(isoMatch[4]),
          minute: Number(isoMatch[5]),
        }
      : null;

  if (!parts) return null;
  const candidate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, 0));
  if (
    candidate.getUTCFullYear() !== parts.year ||
    candidate.getUTCMonth() !== parts.month - 1 ||
    candidate.getUTCDate() !== parts.day ||
    candidate.getUTCHours() !== parts.hour ||
    candidate.getUTCMinutes() !== parts.minute
  ) {
    return null;
  }
  return parts;
}

function formatLocalDateTimeValue(parts: LocalDateTimeParts): string {
  const year = String(parts.year).padStart(4, "0");
  const month = String(parts.month).padStart(2, "0");
  const day = String(parts.day).padStart(2, "0");
  const hour = String(parts.hour).padStart(2, "0");
  const minute = String(parts.minute).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
}
