import { Factory } from "./Factory";

/**
 * Base approved study object
 */
export const baseApprovedStudy: ApprovedStudy = {
  _id: "",
  originalOrg: "",
  studyName: "",
  studyAbbreviation: "",
  dbGaPID: "",
  controlledAccess: false,
  openAccess: false,
  PI: "",
  ORCID: "",
  programs: [],
  primaryContact: {
    _id: "",
    firstName: "",
    lastName: "",
    role: "User",
    email: "",
    dataCommons: [],
    dataCommonsDisplayNames: [],
    studies: [],
    institution: undefined,
    IDP: "nih",
    userStatus: "Active",
    permissions: [],
    notifications: [],
    updateAt: "",
    createdAt: "",
  },
  useProgramPC: false,
  pendingModelChange: false,
  createdAt: "",
};

/**
 * Approved study factory for creating approved study instances
 */
export const approvedStudyFactory = new Factory<ApprovedStudy>((overrides) => ({
  ...baseApprovedStudy,
  ...overrides,
}));
