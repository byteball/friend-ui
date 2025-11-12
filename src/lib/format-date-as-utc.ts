import { formatInTimeZone } from "date-fns-tz";

/**
 * Formats a Date object as a UTC date string in "YYYY-MM-DD UTC" format.
 * 
 * @param date - Date object to format
 * @returns Formatted date string in UTC timezone (e.g., "2025-10-27")
 * 
 * @example
 * ```ts
 * const date = new Date("2025-10-27T14:30:00Z");
 * const formatted = formatDateAsUTC(date);
 * // Returns: "2025-10-27 UTC"
 * ```
 */
export const formatDateAsUTC = (date: Date): string => {
  return formatInTimeZone(date, "UTC", "yyyy-MM-dd");
};
