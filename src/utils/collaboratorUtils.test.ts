import * as utils from "./collaboratorUtils";
import { formatName } from "./stringUtils";

jest.mock("./stringUtils", () => ({
  formatName: jest.fn(),
}));

const mockFormatName = formatName as jest.Mock;

describe("userToCollaborator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should convert a full user object to a collaborator with default permission", () => {
    const user: Partial<User> = {
      _id: "user-1",
      firstName: "John",
      lastName: "Doe",
      organization: {
        orgID: "org-1",
        orgName: "Organization 1",
        status: "Active",
        createdAt: "",
        updateAt: "",
      },
    };

    mockFormatName.mockReturnValue("John Doe");

    const collaborator = utils.userToCollaborator(user);

    expect(collaborator).toEqual({
      collaboratorID: "user-1",
      collaboratorName: "John Doe",
      permission: "Can View",
      Organization: {
        orgID: "org-1",
        orgName: "Organization 1",
      },
    });

    expect(mockFormatName).toHaveBeenCalledWith("John", "Doe");
  });

  it("should use provided permission", () => {
    const user: Partial<User> = {
      _id: "user-1",
      firstName: "John",
      lastName: "Doe",
    };

    mockFormatName.mockReturnValue("John Doe");

    const collaborator = utils.userToCollaborator(user, "Can Edit");

    expect(collaborator.permission).toBe("Can Edit");
  });

  it("should handle missing firstName", () => {
    const user: Partial<User> = {
      _id: "user-1",
      lastName: "Doe",
    };

    mockFormatName.mockReturnValue("Doe");

    const collaborator = utils.userToCollaborator(user);

    expect(collaborator.collaboratorName).toBe("Doe");
    expect(mockFormatName).toHaveBeenCalledWith(undefined, "Doe");
  });

  it("should handle missing lastName", () => {
    const user: Partial<User> = {
      _id: "user-1",
      firstName: "John",
    };

    mockFormatName.mockReturnValue("John");

    const collaborator = utils.userToCollaborator(user);

    expect(collaborator.collaboratorName).toBe("John");
    expect(mockFormatName).toHaveBeenCalledWith("John", undefined);
  });

  it("should handle missing organization", () => {
    const user: Partial<User> = {
      _id: "user-1",
      firstName: "John",
      lastName: "Doe",
    };

    mockFormatName.mockReturnValue("John Doe");

    const collaborator = utils.userToCollaborator(user);

    expect(collaborator.Organization).toEqual({
      orgID: undefined,
      orgName: undefined,
    });
  });

  it("should handle missing organization orgID and orgName", () => {
    const user: Partial<User> = {
      _id: "user-1",
      firstName: "John",
      lastName: "Doe",
      organization: {
        orgID: "",
        orgName: "",
        status: "Active",
        createdAt: "",
        updateAt: "",
      },
    };

    mockFormatName.mockReturnValue("John Doe");

    const collaborator = utils.userToCollaborator(user);

    expect(collaborator.Organization).toEqual({
      orgID: "",
      orgName: "",
    });
  });

  it("should handle missing _id", () => {
    const user: Partial<User> = {
      firstName: "John",
      lastName: "Doe",
    };

    mockFormatName.mockReturnValue("John Doe");

    const collaborator = utils.userToCollaborator(user);

    expect(collaborator.collaboratorID).toBeUndefined();
  });

  it("should handle null user", () => {
    const collaborator = utils.userToCollaborator(null);

    expect(collaborator).toEqual({
      collaboratorID: undefined,
      collaboratorName: formatName(undefined, undefined),
      permission: "Can View",
      Organization: {
        orgID: undefined,
        orgName: undefined,
      },
    });

    expect(mockFormatName).toHaveBeenCalledWith(undefined, undefined);
  });

  it("should handle undefined user", () => {
    const collaborator = utils.userToCollaborator(undefined);

    expect(collaborator).toEqual({
      collaboratorID: undefined,
      collaboratorName: formatName(undefined, undefined),
      permission: "Can View",
      Organization: {
        orgID: undefined,
        orgName: undefined,
      },
    });

    expect(mockFormatName).toHaveBeenCalledWith(undefined, undefined);
  });

  it("should handle user with empty properties", () => {
    const user: Partial<User> = {
      _id: "",
      firstName: "",
      lastName: "",
      organization: {
        orgID: "",
        orgName: "",
        status: "Active",
        createdAt: "",
        updateAt: "",
      },
    };

    mockFormatName.mockReturnValue("");

    const collaborator = utils.userToCollaborator(user);

    expect(collaborator).toEqual({
      collaboratorID: "",
      collaboratorName: "",
      permission: "Can View",
      Organization: {
        orgID: "",
        orgName: "",
      },
    });

    expect(mockFormatName).toHaveBeenCalledWith("", "");
  });

  it("should handle user with additional properties", () => {
    const user: Partial<User> = {
      _id: "user-1",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      role: "Admin",
      organization: {
        orgID: "org-1",
        orgName: "Organization 1",
        status: "Active",
        createdAt: "",
        updateAt: "",
      },
    };

    mockFormatName.mockReturnValue("John Doe");

    const collaborator = utils.userToCollaborator(user);

    expect(collaborator).toEqual({
      collaboratorID: "user-1",
      collaboratorName: "John Doe",
      permission: "Can View",
      Organization: {
        orgID: "org-1",
        orgName: "Organization 1",
      },
    });

    expect(mockFormatName).toHaveBeenCalledWith("John", "Doe");
  });
});
