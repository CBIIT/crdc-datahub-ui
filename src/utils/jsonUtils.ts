/**
 * Safely parse a JSON string into an object.
 *
 * @param unsafeJson The JSON string to parse.
 * @param fallback The value to return if the JSON string is invalid.
 * @returns The parsed JSON object or the fallback value if the JSON string is invalid.
 */
export const safeParse = (unsafeJson: string, fallback = {}) => {
  try {
    const result = JSON.parse(unsafeJson);

    if (result === null || result === undefined) {
      return fallback;
    }

    return result;
  } catch (e) {
    return fallback;
  }
};
