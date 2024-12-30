import { hasPermission } from "./AuthPermissions";

const baseApplication: Application = {
  _id: "",
  status: "New",
  createdAt: "",
  updatedAt: "",
  submittedDate: "",
  history: [],
  controlledAccess: false,
  openAccess: false,
  ORCID: "",
  PI: "",
  applicant: {
    applicantID: "owner-123",
    applicantName: "",
    applicantEmail: "",
  },
  questionnaireData: null,
  programName: "",
  studyAbbreviation: "",
  conditional: false,
  pendingConditions: [],
  programAbbreviation: "",
  programDescription: "",
};

const createUser = (role: UserRole, permissions: AuthPermissions[] = []): User => ({
  role,
  permissions,
  notifications: [],
  _id: "user-1",
  firstName: "Alice",
  lastName: "Smith",
  email: "alice@example.com",
  dataCommons: [],
  studies: [],
  IDP: "nih",
  userStatus: "Active",
  updateAt: "",
  createdAt: "",
});

describe("Basic Permissions", () => {
  it.each<UserRole>([
    "Admin",
    "Data Commons Personnel",
    "Federal Lead",
    "Submitter",
    "User",
    "Invalid-role" as UserRole,
  ])(
    "should allow a user to view the dashboard if they have permission, regardless of '%s' role",
    (role) => {
      const user = createUser(role, ["dashboard:view"]);
      expect(hasPermission(user, "dashboard", "view")).toBe(true);
    }
  );

  it.each<UserRole>([
    "Admin",
    "Data Commons Personnel",
    "Federal Lead",
    "Submitter",
    "User",
    "Invalid-role" as UserRole,
  ])(
    "should deny a user to view the dashboard if they do not have permission, regardless of '%s' role",
    (role) => {
      const user = createUser(role, []);
      expect(hasPermission(user, "dashboard", "view")).toBe(false);
    }
  );
});

describe("Edge Cases", () => {
  it("should deny permission if the user role is invalid", () => {
    const user = createUser("InvalidRole" as UserRole);
    expect(hasPermission(user, "dashboard", "view")).toBe(false);
  });

  it("should deny permission if the user role is null or undefined", () => {
    const user = createUser(undefined);
    expect(hasPermission(user, "dashboard", "view")).toBe(false);
  });

  it("should deny permission if the action is invalid", () => {
    const user = createUser("Admin");
    expect(hasPermission(user, "dashboard", "invalid_action" as never)).toBe(false);
  });

  it("should deny permission if the resource is invalid", () => {
    const user = createUser("Admin");
    expect(hasPermission(user, "invalid_resource" as never, "view" as never)).toBe(false);
  });
});

describe("submission_request:submit Permission", () => {
  const validStatuses: ApplicationStatus[] = ["In Progress", "Inquired"];
  const invalidStatuses: ApplicationStatus[] = [
    "Approved",
    "In Review",
    "New",
    "Rejected",
    "Submitted",
  ];

  it.each(validStatuses)(
    "should allow the form owner to submit if the status is '%s' without the permission",
    (status) => {
      const user = createUser("Submitter", []);

      const application: Application = {
        ...baseApplication,
        status,
        applicant: {
          ...baseApplication.applicant,
          applicantID: "user-1",
        },
      };

      expect(hasPermission(user, "submission_request", "submit", application)).toBe(true);
    }
  );

  it.each(validStatuses)(
    "should allow a user with 'submission_request:submit' permission key if the status is '%s', even if not owner",
    (status) => {
      const user = createUser("Submitter", ["submission_request:submit"]);
      const application: Application = { ...baseApplication, status };

      expect(hasPermission(user, "submission_request", "submit", application)).toBe(true);
    }
  );

  it("should deny submission if the user is not the owner AND lacks the 'submission_request:submit' permission key", () => {
    const user = createUser("Submitter", []);
    const application: Application = { ...baseApplication, status: "In Progress" };

    expect(hasPermission(user, "submission_request", "submit", application)).toBe(false);
  });

  it.each(invalidStatuses)("should deny submission if the application status is '%s'", (status) => {
    const user = createUser("Submitter", ["submission_request:submit"]);
    const application: Application = { ...baseApplication, status };

    expect(hasPermission(user, "submission_request", "submit", application)).toBe(false);
  });

  it("should return false if application is missing or undefined", () => {
    const user = createUser("Submitter", ["submission_request:submit"]);

    expect(hasPermission(user, "submission_request", "submit", undefined)).toBe(false);
    expect(hasPermission(user, "submission_request", "submit", null)).toBe(false);
  });
});
