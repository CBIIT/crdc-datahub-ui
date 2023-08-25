type User = {
  _id: string;
  firstName: string;
  lastName: string;
  userStatus: "Active" | "Inactive" | "Disabled";
  role:
    | "User"
    | "Submitter"
    | "ORG_OWNER"
    | "FederalLead"
    | "Concierge"
    | "Curator"
    | "DC_OWNER"
    | "DC_POC"
    | "Admin";
  IDP: "nih" | "login.gov";
  email: string;
  organization: OrgInfo;
  curatedOrganizations: OrgInfo[];
  createdAt: string; // YYYY-MM-DDTHH:mm:ss.sssZ
  updateAt: string; // YYYY-MM-DDTHH:mm:ss.sssZ
};

type UserInput = {
  firstName: string;
  lastName: string;
};

type UserInfo = {
  userID: string;
  firstName: string;
  lastName: string;
  createdAt: string; // 2023-05-01T09:23:30Z, ISO data time format
  updateAt: string; // 2023-05-01T09:23:30Z  ISO data time format
};

type OrgInfo = {
  orgID: string;
  orgName: string;
  createdAt: string; // 2023-05-01T09:23:30Z, ISO data time format
  updateAt: string; // 2023-05-01T09:23:30Z  ISO data time format
};
