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

describe("filterPositiveIntegerString utility function", () => {
  it("should filter out non-integer values and only contain integers", () => {
    const input = "1.1";
    const result = utils.filterPositiveIntegerString(input);
    expect(result).toEqual("11");
  });

  it("should filter out negative integer values and only contain integers", () => {
    const input = "-5";
    const result = utils.filterPositiveIntegerString(input);
    expect(result).toEqual("5");
  });

  it("should allow positive integer values", () => {
    const input = "5";
    const result = utils.filterPositiveIntegerString(input);
    expect(result).toEqual("5");
  });

  it("should return an empty string for non-numeric characters", () => {
    const input = "abc";
    const result = utils.filterPositiveIntegerString(input);
    expect(result).toEqual("");
  });

  it("should extract only the integers for a mixed string with non-integer numbers", () => {
    const input = "3.5abc";
    const result = utils.filterPositiveIntegerString(input);
    expect(result).toEqual("35");
  });

  it("should return an empty string if input string is empty", () => {
    const input = "";
    const result = utils.filterPositiveIntegerString(input);
    expect(result).toEqual("");
  });

  it("should remove leading zeros", () => {
    const input = "00123";
    const result = utils.filterPositiveIntegerString(input);
    expect(result).toEqual("123");
  });

  it("should return an empty string for input with whitespace", () => {
    const input = " 123 ";
    const result = utils.filterPositiveIntegerString(input);
    expect(result).toEqual("123");
  });

  it("should handle very long numbers", () => {
    const input = "1".repeat(10000);
    const result = utils.filterPositiveIntegerString(input);
    expect(result).toEqual(input);
  });

  it("should return an empty string for null string", () => {
    const input = "null";
    const result = utils.filterPositiveIntegerString(input);
    expect(result).toEqual("");
  });

  it("should return an empty string for null value", () => {
    const input = null;
    const result = utils.filterPositiveIntegerString(input);
    expect(result).toEqual("");
  });

  it("should return an empty string for undefined string", () => {
    const input = "undefined";
    const result = utils.filterPositiveIntegerString(input);
    expect(result).toEqual("");
  });

  it("should return an empty string for undefined value", () => {
    const input = undefined;
    const result = utils.filterPositiveIntegerString(input);
    expect(result).toEqual("");
  });

  it("should not allow periods to be in string", () => {
    const input = "1.";
    const result = utils.filterPositiveIntegerString(input);
    expect(result).toEqual("1");
  });
});
