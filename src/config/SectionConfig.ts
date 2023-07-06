import A from "../content/questionnaire/sections/A";
import B from '../content/questionnaire/sections/B';
import C from "../content/questionnaire/sections/C";
import D from '../content/questionnaire/sections/D';
import Review from '../content/questionnaire/sections/Review';

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
    urlPath: "A"
  },
  B: {
    title: "Program & Study Registration",
    component: B,
    urlPath: "B"
  },
  C: {
    title: "Data Access and Disease Information",
    component: C,
    urlPath: "C"
  },
  D: {
    title: "Submission Data Types",
    component: D,
    urlPath: "D"
  },
  REVIEW: {
    title: "Review & Submit",
    component: Review,
    urlPath: "review"
  },
};

export default sections;
