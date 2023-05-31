/// <reference types="react-scripts" />
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
  status: string;
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

type PrimaryContact = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

type AdditionalContact = {
  role: string
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
};

type KeyedAdditionalContact = {
  key: string;
} & AdditionalContact;

type Program = {
  title: string;
  abbreviation: string;
  description: string;
};

type Study = {
  title: string;
  abbreviation: string;
  description: string;
  repositories: Repository[];
};

type Repository = {
  name: string;
  studyID: string;
};

type FormSectionProps = {
  classes: any;
  refs: any;
};
