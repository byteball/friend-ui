import { addDays, formatDuration, intervalToDuration } from "date-fns";

export const formatDays = (days: number): string => {
  const start = new Date(0);
  const end = addDays(start, days);

  const duration = intervalToDuration({ start, end });

  return formatDuration(duration, {
    format: ["years", "months", "days"],
    delimiter: ", ",
    zero: false,
  }).replace(/,([^,]*)$/, " and$1");
}
