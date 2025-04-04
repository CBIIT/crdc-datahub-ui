import { omit } from "lodash";

/**
 * Generates a base Submission object for testing
 *
 * @param omitProps Optional properties to omit from the generated object
 * @returns A base Submission object with the specified properties omitted
 */
export const generateBaseSubmission = (
  omitProps: (keyof Submission)[] = []
): Omit<Submission, keyof typeof omitProps> => {
  const submission: Submission = {
    _id: "",
    name: "",
    submitterID: "",
    submitterName: "",
    organization: {
      _id: "",
      name: "",
    },
    dataCommons: "",
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
    validationStarted: "",
    validationEnded: "",
    validationScope: "New",
    validationType: [],
    fileErrors: [],
    history: [],
    conciergeName: "",
    conciergeEmail: "",
    intention: "New/Update",
    dataType: "Metadata Only",
    otherSubmissions: "",
    createdAt: "",
    updatedAt: "",
    deletingData: false,
    archived: false,
    nodeCount: 0,
    collaborators: [],
    dataFileSize: {
      formatted: "",
      size: 0,
    },
  };

  return omit(submission, omitProps) as Omit<Submission, keyof typeof omitProps>;
};
