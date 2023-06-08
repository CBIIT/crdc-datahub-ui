type Application = {
  id: number;
  sections: Section[];
  pi: PI;
  primaryContact: PrimaryContact;
  additionalContacts: AdditionalContact[];
  program: Program;
  study: Study;
};

type Section = {
  name: string;
  status: "In Progress" | "Submitted" | "Completed" | "Approved" | "Rejected";
};

type PI = {
  firstName: string;
  lastName: string;
  position: string;
  email: string;
  institution: string;
  eRAAccount: string;
  address: string; // NOTE: This differs from the GQL schemax
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
