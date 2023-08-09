import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Format a date string to a specified pattern
 *
 * @param date input date string
 * @param pattern output date pattern
 * @param fallbackValue value to return if date is invalid or fails to format
 * @param offsetTimezone whether to offset UTC to the user's timezone
 * @returns formatted date or fallbackValue if invalid
 */
export const FormatDate = (
  date: string,
  pattern = "M/D/YYYY",
  fallbackValue = null,
  offsetTimezone = true
): string => {
  const dateObj = offsetTimezone ? dayjs(date) : dayjs.utc(date);

  if (!dateObj?.isValid()) {
    return fallbackValue;
  }

  try {
    return dateObj?.format(pattern);
  } catch (e) {
    return fallbackValue;
  }
};
