/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */
describe("parseReleaseVersion cases", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();

    // Reset the environment variables back to their original values
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("should return the correct version when REACT_APP_FE_VERSION is valid", () => {
    process.env.REACT_APP_FE_VERSION = "3.1.0.472";
    const { parseReleaseVersion } = require("./envUtils");
    expect(parseReleaseVersion()).toBe("3.1.0");
  });

  it.each<[version: string, expected: string]>([
    // Real tags
    ["3.1.0", "3.1.0.405"],
    ["3.0.0", "3.0.0.402"],
    ["2.1.0", "2.1.0.339"],
    ["2.0.0", "2.0.0.213"],
    ["1.0.1", "1.0.1.180"],
    // Future proofing
    ["10.0.1", "10.0.1.1293"],
    ["24.19.11", "24.19.11.3456"],
    ["9999.0.9999", "9999.0.9999.9999"],
  ])(
    "should correctly parse the release version of %p from the value of %p",
    (expected, version) => {
      process.env.REACT_APP_FE_VERSION = version;
      const { parseReleaseVersion } = require("./envUtils");
      expect(parseReleaseVersion()).toBe(expected);
    }
  );

  it("should return N/A when REACT_APP_FE_VERSION is not set", () => {
    delete process.env.REACT_APP_FE_VERSION;
    const { parseReleaseVersion } = require("./envUtils");

    expect(parseReleaseVersion()).toBe("N/A");
  });

  it("should return N/A when REACT_APP_FE_VERSION is not a string", () => {
    process.env.REACT_APP_FE_VERSION = 0 as unknown as string; // NOTE: Env variables can officially only be strings
    const { parseReleaseVersion } = require("./envUtils");

    expect(parseReleaseVersion()).toBe("N/A");
  });

  it("should return N/A when REACT_APP_FE_VERSION is not in the expected format (1/3)", () => {
    process.env.REACT_APP_FE_VERSION = "invalid";
    const { parseReleaseVersion } = require("./envUtils");

    expect(parseReleaseVersion()).toBe("N/A");
  });

  it("should return N/A when REACT_APP_FE_VERSION is not in the expected format (2/3)", () => {
    process.env.REACT_APP_FE_VERSION = "mvp-2.213";
    const { parseReleaseVersion } = require("./envUtils");

    expect(parseReleaseVersion()).toBe("N/A");
  });

  it("should return N/A when REACT_APP_FE_VERSION is not in the expected format (3/3)", () => {
    process.env.REACT_APP_FE_VERSION = "test-branch.214";
    const { parseReleaseVersion } = require("./envUtils");

    expect(parseReleaseVersion()).toBe("N/A");
  });

  it("should return N/A when unable to get release version from build tag", () => {
    process.env.REACT_APP_FE_VERSION = "0.0.0.000";

    // NOTE: Previous safety checks should prevent this from happening,
    // so we're just mocking some improper `match` behavior here
    jest.spyOn(String.prototype, "match").mockReturnValueOnce([undefined, undefined]);

    const { parseReleaseVersion } = require("./envUtils");

    expect(parseReleaseVersion()).toBe("N/A");
  });
});

describe("buildReleaseNotesUrl cases", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();

    // Reset the environment variables back to their original values
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("should return the correct URL when REACT_APP_FE_VERSION is valid", () => {
    process.env.REACT_APP_FE_VERSION = "3.1.0.472";
    const { buildReleaseNotesUrl } = require("./envUtils");

    expect(buildReleaseNotesUrl()).toBe(
      "https://raw.githubusercontent.com/CBIIT/crdc-datahub-ui/refs/tags/3.1.0.472/README.md"
    );
  });

  it("should return the fallback URL when REACT_APP_FE_VERSION is not set", () => {
    delete process.env.REACT_APP_FE_VERSION;
    const { buildReleaseNotesUrl } = require("./envUtils");

    expect(buildReleaseNotesUrl()).toBe(
      "https://raw.githubusercontent.com/CBIIT/crdc-datahub-ui/refs/heads/main/README.md"
    );
  });

  it("should return the fallback URL when REACT_APP_FE_VERSION is not a string", () => {
    process.env.REACT_APP_FE_VERSION = 0 as unknown as string; // NOTE: Env variables can officially only be strings
    const { buildReleaseNotesUrl } = require("./envUtils");

    expect(buildReleaseNotesUrl()).toBe(
      "https://raw.githubusercontent.com/CBIIT/crdc-datahub-ui/refs/heads/main/README.md"
    );
  });

  it("should return the fallback URL when REACT_APP_FE_VERSION is not in the expected format", () => {
    process.env.REACT_APP_FE_VERSION = "invalid";
    const { buildReleaseNotesUrl } = require("./envUtils");

    expect(buildReleaseNotesUrl()).toBe(
      "https://raw.githubusercontent.com/CBIIT/crdc-datahub-ui/refs/heads/main/README.md"
    );
  });
});
