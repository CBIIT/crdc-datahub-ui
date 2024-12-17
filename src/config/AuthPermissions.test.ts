import { hasPermission } from "./AuthPermissions";

const createUser = (role: UserRole, permissions: AuthPermissions[] = []): User => ({
  role,
  permissions,
  notifications: [],
  _id: "user-1",
  firstName: "",
  lastName: "",
  email: "",
  dataCommons: [],
  studies: [],
  IDP: "nih",
  userStatus: "Active",
  updateAt: "",
  createdAt: "",
});

describe("Basic Role-Based Permissions", () => {
  it("should allow a Federal Lead to view the dashboard", () => {
    const user = createUser("Federal Lead", ["dashboard:view"]);
    expect(hasPermission(user, "dashboard", "view")).toBe(true);
  });

  it("should deny a Federal Lead to view the dashboard without the defined permissions", () => {
    const user = createUser("Federal Lead", []);
    expect(hasPermission(user, "dashboard", "view")).toBe(false);
  });

  it("should deny a Submitter to view the dashboard", () => {
    const user = createUser("Submitter");
    expect(hasPermission(user, "dashboard", "view")).toBe(false);
  });

  it("should allow a Submitter to create a submission request", () => {
    const user = createUser("Submitter", ["submission_request:create"]);
    expect(hasPermission(user, "submission_request", "create")).toBe(true);
  });

  it("should deny a User to create a submission request", () => {
    const user = createUser("User");
    expect(hasPermission(user, "submission_request", "create")).toBe(false);
  });
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

describe("Permission String Check", () => {
  it("should verify that the user's permissions include the correct serialized permission key", () => {
    const user = createUser("Submitter", ["submission_request:create"]);
    expect(hasPermission(user, "submission_request", "create")).toBe(true);
  });

  it("should deny access if the serialized permission key is missing", () => {
    const user = createUser("Submitter", []);
    expect(hasPermission(user, "submission_request", "create")).toBe(false);
  });
});
