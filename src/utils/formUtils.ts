import { NotApplicableProgram, OtherProgram } from "../config/ProgramConfig";

/**
 * Generic Email Validator
 *
 * @see https://mailtrap.io/blog/validate-emails-in-react/
 * @param {string} email The email to validate
 * @returns {boolean} True if the email is valid, false otherwise
 */
export const validateEmail = (email: string): boolean => {
  const re = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
  return re.test(email);
};

/**
 * Reduce Content Options
 *
 * NOTE:
 * - This util is for modifying the shape of the options
 *   into a form that FormGroupCheckbox accepts as a value.
 * - This is for when you want to contain checkboxes inside
 *   a single form group, but want separate properties/names
 *   for each checkbox. This will check the property value and
 *   name coming from data and add the name to the array if it's
 *   true, otherwise it will not include it.
 *
 * @param {SectionItemContentOption[]} options The options, usually coming from config
 * @returns {string[]} The re-shaped options. Ex. ["name1", "name2"]
 */
export const reshapeCheckboxGroupOptions = (
  options: FormGroupCheckboxOption[],
  data: QuestionnaireData
): string[] =>
  options.reduce((acc, option) => (data[option.name] ? [...acc, option.value] : acc), []);

/**
 * Generic Non-Numeric Character Filter
 *
 * @param {string} value The value to filter
 * @returns {string} The filtered value
 */
export const filterNonNumeric = (value: string): string => value.replace(/[^0-9]/g, "");

/**
 * Filters input fields for Phone Numbers (numeric and dashes)
 *
 * @param {string} value The value to filter
 * @returns {string} The filtered value
 */
export const filterForNumbers = (value: string): string => value?.replace(/[^0-9- ]+/g, "");

/**
 * Adds a semi-stable key to the object
 *
 * NOTE:
 * - This should be used at the state level,
 *   not when rendering the object.
 *
 * @param {any} obj the object to map
 * @param {number} index the index of the object
 * @returns {any} the object with a key
 */
export const mapObjectWithKey = (obj, index: number) => ({
  ...obj,
  key: `${index}_${new Date().getTime()}`,
});

/**
 * Given a program from a form, find either a pre-defined program,
 * 'Not Applicable' program, or 'Other' program.
 *
 * @param {ProgramInput} formProgram The program as defined in the form
 * @param {ProgramInput[]} programOptions The pre-defined program options
 * @returns {ProgramInput | null} The pre-defined/custom program, or null if program is empty/invalid
 */
export const findProgram = (
  formProgram: ProgramInput,
  programOptions: ProgramInput[]
): ProgramInput | null => {
  if (!formProgram || !programOptions?.length) {
    return null;
  }

  const hasContent =
    formProgram?._id?.length > 0 ||
    formProgram?.name?.length > 0 ||
    formProgram?.description?.length > 0 ||
    formProgram?.abbreviation?.length > 0;

  // In 3.2.0, the notApplicable property was removed
  if (!hasContent && "notApplicable" in formProgram && formProgram?.notApplicable === true) {
    return NotApplicableProgram;
  }

  if (!hasContent) {
    return null;
  }

  const allProgramOptions = [NotApplicableProgram, ...programOptions, OtherProgram];
  const existingProgram = allProgramOptions?.find((program) => program._id === formProgram._id);

  if (existingProgram?._id === OtherProgram?._id) {
    return formProgram;
  }

  // Return existing program, otherwise assume the content is "Other"
  return (
    existingProgram ?? {
      ...formProgram,
      _id: OtherProgram._id,
    }
  );
};

/**
 * Formats an Approved Study Name and Abbreviation into a single string.
 * Prioritizes the display of Abbreviation over Study Name.
 *
 * Examples:
 * - Both values are provided – "Abbreviation - Study Name"
 * - Only study name is provided – "Study Name"
 * - Both values are the same (case-insensitive) – "Study Abbreviation"
 *
 * @param studyName The full name of the study
 * @param studyAbbreviation The abbreviation of the study
 * @returns The formatted study name or empty string if something is invalid
 */
export const formatFullStudyName = (studyName: string, studyAbbreviation: string): string => {
  if (typeof studyName !== "string") {
    return "";
  }
  if (studyAbbreviation?.toLowerCase() === studyName?.toLowerCase()) {
    return studyAbbreviation.trim();
  }
  if (studyAbbreviation && studyAbbreviation.length > 0) {
    return `${studyAbbreviation.trim()} - ${studyName.trim()}`;
  }

  return studyName.trim();
};

/**
 * Attempts to map a study name + abbreviation combination to an approved study ID.
 *
 * - Will return the first match found
 * - If the orgStudy already has an ID, it will be returned
 * - If no match is found, an empty string is returned
 *
 * @param Study information from Organization object
 * @param studies List of approved studies
 * @returns The ID of the study if found, otherwise an empty string
 */
export const mapOrganizationStudyToId = (
  orgStudy: Pick<ApprovedStudy, "studyName" | "studyAbbreviation">,
  studies: Pick<ApprovedStudy, "_id" | "studyName" | "studyAbbreviation">[]
): ApprovedStudy["_id"] => {
  const { studyName, studyAbbreviation } = orgStudy || {};

  if (orgStudy && "_id" in orgStudy && typeof orgStudy._id === "string") {
    return orgStudy?._id;
  }

  return (
    studies?.find(
      (study) => study?.studyName === studyName && study?.studyAbbreviation === studyAbbreviation
    )?._id || ""
  );
};

/**
 * Validates an ORCID string. An ORCID must consist of exactly four groups of four alphanumeric characters,
 * with each group separated by a hyphen. Only digits and the letter 'X' are allowed
 * as characters. The letter 'X' is only allowed as the final character.
 *
 * @see https://gist.github.com/asencis/644f174855899b873131c2cabcebeb87?permalink_comment_id=4210539#gistcomment-4210539
 * @param {string} id The ORCID string to validate.
 * @returns {boolean} Returns true if the string is a valid ORCID, false otherwise.
 */
export const isValidORCID = (id: string): boolean => {
  if (typeof id !== "string" || id?.length !== 19) {
    return false;
  }

  const idPattern = /^(\d{4}-){3}\d{3}(\d|X)$/;
  return idPattern.test(id);
};

/**
 * Filters and formats input for an ORCID as the user types. This function will automatically insert hyphens
 * after every group (4 characters), uppercase any 'x' typed by the user, and ensures that only numeric
 * characters and 'X' are allowed. If the user types more than 16 valid characters or places them
 * incorrectly, those characters are ignored.
 *
 * @param {string} input The current raw input string from the user.
 * @returns {string} The formatted ORCID string following the validation rules.
 */
export const formatORCIDInput = (input: string): string => {
  if (!input?.length) {
    return "";
  }

  const ORCID_LENGTH = 16;
  const GROUP_SIZE = 4;
  const DISALLOWED_CHARS_REGEX = /[^0-9X]/g; // Everything except 0-9 digits or character "X"

  const formattedInput = input
    .toUpperCase()
    .replace(DISALLOWED_CHARS_REGEX, "")
    .substring(0, ORCID_LENGTH);

  // Split into groups of 4 and join with hyphens
  return formattedInput.split("").reduce((acc, curr, idx) => {
    if (idx > 0 && idx % GROUP_SIZE === 0) {
      acc += "-";
    }

    return acc + curr;
  }, "");
};

/**
 * Provides a validation function to test against a string for invalid characters.
 *
 * @param value The input string to validate
 * @returns A string if the value contains invalid characters, otherwise null
 */
export const validateEmoji = (value: string): string | null => {
  const EmojiRegex =
    /(?![*#0-9]+)[\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Component}\p{Emoji_Modifier_Base}\p{Emoji_Presentation}]/u;

  if (EmojiRegex.test(value)) {
    return "This field contains invalid characters";
  }

  return null;
};

/**
 * Provides a validation function to test against a string for non-UTF8 characters.
 *
 * NOTE:
 * This is more restrictive than {@link validateEmoji} and will not allow any characters
 * outside the standard ASCII range (0-127).
 *
 * @param value The input string to validate
 * @returns A string if the value contains non-UTF8 characters, otherwise null if valid
 */
export const validateUTF8 = (value: string): string | null => {
  if (typeof value !== "string" || value?.split("").some((char) => char.charCodeAt(0) > 127)) {
    return "This field contains invalid characters";
  }

  return null;
};

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
