type Application = {
  _id: number;
  sections: Section[];
  pi: PI;
  primaryContact: PrimaryContact;
  additionalContacts: AdditionalContact[];
  program: Program;
  study: Study;
  funding: Funding;
  publications: Publication[];
  plannedPublications: PlannedPublication[];
};

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
  position: string;
};

type AdditionalContact = {
  role: string; // NOTE: this needs to become position, currently matches GQL schema
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
