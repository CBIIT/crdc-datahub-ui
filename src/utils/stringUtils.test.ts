import * as utils from "./stringUtils";

describe("filterAlphaNumeric utility function", () => {
  it("should filter out non-alphanumeric characters", () => {
    const input = "abc-123!@#";
    const result = utils.filterAlphaNumeric(input);

    expect(result).toEqual("abc123");
  });

  it("should allow additional characters", () => {
    const input = "Hello World-123!@#";
    const extraChars = "- ";
    const result = utils.filterAlphaNumeric(input, extraChars);

    expect(result).toEqual("Hello World-123");
  });

  it("should handle special characters that have meaning in regex", () => {
    const input = "abc.123[def]456{ghi}789";
    const extraChars = ".[]{}";
    const result = utils.filterAlphaNumeric(input, extraChars);

    expect(result).toEqual("abc.123[def]456{ghi}789");
  });

  it("should return empty string if no value is passed", () => {
    const result = utils.filterAlphaNumeric(undefined);

    expect(result).toEqual("");
  });

  it("should return empty string if null value is passed", () => {
    const result = utils.filterAlphaNumeric(null);

    expect(result).toEqual("");
  });
});
