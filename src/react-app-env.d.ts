/// <reference types="react-scripts" />
type Application = {
  id: number;
  sections: Section[];
  pi: PI;
  primaryContact: PrimaryContact;
  additionalContacts: AdditionalContact[];
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
  address: string; // NOTE: This differs from the GQL schemax
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

type FormSectionProps = {
  classes: any;
  refs: any;
};
