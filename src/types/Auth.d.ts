type User = {
  _id: string;
  firstName: string;
  lastName: string;
  userStatus: "Active" | "Inactive" | "Disabled";
  role:
    | "User"
    | "Submitter"
    | "Organization Owner"
    | "Federal Lead"
    // | "Concierge"
    | "Data Curator"
    // | "DC_OWNER"
    | "Data Commons POC"
    | "Admin";
  IDP: "nih" | "login.gov";
  email: string;
  organization: OrgInfo | null;
  curatedOrganizations: OrgInfo[];
  createdAt: string; // YYYY-MM-DDTHH:mm:ss.sssZ
  updateAt: string; // YYYY-MM-DDTHH:mm:ss.sssZ
};

type UserInfo = {
  userID: User["_id"];
  firstName: User["firstName"];
  lastName: User["lastName"];
  createdAt: User["createdAt"];
  updateAt: User["updateAt"];
};

type UserInput = {
  firstName: string;
  lastName: string;
};

type OrgInfo = {
  orgID: string;
  orgName: string;
  createdAt: string; // 2023-05-01T09:23:30Z, ISO data time format
  updateAt: string; // 2023-05-01T09:23:30Z  ISO data time format
};

type EditUserInput = {
  userID: User["_id"];
  userStatus: User['userStatus'];
  organization: {
    orgID: OrgInfo['orgID'];
  };
  role: User['role'];
};

type Organization = {
  _id: string;
  name: string;
  status: "Active" | "Inactive";
  conciergeID: string | null;
  conciergeName: string | null;
  conciergeEmail: string | null;
  studies: StudyInfo[];
  createdAt: string; // YYYY-MM-DDTHH:mm:ss.sssZ
  updateAt: string; // YYYY-MM-DDTHH:mm:ss.sssZ
};

// NOTE: This is a derivative of the `Study` type
type StudyInfo = {
  studyName: string;
  studyAbbreviation: string;
};
