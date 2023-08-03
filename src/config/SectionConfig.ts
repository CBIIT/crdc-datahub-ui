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
    id: "A",
    component: A,
  },
  B: {
    title: "Program & Study Registration",
    id: "B",
    component: B,
  },
  C: {
    title: "Data Access and Disease",
    id: "C",
    component: C,
  },
  D: {
    title: "Data Types",
    id: "D",
    component: D,
  },
  REVIEW: {
    title: "Review & Submit",
    id: "review",
    component: Review,
  },
};

export const InitialSections: Section[] = Object.keys(sections)?.slice(0, -1)?.map((sectionKey) => ({ name: sections[sectionKey].id, status: "Not Started" }));

export default sections;
