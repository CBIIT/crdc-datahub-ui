type Application = {
  _id: number;
  sections: Section[];
  pi: PI;
  piAsPrimaryContact: boolean;
  primaryContact: Contact; // null if piAsPrimaryContact is true
  additionalContacts: Contact[];
  program: Program;
  study: Study;
  accessTypes: string[];
  targetedSubmissionDate: string; // YYYY-MM-DD format
  targetedReleaseDate: string; // YYYY-MM-DD format
  timeConstraints: TimeConstraint[];
  cancerTypes: string[];
  otherCancerTypes: string;
  preCancerTypes: string[];
  otherPreCancerTypes: string;
  numberOfParticipants: number;
  species: string[];
  cellLines: boolean;
  modelSystems: boolean;
  dataTypes: string[];
  otherDataTypes: string;
  clinicalData: ClinicalData;
  files: FileInfo[];
  submitterComment: string;
  status: ApplicationStatus;
  programLevelApproval: boolean;
  reviewComment: string;
  createdAt: string; // YYYY-MM-DDTHH:MM:SS format
  updatedAt: string; // YYYY-MM-DDTHH:MM:SS format
  history: HistoryEvent[];
  applicantID: string;
};

type ApplicationStatus = "New" | "In Progress" | "Submitted" | "In Review" | "Approved" | "Rejected";

type Section = {
  name: string;
  status: SectionStatus;
};

type SectionStatus = "In Progress" | "Completed" | "Not Started";

type TimeConstraint = {
  description: string;
  effectiveDate: string;
};

type ClinicalData = {
  dataTypes: string[]; // FE control allowed values
  otherDataTypes: string;
  futureDataTypes: boolean;
};

type PI = {
  firstName: string;
  lastName: string;
  position: string;
  email: string;
  institution: string;
  eRAAccount: string;
  address: string;
};

type Contact = {
  position: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  institution?: string;
};

type Program = {
  name: string;
  abbreviation: string;
  description: string;
};

type Study = {
  name: string;
  abbreviation: string;
  description: string;
  publications: Publication[];
  plannedPublications: PlannedPublication[];
  repositories: Repository[];
  funding: Funding;
};

type Repository = {
  name: string;
  studyID: string;
  submittedDate: string;
};

type Publication = {
  title: string;
  pubmedID: string;
  DOI: string;
};

type PlannedPublication = {
  title: string;
  expectedDate: string;
};

type FileInfo = {
  type: string; // FE control allowed values
  count: number;
  amount: string; // xxxMB, GB etc
};

type Funding = {
  agency: string;
  grantNumber: string;
  nciProgramOfficer: string;
  nciGPA: string;
};

// Renamed to HistoryEvent to avoid confusion with a DOM Event
type HistoryEvent = {
  status: ApplicationStatus;
  reviewComment?: string;
  dateTime: string; // YYYY-MM-DDTHH:MM:SS format
  userID: number;
};

type TimeConstraint = {
  description: string;
  effectiveDate: string;
};
