import { Factory } from "../Factory";

/**
 * Base questionnaire object
 */
export const baseQuestionnaireData: QuestionnaireData = {
  sections: [],
  pi: {
    firstName: "",
    lastName: "",
    position: "",
    email: "",
    ORCID: "",
    institution: "",
    address: "",
  },
  piAsPrimaryContact: false,
  primaryContact: {
    position: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    institution: "",
  },
  additionalContacts: [],
  program: undefined,
  study: {
    name: "",
    abbreviation: "",
    description: "",
    publications: [],
    plannedPublications: [],
    repositories: [],
    funding: [],
    isDbGapRegistered: false,
    dbGaPPPHSNumber: "",
  },
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
  clinicalData: {
    dataTypes: [],
    otherDataTypes: "",
    futureDataTypes: false,
  },
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
