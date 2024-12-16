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
 * If the abbreviation is provided and not equal to the name, it will be included in parentheses.
 *
 * @note The study name, at a minimum, should be provided.
 * @param studyName The full name of the study
 * @param studyAbbreviation The abbreviation of the study
 * @returns The formatted study name
 */
export const formatFullStudyName = (studyName: string, studyAbbreviation: string): string => {
  if (typeof studyName !== "string") {
    return "";
  }
  if (studyAbbreviation?.toLowerCase() === studyName?.toLowerCase()) {
    return studyName.trim();
  }
  if (studyAbbreviation && studyAbbreviation.length > 0) {
    return `${studyName.trim()} (${studyAbbreviation.trim()})`;
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
 * Given an array of Study IDs, return the first Formatted Study Name from the list of approved studies, sorted by the Study Name.
 *
 * @note MUI shows the first SELECTED item by default, this will show the first SORTED item
 * @param selectedIds Array of Study IDs
 * @param studyMap A map of the _ID: Study Name and Abbreviation
 * @returns The first formatted study name from the list of approved studies
 */
export const formatStudySelectionValue = (
  selectedIds: string[],
  studyMap: Record<string, string>,
  fallback = ""
): string => {
  if (!Array.isArray(selectedIds) || selectedIds.length === 0) {
    return fallback;
  }
  if (!studyMap || Object.keys(studyMap).length === 0) {
    return fallback;
  }

  const sortedStudies: string[] = selectedIds
    .map((studyID) => studyMap?.[studyID])
    .filter((study) => typeof study === "string" && study.length > 0)
    .sort((a: string, b: string) => a.localeCompare(b));

  if (sortedStudies.length === 0) {
    return fallback;
  }

  const joinedStudies = sortedStudies.join(", ");
  const trimmedJoin =
    joinedStudies.length > 30 ? `${joinedStudies.substring(0, 30)}...` : joinedStudies;

  return `${trimmedJoin}${sortedStudies.length > 1 ? ` (${sortedStudies.length})` : ""}`;
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
