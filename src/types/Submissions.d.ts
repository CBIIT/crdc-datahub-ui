type Submission = {
  _id
  name
  submitterID
  submitterName
  organization
  dataCommons: string;
  modelVersion: string; // # for future use
  studyAbbreviation: string;
  dbGaPID: string; // # aka. phs number
  bucketName: string; // # populated from organization
  rootPath: string; // # a submission folder will be created under this path, default is / or "" meaning root folder
  status: DataSubmissionStatus; // [New, In Progress, Submitted, Released, Canceled, Transferred, Completed, Archived]
  history: DataSubmissionHistoryEvent[]
  concierge: string; // # Concierge name
  conciergeEmail: string; // # Concierge email (MIGHT CHANGE)
  createdAt: string; // # ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
  updatedAt: string; // # ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
};

type SubmissionHistoryEvent = {
  status: SubmissionStatus; // # [New, In Progress, Submitted, In Review, Approved, Rejected]
  reviewComment: string; // # if applicable
  dateTime: string; // # YYYY-MM-DDTHH:MM:SS format
  userID: string;
};

type SubmissionStatus = "New" | "In Progress" | "Submitted" | "Released" | "Withdrawn" | "Rejected" | "Completed" | "Archived" | "Canceled";

type HistoryEvent = {
  status: ApplicationStatus;
  reviewComment?: string;
  dateTime: string; // YYYY-MM-DDTHH:MM:SSZ format
  userID: number;
};

type Applicant = {
  applicantID: string;
  applicantName: string;
  applicantEmail: string;
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
