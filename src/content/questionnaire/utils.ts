import { FormGroupCheckboxOption } from '../../components/Questionnaire/FormGroupCheckbox';
import programOptions, { BlankProgram, BlankStudy, OptionalProgram, OptionalStudy } from '../../config/ProgramConfig';

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
export const reshapeCheckboxGroupOptions = (options: FormGroupCheckboxOption[], data: QuestionnaireData): string[] => (
  options.reduce((acc, option) => (data[option.name] ? [...acc, option.value] : acc), [])
);

/**
 * Generic Non-Numeric Character Filter
 *
 * @param {string} value The value to filter
 * @returns {string} The filtered value
 */
export const filterNonNumeric = (value: string): string => value.replace(/[^0-9]/g, '');

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
  key: `${index}_${new Date().getTime()}`
});

/**
 * Finds the program option by name (name)
 *
 * NOTE:
 * - This util helps differentiate between a
 *   saved CUSTOM program and a PRESELECTED
 *   program option.
 * - This util also adds the OptionalStudy and
 *   a BlankStudy to the study options.
 * - If a valid name or abbreviation exists
 *   then it will default to OptionalProgram,
 *   otherwise, it will return a BlankProgram
 *
 * @param {string} name the name of the program
 * @returns {ProgramOption} the program option
 */
export const findProgram = (name: string, abbreviation: string): ProgramOption => {
  const program : ProgramOption = programOptions.find((option) => option.name === name && option.abbreviation === abbreviation);
  const optionalOrBlankFallback = name || abbreviation || program?.name || program?.abbreviation ? OptionalProgram : BlankProgram;
  const realProgram = program || optionalOrBlankFallback;

  const newProgram = {
    ...realProgram,
    studies: [...realProgram.studies, BlankStudy, OptionalStudy]
  };

  return newProgram;
};

/**
 * Finds the study option by name (name)
 *
 * NOTE:
 * - If a valid name or abbreviation exists
 *   then it will default to OptionalStudy,
 *   otherwise, it will return a BlankStudy
 *
 * @param {string} name the name of the study
 * @param {ProgramOption} activeProgram the active program with the study options
 * @returns {StudyOption} the study option that matches the name
 */
export const findStudy = (name: string, abbreviation: string, activeProgram: ProgramOption): StudyOption => {
  const study : StudyOption = activeProgram?.studies?.find((option) => option.name === name && option.abbreviation === abbreviation);
  const optionalOrBlankFallback = name || abbreviation || study?.name || study?.abbreviation ? OptionalStudy : BlankStudy;
  return study || optionalOrBlankFallback;
};
