import { Factory } from "../Factory";

import { applicantFactory } from "./ApplicantFactory";
import { questionnaireDataFactory } from "./QuestionnaireDataFactory";

/**
 * Base application object
 */
export const baseApplication: Application = {
  _id: "",
  status: "New",
  createdAt: "",
  updatedAt: "",
  submittedDate: "",
  history: [],
  ORCID: "",
  applicant: applicantFactory.build(),
  PI: "",
  controlledAccess: false,
  openAccess: false,
  studyAbbreviation: "",
  questionnaireData: questionnaireDataFactory.build(),
  conditional: false,
  pendingConditions: [],
  programName: "",
  programAbbreviation: "",
  programDescription: "",
  version: "",
};

/**
 * Application factory for creating application instances
 */
export const applicationFactory = new Factory<Application>((overrides) => ({
  ...baseApplication,
  ...overrides,
}));
