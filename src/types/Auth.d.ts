type User = {
  _id: string;
  firstName: string;
  lastName: string;
  userStatus: 'Active' | 'Inactive' | 'Disabled';
  role: 'Admin' | 'User' | 'Curator' | 'FederalLead' | 'DC_POC' | "Owner" | "Submitter" | "Concierge";
  organization: OrgInfo;
  IDP: 'nih' | 'login.gov';
  email: string;
  createdAt: string; // YYYY-MM-DDTHH:mm:ss.sssZ
  updateAt: string; // YYYY-MM-DDTHH:mm:ss.sssZ
};

type UserInput = {
  firstName: string;
  lastName: string;
};

type OrgInfo = {
  orgID: string;
  orgName: string;
  orgRole: "Owner" | "Submitter" | "Concierge"; // Concierge can only be assigned to a Curator
  orgStatus: "Active" | "Inactive" | "Disabled";
  createdAt: string; // 2023-05-01T09:23:30Z, ISO data time format
  updateAt: string; // 2023-05-01T09:23:30Z  ISO data time format
};
