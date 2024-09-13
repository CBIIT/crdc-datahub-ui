import { renderHook } from "@testing-library/react";
import * as Auth from "../components/Contexts/AuthContext";
import useProfileFields, { FieldState } from "./useProfileFields";

describe("Users View", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return UNLOCKED for role and userStatus when viewing users as an Admin", () => {
    const user = { _id: "User-A", role: "Admin" } as User;
    const profileOf: Pick<User, "_id" | "role"> = { _id: "I-Am-User-B", role: "Submitter" };

    jest.spyOn(Auth, "useAuthContext").mockReturnValue({ user } as Auth.ContextState);

    const { result } = renderHook(() => useProfileFields(profileOf, "users"));

    expect(result.current.role).toBe("UNLOCKED");
    expect(result.current.userStatus).toBe("UNLOCKED");
  });

  it.each<UserRole>(["User", "Submitter", "Organization Owner", "Data Commons POC"])(
    "should return UNLOCKED for organization when viewing the role %s",
    (role) => {
      const user = { _id: "User-A", role: "Admin" } as User;
      const profileOf: Pick<User, "_id" | "role"> = { _id: "I-Am-User-B", role };

      jest.spyOn(Auth, "useAuthContext").mockReturnValue({ user } as Auth.ContextState);

      const { result } = renderHook(() => useProfileFields(profileOf, "users"));

      expect(result.current.organization).toBe("UNLOCKED");
    }
  );

  // NOTE: This list is derived from the OrgAssignmentMap in src/config/AuthRoles.ts
  it.each<UserRole>(["Admin", "Data Curator", "Federal Lead", "Federal Monitor"])(
    "should return DISABLED for organization when viewing the role %s",
    (role) => {
      const user = { _id: "User-A", role: "Admin" } as User;
      const profileOf: Pick<User, "_id" | "role"> = { _id: "I-Am-User-B", role };

      jest.spyOn(Auth, "useAuthContext").mockReturnValue({ user } as Auth.ContextState);

      const { result } = renderHook(() => useProfileFields(profileOf, "users"));

      expect(result.current.organization).toBe("DISABLED");
    }
  );

  it("should return READ_ONLY for all standard fields when a Organization Owner views the page", () => {
    const user = { _id: "User-A", role: "Organization Owner" } as User;
    const profileOf: Pick<User, "_id" | "role"> = { _id: "I-Am-User-B", role: "Submitter" };

    jest.spyOn(Auth, "useAuthContext").mockReturnValue({ user } as Auth.ContextState);

    const { result } = renderHook(() => useProfileFields(profileOf, "users"));

    expect(result.current.firstName).toBe("READ_ONLY");
    expect(result.current.lastName).toBe("READ_ONLY");
    expect(result.current.role).toBe("READ_ONLY");
    expect(result.current.userStatus).toBe("READ_ONLY");
    expect(result.current.organization).toBe("READ_ONLY");
  });

  it.each<[FieldState, UserRole]>([
    ["HIDDEN", "User"],
    ["HIDDEN", "Submitter"],
    ["HIDDEN", "Organization Owner"],
    ["HIDDEN", "Federal Lead"],
    ["HIDDEN", "Data Curator"],
    ["HIDDEN", "Data Commons POC"],
    ["HIDDEN", "Admin"],
    ["HIDDEN", "fake role" as UserRole],
    ["UNLOCKED", "Federal Monitor"], // NOTE: Only this role accepts studies
  ])("should return %s for the studies field on the users page for role %s", (state, role) => {
    const user = { _id: "User-A", role: "Admin" } as User;
    const profileOf: Pick<User, "_id" | "role"> = { _id: "I-Am-User-B", role };

    jest.spyOn(Auth, "useAuthContext").mockReturnValue({ user } as Auth.ContextState);

    const { result } = renderHook(() => useProfileFields(profileOf, "users"));

    expect(result.current.studies).toBe(state);
  });

  it.each<[FieldState, UserRole]>([
    ["HIDDEN", "User"],
    ["HIDDEN", "Submitter"],
    ["HIDDEN", "Organization Owner"],
    ["HIDDEN", "Federal Lead"],
    ["HIDDEN", "Data Curator"],
    ["HIDDEN", "Admin"],
    ["HIDDEN", "fake role" as UserRole],
    ["HIDDEN", "Federal Monitor"],
    ["UNLOCKED", "Data Commons POC"], // NOTE: Only this role accepts studies
  ])("should return %s for the dataCommons field on the users page for role %s", (state, role) => {
    const user = { _id: "User-A", role: "Admin" } as User;
    const profileOf: Pick<User, "_id" | "role"> = { _id: "I-Am-User-B", role };

    jest.spyOn(Auth, "useAuthContext").mockReturnValue({ user } as Auth.ContextState);

    const { result } = renderHook(() => useProfileFields(profileOf, "users"));

    expect(result.current.dataCommons).toBe(state);
  });

  it("should always return READ_ONLY for the firstName and lastName fields on the users page", () => {
    const user = { _id: "User-A", role: "Admin" } as User;
    const profileOf: Pick<User, "_id" | "role"> = { _id: "I-Am-User-B", role: "Submitter" };

    jest.spyOn(Auth, "useAuthContext").mockReturnValue({ user } as Auth.ContextState);

    const { result } = renderHook(() => useProfileFields(profileOf, "users"));

    expect(result.current.firstName).toBe("READ_ONLY");
    expect(result.current.lastName).toBe("READ_ONLY");
  });
});

describe("Profile View", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return UNLOCKED for firstName and lastName when viewing own profile", () => {
    const user = { _id: "User-A", role: "User" } as User;
    const profileOf: Pick<User, "_id" | "role"> = { _id: "User-A", role: "User" };

    jest.spyOn(Auth, "useAuthContext").mockReturnValue({ user } as Auth.ContextState);

    const { result } = renderHook(() => useProfileFields(profileOf, "profile"));

    expect(result.current.firstName).toBe("UNLOCKED");
    expect(result.current.lastName).toBe("UNLOCKED");
  });

  it("should return READ_ONLY for all other normal fields when viewing own profile", () => {
    const user = { _id: "User-A", role: "User" } as User;
    const profileOf: Pick<User, "_id" | "role"> = { _id: "User-A", role: "User" };

    jest.spyOn(Auth, "useAuthContext").mockReturnValue({ user } as Auth.ContextState);

    const { result } = renderHook(() => useProfileFields(profileOf, "profile"));

    expect(result.current.role).toBe("READ_ONLY");
    expect(result.current.userStatus).toBe("READ_ONLY");
    expect(result.current.organization).toBe("READ_ONLY");
  });

  it.each<UserRole>([
    "User",
    "Submitter",
    "Federal Monitor", // NOTE: Only this role accepts studies
    "Data Commons POC",
    "fake role" as UserRole,
  ])("should return HIDDEN for the studies field on the profile page for role %s", (role) => {
    const user = { _id: "User-A", role } as User;
    const profileOf: Pick<User, "_id" | "role"> = { _id: "User-A", role };

    jest.spyOn(Auth, "useAuthContext").mockReturnValue({ user } as Auth.ContextState);

    const { result } = renderHook(() => useProfileFields(profileOf, "profile"));

    expect(result.current.studies).toBe("HIDDEN");
  });

  it.each<[state: FieldState, role: UserRole]>([
    ["HIDDEN", "Submitter"],
    ["HIDDEN", "Data Curator"],
    ["HIDDEN", "fake user" as UserRole],
    ["READ_ONLY", "Data Commons POC"], // NOTE: Only one with this field visible
  ])("should return %s for the dataCommons field for the role %s", (state, role) => {
    const user = { _id: "User-A", role } as User;
    const profileOf: Pick<User, "_id" | "role"> = { _id: "User-A", role };

    jest.spyOn(Auth, "useAuthContext").mockReturnValue({ user } as Auth.ContextState);

    const { result } = renderHook(() => useProfileFields(profileOf, "profile"));

    expect(result.current.dataCommons).toBe(state);
  });

  // NOTE: This is a fallback case that should never be reached in the current implementation
  it.each<UserRole>([
    "Admin",
    "Data Commons POC",
    "Data Curator",
    "Federal Lead",
    "Federal Monitor",
    "Organization Owner",
    "Submitter",
    "User",
    "fake role" as UserRole,
  ])(
    "should return READ_ONLY for all fields when viewing another user's profile for all roles",
    (role) => {
      const user = { _id: "User-A", role } as User;
      const profileOf: Pick<User, "_id" | "role"> = { _id: "Not-User-B", role: "Submitter" };

      jest.spyOn(Auth, "useAuthContext").mockReturnValue({ user } as Auth.ContextState);

      const { result } = renderHook(() => useProfileFields(profileOf, "profile"));

      expect(result.current.firstName).toBe("READ_ONLY");
      expect(result.current.lastName).toBe("READ_ONLY");
      expect(result.current.role).toBe("READ_ONLY");
      expect(result.current.userStatus).toBe("READ_ONLY");
      expect(result.current.organization).toBe("READ_ONLY");
      expect(result.current.dataCommons).toBe("HIDDEN");
      expect(result.current.studies).toBe("HIDDEN");
    }
  );

  // NOTE: This scenario is obscure to reproduce, but if a Data Commons POC is changed
  // to an Admin and refreshes their profile page, this field would appear unlocked
  it("should return READ_ONLY for an Admin viewing a Data Commons POC profile", () => {
    const user = { _id: "User-A", role: "Admin" } as User;
    const profileOf: Pick<User, "_id" | "role"> = { _id: "Not-User-B", role: "Data Commons POC" };

    jest.spyOn(Auth, "useAuthContext").mockReturnValue({ user } as Auth.ContextState);

    const { result } = renderHook(() => useProfileFields(profileOf, "profile"));

    expect(result.current.dataCommons).toBe("READ_ONLY");
  });
});
