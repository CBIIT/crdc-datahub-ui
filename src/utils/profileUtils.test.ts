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
    _id: '1',
    role: 'Admin',
  } as User;

  const user: User = {
    _id: '2',
    role: 'User',
  } as User;

  const orgOwner: User = {
    _id: '3',
    role: 'ORG_OWNER',
  } as User;

  const federalLead: User = {
    _id: '4',
    role: 'FederalLead',
  } as User;

  it("should allow an Admin to edit their own firstName and lastName", () => {
    const expected = ['firstName', 'lastName'].sort();
    expect(utils.getEditableFields(admin, admin).sort()).toEqual(expected);
  });

  it("should allow an Admin to edit a Admin's role, organization, userStatus", () => {
    const expected = ['role', 'organization', 'userStatus'].sort();
    expect(utils.getEditableFields(admin, { ...admin, _id: "AAA-123-19291" }).sort()).toEqual(expected);
  });

  it("should allow an Admin to edit a User's role, organization, userStatus", () => {
    const expected = ['role', 'organization', 'userStatus'].sort();
    expect(utils.getEditableFields(admin, user).sort()).toEqual(expected);
    expect(utils.getEditableFields(admin, orgOwner).sort()).toEqual(expected);
  });

  it("should allow an Admin to edit a FederalLead's role, userStatus, and organization", () => {
    const expected = ['role', 'userStatus', 'organization'].sort();
    expect(utils.getEditableFields(admin, federalLead).sort()).toEqual(expected);
  });

  it("should allow an Org Owner to edit their own firstName and lastName", () => {
    const expected = ['firstName', 'lastName'].sort();
    expect(utils.getEditableFields(orgOwner, orgOwner).sort()).toEqual(expected);
  });

  it("should allow an Org Owner to view only", () => {
    const expected = [].sort();
    expect(utils.getEditableFields(orgOwner, user).sort()).toEqual(expected);
  });

  it("should allow FederalLead to edit their own firstName and lastName", () => {
    const expected = ['firstName', 'lastName'].sort();
    expect(utils.getEditableFields(federalLead, federalLead).sort()).toEqual(expected);
  });

  it("should allow User's to edit their own firstName and lastName", () => {
    const expected = ['firstName', 'lastName'].sort();
    expect(utils.getEditableFields(user, user).sort()).toEqual(expected);
  });

  it("by default, should not allow FederalLead to edit another user's fields", () => {
    expect(utils.getEditableFields(federalLead, admin)).toEqual([]);
    expect(utils.getEditableFields(federalLead, orgOwner)).toEqual([]);
    expect(utils.getEditableFields(federalLead, user)).toEqual([]);
    expect(utils.getEditableFields(federalLead, { ...federalLead, _id: "ABC-NOT-MY-ID" })).toEqual([]);
  });

  it("by default, should not allow User to edit another user's fields", () => {
    expect(utils.getEditableFields(user, admin)).toEqual([]);
    expect(utils.getEditableFields(user, orgOwner)).toEqual([]);
    expect(utils.getEditableFields(user, federalLead)).toEqual([]);
    expect(utils.getEditableFields(user, { ...user, _id: "ABC-NOT-MY-ID" })).toEqual([]);
  });
});
