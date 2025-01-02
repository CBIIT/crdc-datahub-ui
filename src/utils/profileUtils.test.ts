import * as utils from "./profileUtils";

jest.mock("./stringUtils", () => ({
  formatName: jest.fn(),
}));

describe("formatIDP cases", () => {
  it("should format NIH IDP", () => {
    expect(utils.formatIDP("nih")).toBe("NIH");
  });

  it("should format Login.gov IDP", () => {
    expect(utils.formatIDP("login.gov")).toBe("Login.gov");
  });

  it("should ignore case", () => {
    expect(utils.formatIDP("LoGiN.gOv" as User["IDP"])).toBe("Login.gov");
  });

  it("should return the unmodified IDP if it is not a known service", () => {
    expect(utils.formatIDP("unknown" as User["IDP"])).toBe("unknown");
  });

  it("should invalid input without crashing", () => {
    expect(utils.formatIDP(undefined as User["IDP"])).toBe("");
    expect(utils.formatIDP(null as User["IDP"])).toBe("");
    expect(utils.formatIDP({} as User["IDP"])).toBe("");
  });
});

describe("userToCollaborator cases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should convert a full user object to a collaborator with default permission", () => {
    const user: Partial<User> = {
      _id: "user-1",
      firstName: "John",
      lastName: "Doe",
    };

    const collaborator = utils.userToCollaborator(user);

    expect(collaborator).toEqual({
      collaboratorID: "user-1",
      collaboratorName: "Doe, John",
      permission: "Can Edit",
      Organization: null,
    });
  });

  it("should use provided permission", () => {
    const user: Partial<User> = {
      _id: "user-1",
      firstName: "John",
      lastName: "Doe",
    };

    const collaborator = utils.userToCollaborator(user, "Can Edit");

    expect(collaborator.permission).toBe("Can Edit");
  });

  it("should handle missing firstName", () => {
    const user: Partial<User> = {
      _id: "user-1",
      lastName: "Doe",
    };

    const collaborator = utils.userToCollaborator(user);

    expect(collaborator.collaboratorName).toBe("Doe, ");
  });

  it("should handle missing lastName", () => {
    const user: Partial<User> = {
      _id: "user-1",
      firstName: "John",
    };

    const collaborator = utils.userToCollaborator(user);

    expect(collaborator.collaboratorName).toBe(", John");
  });

  it("should handle missing _id", () => {
    const user: Partial<User> = {
      firstName: "John",
      lastName: "Doe",
    };

    const collaborator = utils.userToCollaborator(user);

    expect(collaborator.collaboratorID).toBeUndefined();
  });

  it("should handle null user", () => {
    const collaborator = utils.userToCollaborator(null);

    expect(collaborator).toEqual({
      collaboratorID: undefined,
      collaboratorName: ", ",
      permission: "Can Edit",
      Organization: null,
    });
  });

  it("should handle undefined user", () => {
    const collaborator = utils.userToCollaborator(undefined);

    expect(collaborator).toEqual({
      collaboratorID: undefined,
      collaboratorName: ", ",
      permission: "Can Edit",
      Organization: null,
    });
  });

  it("should handle user with empty properties", () => {
    const user: Partial<User> = {
      _id: "",
      firstName: "",
      lastName: "",
    };

    const collaborator = utils.userToCollaborator(user);

    expect(collaborator).toEqual({
      collaboratorID: "",
      collaboratorName: ", ",
      permission: "Can Edit",
      Organization: null,
    });
  });

  it("should handle user with additional properties", () => {
    const user: Partial<User> = {
      _id: "user-1",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      role: "Admin",
    };

    const collaborator = utils.userToCollaborator(user);

    expect(collaborator).toEqual({
      collaboratorID: "user-1",
      collaboratorName: "Doe, John",
      permission: "Can Edit",
      Organization: null,
    });
  });
});
