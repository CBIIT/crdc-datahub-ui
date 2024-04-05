/**
 * Updates the validity of an HTMLInputElement by setting a custom validation message.
 *
 * @param inputRef - The reference to the HTMLInputElement to be validated
 * @param message - The custom validation message to be set. Defaults to an empty string if not provided.
 */
export const updateInputValidity = (
  inputRef: React.RefObject<HTMLInputElement>,
  message = ""
): void => {
  if (!inputRef?.current) {
    return; // Invalid ref
  }
  if (typeof inputRef.current.setCustomValidity !== "function") {
    return; // Input element doesn't support custom validity
  }

  inputRef.current.setCustomValidity(message);
};

/**
 *  Updates the validity of a MUI select component by setting a custom validation message.
 *
 * NOTE: This interfaces with the MUI Select ref which returns { node, value, focus }
 *
 * @param selectRef - the reference to the MUI select component to be validated
 * @param message - The custom validation message to be set. Defaults to an empty string if not provided.
 */
export const updateSelectValidity = (selectRef, message = ""): void => {
  if (!selectRef?.current?.node) {
    return; // Invalid ref
  }
  if (typeof selectRef.current.node?.setCustomValidity !== "function") {
    return; // Input element doesn't support custom validity
  }

  selectRef.current.node.setCustomValidity(message);
};

/**
 * Validates whether a given value (string or number) lies within a specified range.
 *
 * @param value - The value to be validated. It can be of type string or number.
 *                If it's a string, the function will attempt to parse a number from it.
 * @param min - The minimum allowed value. Defaults to 0 if not provided.
 * @param max - The maximum allowed value. Optional.
 * @param allowFloat - A boolean indicating whether floating point numbers are considered
 *                     valid. Defaults to false.
 * @returns A boolean indicating whether the value passed the validation or not.
 *          Returns false if the value is NaN after being parsed or if it doesn't
 *          fall within the min and max parameters.
 */
export const isValidInRange = (
  value: string | number,
  min = 0,
  max?: number,
  allowFloat = false
): boolean => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (Number.isNaN(numValue)) {
    return false;
  }
  if (!allowFloat && !Number.isInteger(numValue)) {
    return false;
  }
  if (numValue < min || (max !== undefined && numValue > max)) {
    return false;
  }

  return true;
};
