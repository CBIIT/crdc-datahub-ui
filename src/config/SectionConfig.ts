import A from "../content/questionnaire/sections/A";
import B from '../content/questionnaire/sections/B';
import C from "../content/questionnaire/sections/C";
import D from '../content/questionnaire/sections/D';

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
    id: "A",
    component: A,
  },
  B: {
    title: "Program & Study Registration",
    id: "A",
    component: B,
  },
  C: {
    title: "Data Access & Disease Information",
    id: "A",
    component: C,
  },
  D: {
    title: "Submission Data Types",
    id: "A",
    component: D,
  },
  REVIEW: {
    title: "Review & Submit",
    id: "review",
    component: null,
  },
};

export default sections;
