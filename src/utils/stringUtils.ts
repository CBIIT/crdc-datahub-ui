/**
 * Capitalizes the first letter of a given string.
 * If the input string is empty, it returns an empty string.
 *
 * @param {string} str - The string to capitalize.
 * @returns {string} - The capitalized string or an empty string if the input is empty.
 */
export const capitalizeFirstLetter = (str: string): string =>
  str ? str[0].toUpperCase() + str.slice(1) : "";

/**
 * Capitalizes the first letter of each word in a given string.
 *
 * @see Utilizes {@link capitalizeFirstLetter} to capitalize each word.
 * @param str - The string to capitalize.
 * @returns The capitalized string.
 */
export const titleCase = (str: string): string => {
  if (typeof str !== "string") {
    return "";
  }

  return str
    .toLowerCase()
    .split(" ")
    .map((word) => capitalizeFirstLetter(word))
    .join(" ");
};

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

/**
 * Filters out all characters from a string except for alphanumeric characters.
 * Can be customized to allow additional characters
 *
 * @param {string} input The input string to be filtered
 * @param {string} [extraChars=""] Additional characters to allow in the filtered string
 * @returns {string} The filtered string containing only alphanumeric characters and any
 * additional allowed characters. Returns formatted string, otherwise if no value is passed,
 * then it returns an empty string
 */
export const filterAlphaNumeric = (input: string, extraChars = ""): string => {
  // The base regex matches alphanumeric characters.
  // We add the `extraChars` by splitting it into individual characters, escaping each one, and then joining with "|".
  // This ensures characters with special meaning in regex (like ".") are treated as literal characters.
  const pattern = new RegExp(
    `[^a-zA-Z0-9${extraChars
      .split("")
      .map((char) => `\\${char}`)
      .join("|")}]`,
    "g"
  );

  // We replace characters that don't match the allowed set with an empty string.
  return input?.replace(pattern, "") || "";
};

/**
 * Filters a string to allow only positive integers.
 *
 * @param {string} input The input string to be filtered
 * @returns {string} A string containing only positive integers, otherwise an empty string
 */
export const filterPositiveIntegerString = (input: string): string => {
  if (!input) {
    return "";
  }

  const nonIntegerPattern = /[^0-9]/g;
  const filtered = input.replace(nonIntegerPattern, "");

  // Remove leading zeros using a regular expression
  const noLeadingZeros = filtered.replace(/^0+/, "");

  return noLeadingZeros || "";
};

/**
 * Compares two string values for sorting in an array. Non-empty strings are sorted
 * alphabetically, and `null` or empty strings are placed at the beginning.
 *
 * @param {string | null} a - The first string to compare.
 * @param {string | null} b - The second string to compare.
 * @returns {number} - A negative number if `a` should come before `b`, a positive number
 * if `a` should come after `b`, or zero if they are considered equal for sorting purposes.
 */
export const compareStrings = (a: string | null, b: string | null): number => {
  if (a === b) return 0;
  if (!a || a === "") return -1;
  if (!b || b === "") return 1;

  return a.localeCompare(b);
};
