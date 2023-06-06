type Application = {
  id: number;
  sections: Section[];
  pi: PI;
  primaryContact: PrimaryContact;
  additionalContacts: AdditionalContact[];
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
