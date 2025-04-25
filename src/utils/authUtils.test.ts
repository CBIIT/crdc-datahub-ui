import * as utils from "./authUtils";

describe("cleanPermissionKeys", () => {
  it("removes extra segments and deduplicates permission keys", () => {
    const raw = [
      "study:manage",
      "study:create",
      "study:create:scope:value",
      "user:view:role:admin",
      "study:manage",
    ];
    const result = utils.cleanPermissionKeys(raw);
    expect(result).toEqual(["study:manage", "study:create", "user:view"]);
  });

  it("filters out malformed permission strings", () => {
    const raw = ["bad", "", "foo:", ":bar", "entity:action", "entity:action:extra"];
    const result = utils.cleanPermissionKeys(raw);
    expect(result).toEqual(["entity:action"]);
  });

  it("returns an empty array if input is empty or undefined", () => {
    expect(utils.cleanPermissionKeys([])).toEqual([]);
    expect(utils.cleanPermissionKeys(undefined)).toEqual([]);
  });
});

describe("getUserPermissionKey", () => {
  it("returns the full raw permission string when it matches the base key", () => {
    const user = {
      permissions: [
        "submission_request:submit:role:submitter+admin",
        "submission_request:submit:own",
        "data_submission:create",
      ],
    } as User;

    expect(utils.getUserPermissionKey(user, "submission_request:submit")).toBe(
      "submission_request:submit:role:submitter+admin"
    );
  });

  it("returns the first matching permission if there are multiples", () => {
    const user = {
      permissions: [
        "data_submission:create:scope:X" as AuthPermissions,
        "data_submission:create:scope:Y" as AuthPermissions,
      ],
    } as User;

    expect(utils.getUserPermissionKey(user, "data_submission:create")).toBe(
      "data_submission:create:scope:X"
    );
  });

  it("returns undefined when nothing matches", () => {
    const user = {
      permissions: ["foo:bar" as AuthPermissions, "baz:qux" as AuthPermissions],
    } as User;

    expect(utils.getUserPermissionKey(user, "data_submission:create")).toBeUndefined();
  });

  it("returns undefined when permissions is empty or missing", () => {
    expect(utils.getUserPermissionKey({ permissions: [] } as User, "a:b")).toBeUndefined();
    expect(utils.getUserPermissionKey({} as User, "a:b")).toBeUndefined();
  });
});

describe("getUserPermissionExtensions", () => {
  it("splits extensions into groups of values", () => {
    const permission = "entity:action:scope:alpha+beta:region:us+eu" as AuthPermissions;
    const groups = utils.getUserPermissionExtensions(permission);

    expect(groups).toEqual([["scope"], ["alpha", "beta"], ["region"], ["us", "eu"]]);
  });

  it("honors custom `startAt` parameter", () => {
    const permission = "e:a:one:two+three:four" as AuthPermissions;
    const groups = utils.getUserPermissionExtensions(permission, 3);

    expect(groups).toEqual([["two", "three"], ["four"]]);
  });

  it("returns an empty array when the 'startAt' is greater than or equal to than extension length", () => {
    const permission = "entity:action:one:two" as AuthPermissions;

    expect(utils.getUserPermissionExtensions(permission, 10)).toEqual([]);
  });

  it("returns an empty array when there are no extensions", () => {
    const permission = "entity:action" as AuthPermissions;

    expect(utils.getUserPermissionExtensions(permission)).toEqual([]);
  });

  it("should handle negative 'startAt' parameters", () => {
    const permission = "entity:action:one:two:three:four:five" as AuthPermissions;

    expect(utils.getUserPermissionExtensions(permission, -2)).toEqual([["four"], ["five"]]);
  });
});
