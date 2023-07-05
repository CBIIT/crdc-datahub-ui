import A from "../content/questionnaire/sections/A";
import B from '../content/questionnaire/sections/B';
import C from "../content/questionnaire/sections/C";

/**
 * Configuration and mapping for Questionnaire Sections
 *
 * NOTE:
 * - The sections are rendered and navigated in the order they are defined here
 *
 * @see SectionConfig
 */
const sections: SectionConfig = {
  A: {
    title: "Principal Investigator & Contact Information",
    component: A,
  },
  B: {
    title: "Program & Study Registration",
    component: B,
  },
  C: {
    title: "Data Access and Disease Information",
    component: C,
  },
  D: {
    title: "Submission Data Types",
    component: null,
  },
  REVIEW: {
    title: "Review & Submit",
    component: null,
  },
};

export default sections;
