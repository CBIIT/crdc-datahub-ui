import * as utils from "./profileUtils";

describe("formatIDP utility function", () => {
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
