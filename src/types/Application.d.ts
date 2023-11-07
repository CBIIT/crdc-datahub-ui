type Application = {
  // Application Details
  _id: string;
  status: ApplicationStatus;
  createdAt: string; // YYYY-MM-DDTHH:MM:SSZ format
  updatedAt: string; // YYYY-MM-DDTHH:MM:SSZ format
  submittedDate: string; // YYYY-MM-DDTHH:MM:SSZ format
  history: HistoryEvent[];
  // Applicant Details
  applicant: Applicant;
  organization: Pick<Organization, "_id" | "name">;
  // Sort Fields
  programName: Program["name"];
  studyAbbreviation: Study["abbreviation"];
  // FE Questionnaire Data
  questionnaireData: QuestionnaireData;
};

type ApplicationInput = {
  _id: string;
  programName: Program["name"];
  studyAbbreviation: Study["abbreviation"];
  questionnaireData: string; // Cast to QuestionnaireData
};

type QuestionnaireData = {
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
  imagingDataDeIdentified: boolean;
  dataDeIdentified: boolean;
  dataTypes: string[];
  otherDataTypes: string;
  clinicalData: ClinicalData;
  files: FileInfo[];
  submitterComment: string;
};

type ApplicationStatus = "New" | "In Progress" | "Submitted" | "In Review" | "Approved" | "Rejected" | "Inquired";

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
  abbreviation?: string;
  description?: string;
  notApplicable?: boolean;
  isCustom?: boolean;
};

type Study = {
  name: string;
  abbreviation: string;
  description: string;
  publications: Publication[];
  plannedPublications: PlannedPublication[];
  repositories: Repository[];
  funding: Funding[];
  isDbGapRegistered: boolean;
  dbGaPPPHSNumber: string;
};

type Repository = {
  name: string;
  studyID: string;
  dataTypesSubmitted: string[];
  otherDataTypesSubmitted: string;
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
  extension: string;
  count: number;
  amount: string; // xxxMB, GB etc
};

type Funding = {
  agency: string;
  grantNumbers: string;
  nciProgramOfficer: string;
  nciGPA: string;
};

type HistoryEvent = HistoryBase<ApplicationStatus>;

type Applicant = {
  applicantID: string;
  applicantName: string;
  applicantEmail: string;
};
