import { formatAccessTypes } from "./studyUtils";

describe("formatAccessTypes", () => {
  it('should return "Controlled, Open" when both controlledAccess and openAccess are true', () => {
    const result = formatAccessTypes(true, true);
    expect(result).toBe("Controlled, Open");
  });

  it('should return "Controlled" when only controlledAccess is true', () => {
    const result = formatAccessTypes(true, false);
    expect(result).toBe("Controlled");
  });

  it('should return "Open" when only openAccess is true', () => {
    const result = formatAccessTypes(false, true);
    expect(result).toBe("Open");
  });

  it("should return an empty string when both controlledAccess and openAccess are false", () => {
    const result = formatAccessTypes(false, false);
    expect(result).toBe("");
  });

  it("should handle controlledAccess as true and openAccess as undefined", () => {
    const result = formatAccessTypes(true, undefined);
    expect(result).toBe("Controlled");
  });

  it("should handle openAccess as true and controlledAccess as undefined", () => {
    const result = formatAccessTypes(undefined, true);
    expect(result).toBe("Open");
  });

  it("should handle both controlledAccess and openAccess as undefined", () => {
    const result = formatAccessTypes(undefined, undefined);
    expect(result).toBe("");
  });

  it("should ignore non-boolean truthy values for controlledAccess and openAccess", () => {
    // @ts-expect-error Testing with non-boolean input
    const result = formatAccessTypes(1, "true");
    expect(result).toBe("");
  });

  it("should handle non-boolean falsy values for controlledAccess and openAccess", () => {
    // @ts-expect-error Testing with non-boolean input
    const result = formatAccessTypes(0, "");
    expect(result).toBe("");
  });
});
