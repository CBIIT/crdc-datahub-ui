/**
 * Initial values for the application/questionnaire
 *
 * @type {Application}
 */
export const InitialApplication: Application = {
  sections: [],
  pi: {
    firstName: "",
    lastName: "",
    position: "",
    email: "",
    institution: "",
    address: "",
  },
  piAsPrimaryContact: false,
  primaryContact: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    institution: ""
  },
  additionalContacts: [],
  program: {
    name: "",
    abbreviation: "",
    description: "",
  },
  study: {
    name: "",
    abbreviation: "",
    description: "",
    publications: [],
    plannedPublications: [],
    repositories: [],
    funding: {
      agency: "",
      grantNumbers: "",
      nciProgramOfficer: "",
      nciGPA: "",
    },
    isDbGapRegistered: false,
    dbGaPPPHSNumber: "",
  },
  accessTypes: [],
  targetedSubmissionDate: "",
  targetedReleaseDate: "",
  timeConstraints: [],
  cancerTypes: [],
  otherCancerTypes: "",
  preCancerTypes: [],
  otherPreCancerTypes: "",
  numberOfParticipants: 0,
  species: [],
  cellLines: false,
  modelSystems: false,
  imagingDataDeIdentified: null,
  dataDeIdentified: null,
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
 * Initial values for the application response
 *
 * @type {Omit<ApplicationResponse, "questionnaire">}
 */
export const InitialResponse: Omit<ApplicationResponse, "questionnaire"> = {
  _id: "new",
  status: 'New',
  programLevelApproval: false,
  reviewComment: '',
  createdAt: '',
  updatedAt: '',
  submittedDate: '',
  history: [],
  applicantID: '',
  applicantName: '',
  applicantEmail: '',
  organization: '',
  program: "",
  study: "",
};
