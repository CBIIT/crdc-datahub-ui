export const baseSubmission: Submission = {
  _id: "",
  name: "",
  submitterID: "",
  submitterName: "",
  organization: null,
  dataCommons: "",
  // dataCommonsDisplayNames: [],
  modelVersion: "",
  studyID: "",
  studyAbbreviation: "",
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
 *  Creates a new Submission object with default values, allowing for field overrides
 *
 * @see {@link baseSubmission}
 * @param {Partial<Submission>} [overrides={}] - An object containing properties to override the default values
 * @returns {Submission} A new Submission object with default propety values applied as well as any overridden properties
 */
export const createSubmission = (overrides: Partial<Submission> = {}): Submission => ({
  ...baseSubmission,
  ...overrides,
});
