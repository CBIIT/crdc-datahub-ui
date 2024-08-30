type User = {
  /**
   * The UUIDv4 identifier of the user account
   */
  _id: string;
  /**
   * The user's first name
   */
  firstName: string;
  /**
   * The user's last name
   */
  lastName: string | null;
  /**
   * The current user role
   *
   * @see {@link UserRole}
   */
  role: UserRole;
  /**
   * The user's email address
   */
  email: string;
  /**
   * The user's organization if assigned, null otherwise
   *
   * @see {@link OrgInfo}
   */
  organization: OrgInfo | null;
  /**
   * List of data commons that the user has access to
   */
  dataCommons: string[];
  /**
   * A list of studyIDs that the user is assigned to
   *
   * @see {@link ApprovedStudy}
   */
  studies?: string[]; // TODO: This is nullable, we need to check if BE always returns this field
  /**
   * The SSO IDP used to login
   */
  IDP: "nih" | "login.gov";
  /**
   * The current account status for the user
   */
  userStatus: "Active" | "Inactive" | "Disabled";
  /**
   * The last update date of the user object
   *
   * @note ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
   */
  updateAt: string;
  /**
   * The date of user creation
   *
   * @note ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
   */
  createdAt: string;
};

type UserRole =
  | "User"
  | "Submitter"
  | "Organization Owner"
  | "Federal Monitor"
  | "Federal Lead"
  | "Data Curator"
  | "Data Commons POC"
  | "Admin";

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
  status: "Active" | "Inactive";
  createdAt: string; // 2023-05-01T09:23:30Z, ISO data time format
  updateAt: string; // 2023-05-01T09:23:30Z  ISO data time format
};

type EditUserInput = {
  userID: User["_id"];
  userStatus: User["userStatus"];
  organization: {
    orgID: OrgInfo["orgID"];
  };
  dataCommons: User["dataCommons"];
  studies: User["studies"];
  role: UserRole;
};

type Organization = {
  _id: string;
  name: string;
  status: "Active" | "Inactive";
  conciergeID: string | null;
  conciergeName: string | null;
  conciergeEmail: string | null;
  studies: ApprovedStudy[];
  createdAt: string; // YYYY-MM-DDTHH:mm:ss.sssZ
  updateAt: string; // YYYY-MM-DDTHH:mm:ss.sssZ
};

type Tokens = {
  tokens: string[];
  message: string;
};
