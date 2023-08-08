/**
 * This is a special program option that is used
 * when the user selects "Other" from the program dropdown.
 *
 * NOTE: You probably don't need to modify this.
 *
 * @see ProgramOption
 */
export const OptionalProgram : ProgramOption = {
  name: "Other",
  abbreviation: null,
  editable: true,
  notApplicable: false,
};

/**
 * This is a special program option that is used
 * when the user selects "Not Applicable" from the program dropdown.
 *
 * NOTE: You probably don't need to modify this.
 *
 * @see ProgramOption
 */
export const NotApplicableProgram : ProgramOption = {
  name: "Not Applicable",
  abbreviation: null,
  editable: false,
  notApplicable: true
};

/**
 * Configuration for Questionnaire Section B Program List
 *
 * @see ProgramOption
 */
const options: ProgramOption[] = [
  NotApplicableProgram,
  {
    name: "Childhood Cancer Data Initiative",
    abbreviation: "CCDI",
    notApplicable: false,
  },
  {
    name: "Human Tumor Atlas Network",
    abbreviation: "HTAN",
    notApplicable: false,
  },
  // NOTE: These are special program options that are used
  // ADD NEW PROGRAMS ABOVE THIS LINE
  OptionalProgram,
];

export default options;
