import { Factory } from "../Factory";

/**
 * Base submission object
 */
export const baseSubmission: Submission = {
  _id: "",
  name: "",
  submitterID: "",
  submitterName: "",
  organization: undefined,
  dataCommons: "",
  dataCommonsDisplayName: "",
  modelVersion: "",
  studyID: "",
  studyAbbreviation: "",
  studyName: "",
  dbGaPID: "",
  bucketName: "",
  rootPath: "",
  status: "New",
  metadataValidationStatus: "New",
  fileValidationStatus: "New",
  crossSubmissionStatus: "New",
  deletingData: false,
  archived: false,
  validationStarted: "",
  validationEnded: "",
  validationScope: "New",
  validationType: [],
  fileErrors: [],
  history: [],
  conciergeName: "",
  conciergeEmail: "",
  intention: "New/Update",
  dataType: "Metadata and Data Files",
  otherSubmissions: "",
  nodeCount: 0,
  collaborators: [],
  dataFileSize: {
    formatted: "",
    size: 0,
  },
  createdAt: "",
  updatedAt: "",
};

/**
 * Submission factory for creating submission instances
 */
export const submissionFactory = new Factory<Submission>((overrides) => ({
  ...baseSubmission,
  ...overrides,
}));
