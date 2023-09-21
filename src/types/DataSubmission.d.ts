type DataSubmission = {
    _id: string; // aka. submissionID
    name: string;
    submitterID: string;
    submitterName: string; // <first name> <last name>
    organization: string;
    dataCommons: string;
    modelVersion: string; // # for future use
    studyAbbreviation: string;
    dbGapID: string; // # aka. phs number
    bucketName: string; // # populated from organization
    rootPath: string; // # a submission folder will be created under this path, default is / or "" meaning root folder
    status: DataSubmissionStatus; // [New, In Progress, Submitted, Released, Canceled, Transferred, Completed, Archived]
    history: [DataSubmissionHistoryEvent]
    concierge: string; // # Concierge name
    createdAt: string; // # ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
    updatedAt: string; // # ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
};

type DataSubmissionHistoryEvent = {
  status: DataSubmissionStatus; // # [New, In Progress, Submitted, In Review, Approved, Rejected]
  reviewComment: string; // # if applicable
  dateTime: string; // # YYYY-MM-DDTHH:MM:SS format
  userID: string;
};

type DataSubmissionStatus = "New" | "In Progress" | "Submitted" | "Released" | "Canceled" | "Transferred" | "Completed" | "Archived";

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

type Organization = {
  _id: string;
  name: string;
};
