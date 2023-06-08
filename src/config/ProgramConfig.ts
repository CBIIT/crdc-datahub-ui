/**
 * This is a special program option that is used
 * when the user selects "Other" from the program dropdown.
 *
 * NOTE: You probably don't need to modify this.
 *
 * @see ProgramOption
 */
export const OptionalProgram : ProgramOption = {
  title: "Other",
  abbreviation: "Other",
  studies: [],
  isCustom: true,
};

/**
 * This is a special study option that is used
 * when the user selects "Other" from the study dropdown.
 *
 * NOTE: You probably don't need to modify this.
 *
 * @see StudyOption
 */
export const OptionalStudy : StudyOption = {
  title: "Other",
  abbreviation: "Other",
  isCustom: true,
};

/**
 * Configuration for Questionnaire Section B Program List
 *
 * @see ProgramOption
 */
const options: ProgramOption[] = [
  {
    title: "ABC Long Name ABC",
    abbreviation: "ABC",
    studies: [
      { title: "ABC Study 1", abbreviation: "ABC1" },
      { title: "ABC Study 2", abbreviation: "ABC2" },
    ],
  },
  {
    title: "DEF Long Name DEF",
    abbreviation: "DEF",
    studies: [
      { title: "DEF Study 1", abbreviation: "DEF1" },
      { title: "DEF Study 2", abbreviation: "DEF2" },
    ],
  },
  {
    title: "GHI Long Name GHI",
    abbreviation: "GHI",
    studies: [],
  },
  {
    title: "JKL Long Name JKL",
    abbreviation: "JKL",
    studies: [
      { title: "JKL Study 1", abbreviation: "JKL1" },
      { title: "JKL Study 2", abbreviation: "JKL2" },
    ],
  },
  {
    title: "Example Pg",
    abbreviation: "EPG",
    studies: [
      { title: "Example Study 1", abbreviation: "ES1" },
    ],
  },
  // NOTE: This is a special program option that is used
  // ADD NEW PROGRAMS ABOVE THIS LINE
  OptionalProgram,
];

export default options;
