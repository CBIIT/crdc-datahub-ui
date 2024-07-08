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

describe("titleCase", () => {
  it("should capitalize the first letter of each word", () => {
    expect(utils.titleCase("data file")).toBe("Data File");
  });

  it("should handle single word strings", () => {
    expect(utils.titleCase("participant")).toBe("Participant");
  });

  it("should handle empty strings", () => {
    expect(utils.titleCase("")).toBe("");
  });

  it("should safely handle null values", () => {
    expect(utils.titleCase(null)).toBe("");
  });

  it("should safely handle undefined values", () => {
    expect(utils.titleCase(undefined)).toBe("");
  });

  it("should safely handle non-string values", () => {
    expect(utils.titleCase(["this isnt a string"] as unknown as string)).toBe("");
  });

  it("should handle strings with multiple spaces", () => {
    expect(utils.titleCase("data   file")).toBe("Data   File");
  });

  it("should handle strings with mixed case", () => {
    expect(utils.titleCase("dATa fiLE")).toBe("Data File");
  });
});
describe("compareStrings utility function", () => {
  it("should correctly sort two non-empty strings", () => {
    expect(utils.compareStrings("apple", "banana")).toBeLessThan(0);
    expect(utils.compareStrings("banana", "apple")).toBeGreaterThan(0);
  });

  it("should place empty strings at the beginning of the sort order", () => {
    expect(utils.compareStrings("banana", "")).toBeGreaterThan(0);
    expect(utils.compareStrings("", "apple")).toBeLessThan(0);
  });

  it("should place null values at the beginning of the sort order", () => {
    expect(utils.compareStrings("banana", null)).toBeGreaterThan(0);
    expect(utils.compareStrings(null, "apple")).toBeLessThan(0);
  });

  it("should place spaces values before alphabetical characters in the sort order", () => {
    expect(utils.compareStrings(" ", "banana")).toBeLessThan(0);
    expect(utils.compareStrings("apple", " ")).toBeGreaterThan(0);
  });

  it("should place number values before alphabetical characters in the sort order", () => {
    expect(utils.compareStrings("1", "banana")).toBeLessThan(0);
    expect(utils.compareStrings("apple", "20")).toBeGreaterThan(0);
  });

  it("should place special characters values before numerical characters in the sort order", () => {
    expect(utils.compareStrings("-", "1")).toBeLessThan(0);
    expect(utils.compareStrings("1", "----")).toBeGreaterThan(0);
  });

  it("should treat two empty strings as equal", () => {
    expect(utils.compareStrings("", "")).toBe(0);
  });

  it("should treat two null values as equal", () => {
    expect(utils.compareStrings(null, null)).toBe(0);
  });

  it("should return zero when both strings are identical and non-empty", () => {
    expect(utils.compareStrings("apple", "apple")).toBe(0);
  });

  it("should handle case-sensitive comparisons appropriately", () => {
    expect(utils.compareStrings("apple", "Apple")).toBeLessThan(0);
    expect(utils.compareStrings("Apple", "apple")).toBeGreaterThan(0);
  });
});
