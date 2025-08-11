import { CharacterLimitsMap, ColumnDef } from "../SectionBase";

export type AKeys =
  | "pi.firstName"
  | "pi.lastName"
  | "pi.position"
  | "pi.email"
  | "pi.ORCID"
  | "pi.institution"
  | "pi.address"
  // | "pi.institutionID"
  | "piAsPrimaryContact"
  | "primaryContact.firstName"
  | "primaryContact.lastName"
  | "primaryContact.position"
  | "primaryContact.email"
  | "primaryContact.institution"
  // | "primaryContact.institutionID"
  | "primaryContact.phone"
  | "additionalContacts.firstName"
  | "additionalContacts.lastName"
  | "additionalContacts.position"
  | "additionalContacts.email"
  | "additionalContacts.institution"
  // | "additionalContacts.institutionID"
  | "additionalContacts.phone";

export const COLUMNS: ColumnDef<AKeys>[] = [
  // Principal Investigator
  { header: "First Name", key: "pi.firstName", width: 20, protection: { locked: true } },
  { header: "Last Name", key: "pi.lastName", width: 20, protection: { locked: true } },
  { header: "Position", key: "pi.position", width: 20, protection: { locked: true } },
  { header: "Email", key: "pi.email", width: 30, protection: { locked: true } },
  { header: "ORCID", key: "pi.ORCID", width: 30, protection: { locked: true } },
  { header: "Institution", key: "pi.institution", width: 30, protection: { locked: true } },
  { header: "Institution Address", key: "pi.address", width: 30, protection: { locked: true } },
  // Primary Contact
  {
    header: "Same as Principal Investigator",
    key: "piAsPrimaryContact",
    width: 30,
    protection: { locked: true },
  },
  {
    header: "First Name",
    key: "primaryContact.firstName",
    width: 20,
    protection: { locked: true },
  },
  { header: "Last Name", key: "primaryContact.lastName", width: 20, protection: { locked: true } },
  { header: "Position", key: "primaryContact.position", width: 20, protection: { locked: true } },
  { header: "Email", key: "primaryContact.email", width: 30, protection: { locked: true } },
  {
    header: "Institution",
    key: "primaryContact.institution",
    width: 30,
    protection: { locked: true },
  },
  { header: "Phone", key: "primaryContact.phone", width: 20, protection: { locked: true } },
  // Additional Contact(s)
  {
    header: "First Name",
    key: "additionalContacts.firstName",
    width: 20,
    protection: { locked: true },
  },
  {
    header: "Last Name",
    key: "additionalContacts.lastName",
    width: 20,
    protection: { locked: true },
  },
  {
    header: "Position",
    key: "additionalContacts.position",
    width: 20,
    protection: { locked: true },
  },
  { header: "Email", key: "additionalContacts.email", width: 30, protection: { locked: true } },
  {
    header: "Institution",
    key: "additionalContacts.institution",
    width: 30,
    protection: { locked: true },
  },
  { header: "Phone", key: "additionalContacts.phone", width: 20, protection: { locked: true } },
];

export const DEFAULT_CHARACTER_LIMITS: CharacterLimitsMap<AKeys> = {
  "pi.firstName": 50,
  "pi.lastName": 50,
  "pi.position": 100,
  // "pi.email": 0,
  // "pi.ORCID": 0,
  "pi.institution": 100,
  "pi.address": 200,
  "primaryContact.firstName": 50,
  "primaryContact.lastName": 50,
  "primaryContact.position": 100,
  // "primaryContact.email": 0,
  "primaryContact.institution": 100,
  "primaryContact.phone": 25,
  "additionalContacts.firstName": 50,
  "additionalContacts.lastName": 50,
  "additionalContacts.position": 100,
  // "additionalContacts.email": 0,
  "additionalContacts.institution": 100,
  "additionalContacts.phone": 25,
};
