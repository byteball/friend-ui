/**
 * Parses a date string from Autonomous Agent state in format "YYYY-MM-DD" to Date object.
 * 
 * @param aaDateString - Date string in format "YYYY-MM-DD" (e.g., "2025-10-27")
 * @returns Date object in UTC timezone
 * @throws Error if date string is empty, invalid format, or represents invalid date
 * 
 * @example
 * ```ts
 * const date = parseDateFromAA("2025-10-27");
 * // Returns: Date object representing 2025-10-27 00:00:00 UTC
 * ```
 */
export const parseDateFromAA = (aaDateString: string): Date => {
  if (!aaDateString) {
    throw new Error("parseDateFromAA: date string is required");
  }

  const parts = aaDateString.split("-");
  if (parts.length !== 3) {
    throw new Error(
      `parseDateFromAA: invalid date format "${aaDateString}". Expected format: "YYYY-MM-DD"`
    );
  }

  const [year, month, day] = parts.map(Number);

  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    throw new Error(
      `parseDateFromAA: invalid date values in "${aaDateString}". Expected numeric values.`
    );
  }

  const date = new Date(Date.UTC(year, month - 1, day));

  // Validate the date is real (e.g., not February 31st)
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(
      `parseDateFromAA: invalid date "${aaDateString}". Date does not exist.`
    );
  }

  return date;
};
