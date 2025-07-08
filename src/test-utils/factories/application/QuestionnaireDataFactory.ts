import { Factory } from "../Factory";

import { clinicalDataFactory } from "./ClinicalDataFactory";
import { contactFactory } from "./ContactFactory";
import { piFactory } from "./PIFactory";
import { studyFactory } from "./StudyFactory";

/**
 * Base questionnaire object
 */
export const baseQuestionnaireData: QuestionnaireData = {
  sections: [],
  pi: piFactory.build(),
  piAsPrimaryContact: false,
  primaryContact: contactFactory.build(),
  additionalContacts: [],
  program: undefined,
  study: studyFactory.build(),
  accessTypes: [],
  targetedSubmissionDate: "",
  targetedReleaseDate: "",
  timeConstraints: [],
  cancerTypes: [],
  otherCancerTypes: "",
  otherCancerTypesEnabled: false,
  preCancerTypes: "",
  numberOfParticipants: 0,
  species: [],
  otherSpeciesEnabled: false,
  otherSpeciesOfSubjects: "",
  cellLines: false,
  modelSystems: false,
  imagingDataDeIdentified: false,
  dataDeIdentified: false,
  dataTypes: [],
  otherDataTypes: "",
  clinicalData: clinicalDataFactory.build(),
  files: [],
  submitterComment: "",
};

/**
 * Questionnaire factory for creating questionnaire instances
 */
export const questionnaireDataFactory = new Factory<QuestionnaireData>((overrides) => ({
  ...baseQuestionnaireData,
  ...overrides,
}));
