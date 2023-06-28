type Application = {
  _id: number;
  sections: Section[];
  pi: PI;
  piAsPrimaryContact: boolean;
  primaryContact: PrimaryContact | null;
  additionalContacts: AdditionalContact[];
  program: Program;
  study: Study;
  funding: Funding;
  publications: Publication[];
  status: ApplicationStatus;
  reviewComment: string;
  updatedAt: string;
  history: HistoryEvent[];
  plannedPublications: PlannedPublication[];
};

type ApplicationStatus = "New" | "In Progress" | "Submitted" | "In Review" | "Approved" | "Rejected";

type Section = {
  name: string;
  status: SectionStatus;
};

type SectionStatus = "In Progress" | "Completed" | "Not Started";

type PI = {
  firstName: string;
  lastName: string;
  position: string;
  email: string;
  institution: string;
  eRAAccount: string;
  address: string;
};

type PrimaryContact = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  institution: string;
  role: string;
};

type AdditionalContact = {
  role: string;
  firstName: string;
  lastName: string;
  institution: string;
  email: string;
  phone?: string;
};

type Program = {
  title: string;
  abbreviation: string;
  description: string;
};

type Study = {
  title: string;
  abbreviation: string;
  description: string;
  repositories?: Repository[];
};

type Repository = {
  name: string;
  studyID: string;
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

type Funding = {
  agencies: Agency[]; // NOTE: this likely needs to be restructured. Currently matches GQL schema
  nciProgramOfficer: string;
  nciGPA: string;
};

type Agency = {
  name: string;
  grantNumbers: string[];
};

type HistoryEvent = {
  status: ApplicationStatus;
  reviewComment?: string;
  dateTime: string;
  userID: number;
};
