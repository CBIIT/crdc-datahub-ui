/**
 * Format a date string to M/D/YYYY
 *
 * @param date input date string
 * @returns formatted date or N/A if invalid
 */
export const FormatDate = (date: string) : string => {
  try {
    return Intl.DateTimeFormat("en-US").format(new Date(date));
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
