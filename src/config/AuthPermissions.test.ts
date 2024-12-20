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
    "should deny a user to view the dashboard if they have permission, regardless of '%s' role",
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
