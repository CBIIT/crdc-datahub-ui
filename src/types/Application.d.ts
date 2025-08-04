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
   * The new institutions present in the form
   */
  newInstitutions: Array<{ id: string; name: string }>;
  /**
   * The name of the Genomic Program Administrator
   */
  GPAName: string;
  /**
   * The email of the Genomic Program Administrator
   */
  GPAEmail: string;
  /**
   * The current form version
   */
  version: string;
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

type Contact = {
  position: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  /**
   * The institution name for the contact.
   *
   * @deprecated This is a legacy field and should only be used when the institutionID is not available.
   */
  institution: string;
  /**
   * The UUID of the institution for the contact.
   *
   * @since 3.4.0
   */
  institutionID: string;
};

type PI = {
  ORCID: string;
  address: string;
} & Omit<Contact, "phone">;

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
  GPAName: string;
  GPAEmail: string;
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
  /**
   * The name of the NCI Genomic Program Administrator
   *
   * @deprecated Use `GPAName` instead.
   * @see Study
   */
  nciGPA: string;
};

type HistoryEvent = HistoryBase<ApplicationStatus>;

type Applicant = {
  applicantID: string;
  applicantName: string;
  applicantEmail: string;
};
