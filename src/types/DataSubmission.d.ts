type DataSubmission = {
  _id
  name
  submitterID
  submitterName
  organization
  dataCommons: string;
  modelVersion: string; // # for future use
  studyAbbreviation: string;
  dbGapID: string; // # aka. phs number
  bucketName: string; // # populated from organization
  rootPath: string; // # a submission folder will be created under this path, default is / or "" meaning root folder
  status: DataSubmissionStatus; // [New, In Progress, Submitted, Released, Canceled, Transferred, Completed, Archived]
  history: DataSubmissionHistoryEvent[]
  concierge: string; // # Concierge name
  conciergeEmail: string; // # Concierge email (MIGHT CHANGE)
  createdAt: string; // # ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
  updatedAt: string; // # ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
};

type DataSubmissionStatus = "New" | "In Progress" | "Submitted" | "Released" | "Completed" | "Archived";

type BatchFile = {
  _id: string;
  uploadType: string;
  fileCount: number;
  status: string;
  submittedDate: string;
  errorCount: number;
};

type DataSubmissionHistoryEvent = HistoryBase<DataSubmissionStatus>;
