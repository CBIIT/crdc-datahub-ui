type Submission = {
  _id: string; // aka. submissionID
  name: string;
  submitterID: string;
  submitterName: string; // <first name> <last name>
  organization: Pick<Organization, "_id" | "name">; // Organization
  dataCommons: string;
  modelVersion: string;
  studyID: string;
  studyAbbreviation: string;
  dbGaPID: string; // # aka. phs number
  bucketName: string; // # populated from organization
  rootPath: string; // # a submission folder will be created under this path, default is / or "" meaning root folder
  status: SubmissionStatus;
  metadataValidationStatus: ValidationStatus;
  fileValidationStatus: ValidationStatus;
  crossSubmissionStatus: CrossSubmissionStatus;
  deletingData: boolean;
  /**
   * Indicates whether the submission has been archived.
   */
  archived: boolean;
  /**
   * The date and time when the validation process started.
   *
   * @note ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
   */
  validationStarted: string;
  /**
   * The date and time when the validation process ended.
   *
   * @note ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
   */
  validationEnded: string;
  /**
   * The last performed validation action scope.
   *
   * @see {@link ValidationTarget} for more information.
   */
  validationScope: ValidationTarget;
  /**
   * The last performed validation action type.
   *
   * @see {@link ValidationType} for more information.
   */
  validationType: ValidationType[];
  /**
   * Holds submission level file errors, e.g., extra files in S3 folder
   */
  fileErrors: QCResult[];
  history: SubmissionHistoryEvent[];
  conciergeName: string; // Concierge name
  conciergeEmail: string; // Concierge email
  intention: SubmissionIntention;
  dataType: SubmissionDataType;
  /**
   * A JSON string containing information for related submissions. Mapped by SubmissionStatus, related by studyAbbreviation.
   *
   * @see OtherSubmissions
   */
  otherSubmissions: string;
  /**
   * The total number of nodes in the Submission
   */
  nodeCount: number;
  /**
   * A list of additional submitters who can view and edit the submission
   */
  collaborators: Collaborator[];
  createdAt: string; // ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
  updatedAt: string; // ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
};

/**
 * The status of the validation action for a Submission.
 *
 * @note `null` indicates that the type has not been uploaded yet.
 * @note `New` indicates that the type has been uploaded but not validated yet.
 */
type ValidationStatus = null | "New" | "Validating" | "Passed" | "Error" | "Warning";

/**
 * The status of the cross-submission validation action for a Submission.
 *
 * @note Value of `null` or `Warning` does not represent a valid state and can be ignored.
 */
type CrossSubmissionStatus = Exclude<ValidationStatus, "Warning">;

/**
 * A parsed version of the `otherSubmissions` field in a Submission object.  *
 *
 * @example ```{ "Submitted": ["abc-0001", "xyz-0002"], "In Progress": ["bge-0003"] }```
 */
type OtherSubmissions = {
  [key in Extends<
    SubmissionStatus,
    "In Progress" | "Submitted" | "Released" | "Rejected" | "Withdrawn"
  >]: string[];
};

type SubmissionStatus =
  | "New"
  | "In Progress"
  | "Submitted"
  | "Released"
  | "Withdrawn"
  | "Rejected"
  | "Completed"
  | "Canceled"
  | "Deleted";

type SubmissionAction =
  | "Submit"
  | "Release"
  | "Withdraw"
  | "Reject"
  | "Resume" // Rejected => In Progress
  | "Complete"
  | "Cancel";

type SubmissionIntention = "New/Update" | "Delete";

type SubmissionDataType = "Metadata Only" | "Metadata and Data Files";

type FileURL = {
  fileName: string;
  signedURL: string;
};

type UploadResult = {
  fileName: string;
  succeeded: boolean;
  errors: string[];
  /**
   * Applies to Data File uploads only. Indicates whether the file was skipped
   * intentionally during the upload process.
   */
  skipped?: boolean;
};

type BatchFileInfo = {
  filePrefix: string; // prefix/path within S3 bucket
  fileName: string;
  nodeType: string;
  status: "New" | "Uploaded" | "Failed";
  errors: string[];
  createdAt: string; // ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
  updatedAt: string; // ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
};

type BatchStatus = "Uploading" | "Uploaded" | "Failed";

type UploadType = "metadata" | "data file";

type Batch = {
  _id: string;
  displayID: number;
  submissionID: string;
  type: UploadType;
  fileCount: number;
  files: BatchFileInfo[];
  status: BatchStatus;
  errors: string[];
  /**
   * The ID of the user who created the batch
   */
  submitterID?: string;
  /**
   * The name of the user who created the batch
   */
  submitterName?: string;
  createdAt: string; // ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
  updatedAt: string; // ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
};

type NewBatch = Pick<
  Batch,
  "_id" | "submissionID" | "type" | "fileCount" | "status" | "errors" | "createdAt" | "updatedAt"
> & {
  bucketName?: string;
  filePrefix?: string;
  files: FileURL[];
};

type ListBatches = {
  total: number;
  batches: Batch[];
};

type SubmissionHistoryEvent = HistoryBase<SubmissionStatus>;

type S3FileInfo = {
  fileName: string;
  size: number;
  md5: string;
  status: "New" | "Passed" | "Error"; // # [New, Passed, Error]
  errors: ErrorMessage[];
  warnings: ErrorMessage[];
  createdAt: string;
  updatedAt: string;
};

type RecordParentNode = {
  parentType: string; // node type of the parent node, e.g. "study"
  parentIDPropName: string; // ID property name can be used to identify parent node, e.g., "study_id"
  parentIDValue: string; // Value for above ID property, e.g. "CDS-study-007"
};

type AggregatedQCResult = {
  code: string;
  severity: "Error" | "Warning";
  title: string;
  count: number;
};

/**
 * Represents a validation result returned by a validation API endpoint.
 *
 * e.g. Quality Control, Cross Submission, etc.
 */
type ValidationResult<ResultType> = {
  /**
   * The total number of results available of this type.
   */
  total: number;
  /**
   * A generic collection of validation results.
   */
  results: ResultType[];
};

type QCResult = {
  submissionID: string;
  type: string;
  validationType: UploadType;
  batchID: string;
  displayID: number;
  submittedID: string;
  severity: "Error" | "Warning";
  uploadedDate: string; // batch.updatedAt
  validatedDate: string;
  errors: ErrorMessage[];
  warnings: ErrorMessage[];
};

/**
 * Represents a Cross Submission validation result.
 *
 * @note This currently is a near-carbon copy of `QCResult`.
 */
type CrossValidationResult = QCResult & {
  /**
   * The ID of the submission that has conflicting data.
   */
  conflictingSubmission: string;
};

type ErrorMessage = {
  /**
   * The code corresponding to the specific error/warning.
   *
   * Refer to the imported type for more information.
   */
  code: import("../config/ValidationErrors").ValidationErrorCode;
  /**
   * The title of the error.
   */
  title: string;
  /**
   * A detailed description of the error.
   */
  description: string;
};

type DataRecord = {
  _id: string;
  submissionID: string;
  batchIDs: string[]; // all batch IDs, each time this record is reloaded in a new batch, append batchID here
  status: "New" | "Passed" | "Error" | "Warning"; // [New, Passed, Error, Warning], Loaded is the initial state each time it's loaded
  errors: ErrorMessage[];
  warnings: ErrorMessage[];
  createdAt: string;
  updatedAt: string;
  orginalFileName: string; // holds original file name the data is read from
  lineNumber: number; // line number in the original file
  nodeType: string; // type of the node, in "type" column of the file
  nodeID: string; // ID of the node, for example: "cds-case-99907"
  // props: Properties; // properties of the node
  parents: RecordParentNode[];
  // relationshipProps: [RelationshipProperty] # for future use
  // rawData: RawData
  s3FileInfo: S3FileInfo; // only for "file" types, should be null for other nodes
};

type SubmissionStatistic = {
  nodeName: string;
  total: number;
  new: number;
  passed: number;
  warning: number;
  error: number;
};

type AsyncProcessResult = {
  /**
   * Whether the validation action was successfully queued.
   */
  success: boolean;
  /**
   * The message returned by the process.
   */
  message: string;
};

/**
 * The type of Data Validation to perform.
 */
type ValidationType = "metadata" | "file" | "cross-submission";

/**
 * The target of Data Validation action.
 */
type ValidationTarget = "New" | "All";

/**
 * Represents a node returned from the getSubmissionNodes API
 *
 * @note Not the same thing as `SubmissionStatistic`
 */
type SubmissionNode = {
  submissionID: string;
  nodeType: string;
  nodeID: string;
  status: ValidationStatus;
  createdAt: string;
  updatedAt: string;
  validatedAt: string;
  lineNumber: number;
  /**
   * The node properties as a JSON string.
   *
   * @see JSON.parse
   */
  props: string;
};

type RelatedNodes = {
  /**
   * Total number of nodes in the submission.
   */
  total: number;
  /**
   * An array of nodes matching the queried node type
   *
   * @note Unused values are omitted from the query. See the type definition for additional fields.
   */
  nodes: Pick<SubmissionNode, "nodeType" | "nodeID" | "props" | "status">[];
  /**
   * The list of all node properties including parents
   */
  properties: string[];
  /**
   * The ID/Key property of current node.
   * ex. "study_participant_id" for participant node
   */
  IDPropName: string;
};

type RelatedNode = {
  nodeType: string;
  total: number;
};

type NodeDetailResult = {
  submissionID: string;
  nodeType: string;
  nodeID: string;
  IDPropName: string;
  parents: RelatedNode[]; // array of Related node contains nodeType and counts
  children: RelatedNode[]; // array of Related node contains nodeType and counts
};

type NodeRelationship = "parent" | "child";

type SubmitButtonResult = {
  enabled: boolean;
  isAdminOverride?: boolean;
  tooltip?: string;
  _identifier?: string;
};

/**
 * Represents the permissions a collaborator can have in a submission
 */
type CollaboratorPermissions = "Can Edit";

/**
 * Represents a submitter that can view and edit another submitter's submission
 */
type Collaborator = {
  collaboratorID: string;
  collaboratorName: string;
  permission: CollaboratorPermissions;
};

/**
 * Modifiable collaborator fields
 */
type CollaboratorInput = Pick<Collaborator, "collaboratorID" | "permission">;
