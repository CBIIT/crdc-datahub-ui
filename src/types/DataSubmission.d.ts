type DataSubmission = {
    // Application Details
    id: string;
    submitterName: string;
    dataCommons: string;
    organization: string;
    study: string;
    dbGapID: string;
    status: DataSubmissionStatus;
    dataHubConcierge: string;
    updatedAt: string; // YYYY-MM-DDTHH:MM:SSZ format
  };

  type DataSubmissionStatus = "Initialized" | "In Progress" | "Submitted" | "Released" | "Completed" | "Archived";

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
