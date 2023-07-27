/**
 * Function to add a space between a number and a letter in a string.
 * @param input - The input string to be processed. It should be a string where a number is directly followed by a letter.
 * @returns The processed string with a space between the number and the letter. If the input string does not match the required pattern, the function will return the original string.
 */
export const addSpace = (input: string): string => {
  // Regular expression to match a pattern where a number is directly followed by a letter
  const regex = /(\d+)([a-zA-Z]+)/g;

  if (!regex.test(input)) {
    return input;
  }

  // Replace the matched pattern with the same pattern but with a space in between
  return input.replace(regex, "$1 $2");
};

/**
 * Format a phone number string to (###) ###-####
 *
 * @param phoneNumber input phone number string
 * @returns formatted phone number or original phoneNumber string if invalid
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digits from the string
  const cleanNumber = phoneNumber.replace(/\D/g, "");

  // Ensure we have exactly 10 digits for a valid US phone number
  if (cleanNumber.length !== 10) {
    // If we don't, return the original string
    return phoneNumber;
  }

  // Use a regex to insert the formatting elements
  const formatted = cleanNumber.replace(/(\d{3})(\d{3})(\d{4})/, "($1)$2-$3");

  return formatted;
};
