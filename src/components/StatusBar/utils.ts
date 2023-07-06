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
 * Format a phone number string to (###) ###-####
 *
 * @param phoneNumber input phone number string
 * @returns formatted phone number or original phoneNumber string if invalid
 */
export const FormatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digits from the string
  const cleanNumber = phoneNumber.replace(/\D/g, '');

  // Ensure we have exactly 10 digits for a valid US phone number
  if (cleanNumber.length !== 10) {
    // If we don't, return the original string
    return phoneNumber;
  }

  // Use a regex to insert the formatting elements
  const formatted = cleanNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');

  return formatted;
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
