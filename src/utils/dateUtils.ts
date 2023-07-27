import dayjs from "dayjs";

/**
 * Format a date string to a specified pattern
 *
 * @param date input date string
 * @param pattern output date pattern
 * @param fallbackValue value to return if date is invalid or fails to format
 * @returns formatted date or fallbackValue if invalid
 */
export const FormatDate = (
  date: string,
  pattern = "M/D/YYYY",
  fallbackValue = null
): string => {
  const dateObj = dayjs(date);

  if (!dateObj?.isValid()) {
    return fallbackValue;
  }

  try {
    return dateObj?.format(pattern);
  } catch (e) {
    return fallbackValue;
  }
};
