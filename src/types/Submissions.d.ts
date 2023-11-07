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
  history: SubmissionHistoryEvent[];
  conciergeName: string; // Concierge name
  conciergeEmail: string; // Concierge email
  createdAt: string; // ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
  updatedAt: string; // ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
};

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

type FileInfo = {
  filePrefix: string; // prefix/path within S3 bucket
  fileName: string;
  size: number;
  status: string; // [New, Uploaded, Failed]
  errors: [string];
  createdAt: string; // ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
  updatedAt: string; // ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
};

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
};

type BatchFileInfo = {
  filePrefix: string; // prefix/path within S3 bucket
  fileName: string;
  size: number;
  status: string; // [New, Uploaded, Failed]
  errors: string[];
  createdAt: string; // ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
  updatedAt: string // ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
};

type BatchStatus = "New" | "Uploaded" | "Upload Failed" | "Loaded" | "Rejected";

type MetadataIntention = "New" | "Update" | "Delete";

type UploadType = "metadata" | "file";

type Batch = {
  _id: string;
  submissionID: string; // parent
  type: UploadType; // [metadata, file]
  metadataIntention: MetadataIntention; // [New, Update, Delete], Update is meant for "Update or insert", metadata only! file batches are always treated as Update
  fileCount: number; // calculated by BE
  files: BatchFileInfo[];
  status: BatchStatus; // [New, Uploaded, Upload Failed, Loaded, Rejected] Loaded and Rejected are for metadata batch only
  errors: string[];
  createdAt: string; // ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
  updatedAt: string; // ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
};

type NewBatch = {
  _id: string;
  submissionID: string; // parent
  bucketName?: string; // S3 bucket of the submission, for file batch / CLI use
  filePrefix?: string; // prefix/path within S3 bucket, for file batch / CLI use
  type: string; // [metadata, file]
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
  logFiles: LogFile[]
};

type LogFile = {
  fileName: string;
  uploadType: UploadType; // [metadata, file]
  downloadUrl: string; // s3 presigned download url of the file
  fileSize: number // size in byte
};
