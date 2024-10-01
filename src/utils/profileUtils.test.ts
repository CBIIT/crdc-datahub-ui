import * as utils from "./profileUtils";

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
});

describe("getEditableFields cases", () => {
  const admin: User = {
    _id: "1",
    role: "Admin",
  } as User;

  const user: User = {
    _id: "2",
    role: "User",
  } as User;

  const orgOwner: User = {
    _id: "3",
    role: "Organization Owner",
  } as User;

  const federalLead: User = {
    _id: "4",
    role: "Federal Lead",
  } as User;

  it("should allow an Admin to edit their own firstName and lastName", () => {
    const expected = ["firstName", "lastName"].sort();
    expect(utils.getEditableFields(admin, admin, "profile").sort()).toEqual(expected);
  });

  it("should allow an Admin to edit a Admin's role, organization, userStatus", () => {
    const expected = ["role", "organization", "userStatus", "dataCommons"].sort();
    expect(
      utils.getEditableFields(admin, { ...admin, _id: "AAA-123-19291" }, "users").sort()
    ).toEqual(expected);
  });

  it("should allow an Admin to edit a User's role, organization, userStatus", () => {
    const expected = ["role", "organization", "userStatus", "dataCommons"].sort();
    expect(utils.getEditableFields(admin, user, "users").sort()).toEqual(expected);
    expect(utils.getEditableFields(admin, orgOwner, "users").sort()).toEqual(expected);
  });

  it("should allow an Admin to edit a Federal Lead's role, userStatus, and organization", () => {
    const expected = ["role", "userStatus", "organization", "dataCommons"].sort();
    expect(utils.getEditableFields(admin, federalLead, "users").sort()).toEqual(expected);
  });

  it("should allow an Admin to edit a DC_POC role, organization, userStatus, and dataCommons", () => {
    const expected = ["role", "organization", "userStatus", "dataCommons"].sort();
    expect(
      utils
        .getEditableFields(
          admin,
          { ...user, role: "Data Commons POC", _id: "AAA-123-19291" },
          "users"
        )
        .sort()
    ).toEqual(expected);
  });

  it("should allow an Org Owner to edit their own firstName and lastName", () => {
    const expected = ["firstName", "lastName"].sort();
    expect(utils.getEditableFields(orgOwner, orgOwner, "profile").sort()).toEqual(expected);
  });

  it("should allow an Org Owner to view only", () => {
    const expected = [].sort();
    expect(utils.getEditableFields(orgOwner, user, "users").sort()).toEqual(expected);
  });

  it("should allow Federal Lead to edit their own firstName and lastName", () => {
    const expected = ["firstName", "lastName"].sort();
    expect(utils.getEditableFields(federalLead, federalLead, "profile").sort()).toEqual(expected);
  });

  it("should allow User's to edit their own firstName and lastName", () => {
    const expected = ["firstName", "lastName"].sort();
    expect(utils.getEditableFields(user, user, "profile").sort()).toEqual(expected);
  });

  it("by default, should not allow Federal Lead to edit another user's fields", () => {
    expect(utils.getEditableFields(federalLead, admin, "users")).toEqual([]);
    expect(utils.getEditableFields(federalLead, orgOwner, "users")).toEqual([]);
    expect(utils.getEditableFields(federalLead, user, "users")).toEqual([]);
    expect(
      utils.getEditableFields(federalLead, { ...federalLead, _id: "ABC-NOT-MY-ID" }, "users")
    ).toEqual([]);
  });

  it("by default, should not allow User to edit another user's fields", () => {
    expect(utils.getEditableFields(user, admin, "users")).toEqual([]);
    expect(utils.getEditableFields(user, orgOwner, "users")).toEqual([]);
    expect(utils.getEditableFields(user, federalLead, "users")).toEqual([]);
    expect(utils.getEditableFields(user, { ...user, _id: "ABC-NOT-MY-ID" }, "users")).toEqual([]);
  });
});
