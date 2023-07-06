import dayjs from "dayjs";

/**
 * Format a date string to specified pattern
 *
 * @param date input date string
 * @param pattern output date pattern
 * @returns formatted date or N/A if invalid
 */
export const FormatDate = (date: string, pattern = "M/D/YYYY"): string => {
  const dateObj = dayjs(date);

  if (!dateObj?.isValid()) {
    return "N/A";
  }

  try {
    return dateObj?.format(pattern);
  } catch (e) {
    return "N/A";
  }
};

/**
 * Sorts the form/questionnaire history by date and returns a copy
 * of the original array.
 *
 * @param history the questionnaire history
 * @returns sorted descending by date
 */
export const SortHistory = (history: HistoryEvent[]) : HistoryEvent[] => {
  if (!history || !(history instanceof Array)) {
    return [];
  }

  return [...history].sort((a, b) => (
    new Date(b.dateTime).valueOf() - new Date(a.dateTime).valueOf()
  ));
};
