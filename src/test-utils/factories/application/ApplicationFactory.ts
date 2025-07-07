import { Factory } from "../Factory";

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
  applicant: {
    applicantID: "",
    applicantName: "",
    applicantEmail: "",
  },
  PI: "",
  controlledAccess: false,
  openAccess: false,
  studyAbbreviation: "",
  questionnaireData: {
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
  },
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
