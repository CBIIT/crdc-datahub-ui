type Submission = {
  _id: string; // aka. submissionID
  name: string;
  submitterID: string;
  submitterName: string; // <first name> <last name>
  organization: Organization; // Organization
  dataCommons: string;
  modelVersion: string; // for future use
  studyAbbreviation: string;
  dbGaPID: string; // # aka. phs number
  bucketName: string; // # populated from organization
  rootPath: string; // # a submission folder will be created under this path, default is / or "" meaning root folder
  status: DataSubmissionStatus; // [New, In Progress, Submitted, Released, Canceled, Transferred, Completed, Archived]
  history: DataSubmissionHistoryEvent[]
  conciergeName: string; // # Concierge name
  conciergeEmail: string; // # Concierge email (MIGHT CHANGE)
  createdAt: string; // # ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
  updatedAt: string; // # ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
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

type Batch = {
  _id: string;
  submissionID: string; // parent
  type: string; // [metadata, file]
  metadataIntention: string; // [New, Update, Delete], Update is meant for "Update or insert", metadata only! file batches are always treated as Update
  fileCount: number; // calculated by BE
  files: FileInfo[];
  status: string; // [New, Uploaded, Upload Failed, Loaded, Rejected] Loaded and Rejected are for metadata batch only
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
  metadataIntention: string; // [New, Update, Delete], Update is meant for "Update or insert", metadata only! file batches are always treated as Update
  fileCount: number; // calculated by BE
  files: FileURL[];
  status: string; // [New, Uploaded, Upload Failed, Loaded, Rejected] Loaded and Rejected are for metadata batch only
  errors: string[];
  createdAt: string; // ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
  updatedAt: string; // ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
};

type BatchFile = {
  _id: string;
  uploadType: string;
  fileCount: number;
  status: string;
  submittedDate: string;
  errorCount: number;
};

type DataSubmissionHistoryEvent = HistoryBase<SubmissionStatus>;
