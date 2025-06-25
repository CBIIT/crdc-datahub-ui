type Application = {
  // Application Details
  _id: string;
  status: ApplicationStatus;
  createdAt: string; // YYYY-MM-DDTHH:MM:SSZ format
  updatedAt: string; // YYYY-MM-DDTHH:MM:SSZ format
  submittedDate: string; // YYYY-MM-DDTHH:MM:SSZ format
  history: HistoryEvent[];
  ORCID: string;
  // Applicant Details
  applicant: Applicant;
  PI: string; // Principal Investigator's full name "<first name> <last name>"
  controlledAccess: boolean;
  openAccess: boolean;
  // Sort Fields
  studyAbbreviation: Study["abbreviation"];
  // FE Questionnaire Data
  questionnaireData: QuestionnaireData;
  /**
   * A indicator to show if the application is conditionally approved.
   */
  conditional: boolean;
  /**
   * A list of conditions that need to be met before the application can be approved.
   */
  pendingConditions: string[];
  /**
   * The name for the application program
   */
  programName: string;
  /**
   * The abbreviation for the application program
   */
  programAbbreviation: string;
  /**
   * The description for the application program
   */
  programDescription: string;
  /**
   * The current form version
   */
  version: string;
  /**
   * Indicates the application is awaiting required data model updates.
   */
  pendingModelChange: boolean;
};

type QuestionnaireData = {
  sections: Section[];
  pi: PI;
  piAsPrimaryContact: boolean;
  primaryContact: Contact; // null if piAsPrimaryContact is true
  additionalContacts: Contact[];
  program: ProgramInput;
  study: Study;
  accessTypes: string[];
  targetedSubmissionDate: string; // YYYY-MM-DD format
  targetedReleaseDate: string; // YYYY-MM-DD format
  timeConstraints: TimeConstraint[];
  cancerTypes: string[];
  otherCancerTypes: string;
  otherCancerTypesEnabled: boolean;
  preCancerTypes: string;
  numberOfParticipants: number;
  species: string[];
  otherSpeciesEnabled: boolean;
  otherSpeciesOfSubjects: string;
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

type ApplicationStatus =
  | "New"
  | "In Progress"
  | "Submitted"
  | "In Review"
  | "Approved"
  | "Rejected"
  | "Inquired"
  | "Canceled"
  | "Deleted";

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
  dataTypes: string[];
  otherDataTypes: string;
  futureDataTypes: boolean;
};

type PI = {
  firstName: string;
  lastName: string;
  position: string;
  email: string;
  ORCID: string;
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

type ProgramInput = Partial<Pick<Organization, "_id" | "name" | "abbreviation" | "description">>;

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
  type: string;
  extension: string;
  count: number;
  amount: string;
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
