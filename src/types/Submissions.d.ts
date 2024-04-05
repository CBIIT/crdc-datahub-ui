type Submission = {
  _id: string; // aka. submissionID
  name: string;
  submitterID: string;
  submitterName: string; // <first name> <last name>
  organization: Pick<Organization, "_id" | "name">; // Organization
  dataCommons: string;
  modelVersion: string; // for future use
  studyAbbreviation: string;
  dbGaPID: string; // # aka. phs number
  bucketName: string; // # populated from organization
  rootPath: string; // # a submission folder will be created under this path, default is / or "" meaning root folder
  status: SubmissionStatus; // [New, In Progress, Submitted, Released, Canceled, Transferred, Completed, Archived]
  metadataValidationStatus: ValidationStatus; // [New, Validating, Passed, Error, Warning]
  fileValidationStatus: ValidationStatus; // [New, Validating, Passed, Error, Warning]
  fileErrors: QCResult[]; // holds submission level file errors, e.g., extra files in S3 folder
  history: SubmissionHistoryEvent[];
  conciergeName: string; // Concierge name
  conciergeEmail: string; // Concierge email
  intention: SubmissionIntention; // [Update, New, Delete]
  createdAt: string; // ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
  updatedAt: string; // ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
};

/**
 * The status of a Metadata or Files in a submission.
 *
 * @note `null` indicates that the type has not been uploaded yet.
 * @note `New` indicates that the type has been uploaded but not validated yet.
 */
type ValidationStatus = null | "New" | "Validating" | "Passed" | "Error" | "Warning";

type SubmissionStatus =
  | "New"
  | "In Progress"
  | "Submitted"
  | "Released"
  | "Withdrawn"
  | "Rejected"
  | "Completed"
  | "Archived"
  | "Canceled";

type SubmissionAction =
  | "Submit"
  | "Release"
  | "Withdraw"
  | "Reject"
  | "Resume" // Rejected => In Progress
  | "Complete"
  | "Cancel"
  | "Archive";

type SubmissionIntention = "New" | "Update" | "Delete";

type FileInput = {
  fileName: string;
  size: number;
};

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
  size: number;
  nodeType: string;
  status: string; // [New, Uploaded, Failed]
  errors: string[];
  createdAt: string; // ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
  updatedAt: string; // ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
};

type BatchStatus = "Uploading" | "Uploaded" | "Failed";

type MetadataIntention = "New" | "Update" | "Delete";

type UploadType = "metadata" | "data file";

type Batch = {
  _id: string;
  displayID: number;
  submissionID: string; // parent
  type: UploadType;
  metadataIntention: MetadataIntention; // [New, Update, Delete], Update is meant for "Update or insert", metadata only! file batches are always treated as Update
  fileCount: number; // calculated by BE
  files: BatchFileInfo[];
  status: BatchStatus;
  errors: string[];
  createdAt: string; // ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
  updatedAt: string; // ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
};

type NewBatch = {
  _id: string;
  submissionID: string; // parent
  bucketName?: string; // S3 bucket of the submission, for file batch / CLI use
  filePrefix?: string; // prefix/path within S3 bucket, for file batch / CLI use
  type: UploadType;
  metadataIntention: MetadataIntention; // [New, Update, Delete], Update is meant for "Update or insert", metadata only! file batches are always treated as Update
  fileCount: number; // calculated by BE
  files: FileURL[];
  status: BatchStatus; // [New, Uploaded, Upload Failed, Loaded, Rejected] Loaded and Rejected are for metadata batch only
  errors: string[];
  createdAt: string; // ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
  updatedAt: string; // ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
};

type ListBatches = {
  total: number;
  batches: Batch[];
};

type TempCredentials = {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
};

type SubmissionHistoryEvent = HistoryBase<SubmissionStatus>;

type ListLogFiles = {
  logFiles: LogFile[];
};

type LogFile = {
  fileName: string;
  uploadType: UploadType;
  downloadUrl: string; // s3 presigned download url of the file
  fileSize: number; // size in byte
};

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

type QCResults = {
  total: number;
  results: QCResult[];
};

type QCResult = {
  submissionID: string;
  type: string;
  validationType: UploadType;
  batchID: string;
  displayID: number;
  submittedID: string;
  severity: "Error" | "Warning"; // [Error, Warning]
  uploadedDate: string; // batch.updatedAt
  validatedDate: string;
  errors: ErrorMessage[];
  warnings: ErrorMessage[];
};

type ErrorMessage = {
  title: string;
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

type DataValidationResult = {
  /**
   * Whether the validation action was successfully queued.
   */
  success: boolean;
  /**
   * The message returned by the validation.
   */
  message: string;
};

type AsyncProcessResult = {
  success: boolean;
  message: string;
};

/**
 * The type of Data Validation to perform.
 */
type ValidationType = "Metadata" | "Files" | "All";

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
  status: string;
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
