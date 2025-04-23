import * as utils from "./authUtils";

describe("checkPermissionKey", () => {
  const positiveCases = [
    "submission_request:submit:role:submitter+admin",
    "submission_request:submit:role+own+DC:admin",
    "submission_request:submit:own",
    "submission_request:submit:DC:example",
  ] as const;

  it.each(positiveCases)("returns true for `%s` when checking `%s`", (permissionString) => {
    const user = { permissions: [permissionString as AuthPermissions] } as User;
    expect(utils.checkPermissionKey(user, "submission_request:submit")).toBe(true);
  });

  it("returns true for exact `resource:action` without extensions", () => {
    const user = { permissions: ["submission_request:submit"] } as User;
    expect(utils.checkPermissionKey(user, "submission_request:submit")).toBe(true);
  });

  it("returns false when no matching `resource:action`", () => {
    const user = {
      permissions: [
        "submission_request:view",
        "submission_request:cancel",
        "submission_request:create",
        "submission_request:review",
        "data_submission:create:role:admin",
      ],
    } as User;
    expect(utils.checkPermissionKey(user, "submission_request:submit")).toBe(false);
  });

  it("returns false when `permissions` is empty or missing", () => {
    expect(utils.checkPermissionKey({ permissions: [] } as User, "foo:bar")).toBe(false);
    expect(utils.checkPermissionKey({} as User, "foo:bar")).toBe(false);
  });
});

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
});
