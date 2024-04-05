/**
 * This is a special program option that is used
 * when the user selects "Other" from the program dropdown.
 *
 * NOTE: You probably don't need to modify this.
 *
 * @see ProgramOption
 */
export const OptionalProgram: ProgramOption = {
  name: "Other",
  abbreviation: null,
  editable: true,
  notApplicable: false,
  isCustom: true,
};

/**
 * This is a special program option that is used
 * when the user selects "Not Applicable" from the program dropdown.
 *
 * NOTE: You probably don't need to modify this.
 *
 * @see ProgramOption
 */
export const NotApplicableProgram: ProgramOption = {
  name: "Not Applicable",
  abbreviation: null,
  editable: false,
  notApplicable: true,
  isCustom: false,
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
    description:
      "NCI's Childhood Cancer Data Initiative (CCDI) is building a community centered around childhood cancer care and research data.",
    notApplicable: false,
    isCustom: false,
  },
  {
    name: "Clinical Proteomic Tumor Analysis Consortium",
    abbreviation: "CPTAC",
    description:
      "The National Cancer Institute's Clinical Proteomic Tumor Analysis Consortium (CPTAC) is a national effort to accelerate the understanding of the molecular basis of cancer through the application of large-scale proteome and genome analysis, or proteogenomics.",
    notApplicable: false,
    isCustom: false,
  },
  {
    name: "Division of Cancer Control and Population Sciences",
    abbreviation: "DCCPS",
    description:
      "The Division of Cancer Control and Population Sciences (DCCPS) plays a unique role in reducing the burden of cancer in America acting as NCI’s bridge to public health research, practice, and policy. DCCPS, an extramural division, has the lead responsibility at NCI for supporting research in surveillance, epidemiology, health services, behavioral science, and cancer survivorship.",
    notApplicable: false,
    isCustom: false,
  },
  {
    name: "Human Tumor Atlas Network",
    abbreviation: "HTAN",
    description:
      "HTAN is a collaborative network of Research Centers and a central Data Coordinating Center are constructing 3-dimensional atlases of the cellular, morphological, and molecular features of human cancers as they evolve from precancerous lesions to advanced disease. ",
    notApplicable: false,
    isCustom: false,
  },
  // NOTE: These are special program options that are used
  // ADD NEW PROGRAMS ABOVE THIS LINE
  OptionalProgram,
];

export default options;
