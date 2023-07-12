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
