import {
  validateTotal,
  validatePage,
  validateRowsPerPage,
  validatePerPageOptions,
  validateSortDirection,
  validateAndSetIfChanged,
  validateOrderBy,
} from "./index";

describe("tableUtils", () => {
  describe("validateTotal", () => {
    it("should return false for NaN values", () => {
      expect(validateTotal(NaN)).toBeFalsy();
    });

    it("should return false for negative values", () => {
      expect(validateTotal(-1)).toBeFalsy();
    });

    it("should return true for non-negative numbers", () => {
      expect(validateTotal(0)).toBeTruthy();
      expect(validateTotal(100)).toBeTruthy();
    });
  });

  describe("validatePage", () => {
    it("should return false if page is NaN", () => {
      expect(validatePage(NaN)).toBeFalsy();
    });

    it("should return false if the page is outside the minrange", () => {
      expect(validatePage(-1)).toBeFalsy();
    });

    it("should return true if the page is over the minrange", () => {
      expect(validatePage(1)).toBeTruthy();
      expect(validatePage(5)).toBeTruthy();
      expect(validatePage(10)).toBeTruthy();
    });
  });

  describe("validateRowsPerPage", () => {
    it("should return false for NaN values", () => {
      expect(validateRowsPerPage(NaN, [10, 20, 30])).toBeFalsy();
    });

    it("should return false if the perPage value is not in the options array", () => {
      expect(validateRowsPerPage(5, [10, 20, 30])).toBeFalsy();
    });

    it("should return true if the perPage value is in the options array", () => {
      expect(validateRowsPerPage(10, [10, 20, 30])).toBeTruthy();
      expect(validateRowsPerPage(20, [10, 20, 30])).toBeTruthy();
    });
  });

  describe("validatePerPageOptions", () => {
    it("should return false if perPageOptions is not an array", () => {
      expect(validatePerPageOptions(undefined)).toBeFalsy();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(validatePerPageOptions({} as any)).toBeFalsy();
    });

    it("should return false if any element in perPageOptions array is NaN", () => {
      expect(validatePerPageOptions([10, NaN, 30])).toBeFalsy();
    });

    it("should return true for a valid array of numbers", () => {
      expect(validatePerPageOptions([10, 20, 30])).toBeTruthy();
    });
  });

  describe("validateSortDirection", () => {
    it('should return true for "asc" and "desc"', () => {
      expect(validateSortDirection("asc")).toBeTruthy();
      expect(validateSortDirection("desc")).toBeTruthy();
    });

    it("should return false for any other values", () => {
      expect(validateSortDirection("ascending")).toBeFalsy();
      expect(validateSortDirection("")).toBeFalsy();
      expect(validateSortDirection("1")).toBeFalsy();
    });
  });

  describe("validateOrderBy", () => {
    it("should return true for null", () => {
      expect(validateOrderBy(null)).toBeTruthy();
    });

    it("should return true for an empty string", () => {
      expect(validateOrderBy("")).toBeTruthy();
    });

    it("should return true for a valid string", () => {
      expect(validateOrderBy("columnName")).toBeTruthy();
    });

    it("should return false for undefined", () => {
      expect(validateOrderBy(undefined)).toBeFalsy();
    });

    it("should return false for numbers", () => {
      expect(validateOrderBy(123 as unknown as string)).toBeFalsy();
    });

    it("should return false for boolean values", () => {
      expect(validateOrderBy(true as unknown as string)).toBeFalsy();
      expect(validateOrderBy(false as unknown as string)).toBeFalsy();
    });

    it("should return false for objects", () => {
      expect(validateOrderBy({} as unknown as string)).toBeFalsy();
    });

    it("should return false for arrays", () => {
      expect(validateOrderBy(["string"] as unknown as string)).toBeFalsy();
    });

    it("should return false for functions", () => {
      expect(validateOrderBy((() => {}) as unknown as string)).toBeFalsy();
    });
  });

  describe("validateAndSetIfChanged", () => {
    const initialState = { count: 0, name: "initial" };

    it("should update the state when the new value is valid and different", () => {
      const newState = validateAndSetIfChanged(initialState, "count", 10, validateTotal);
      expect(newState).toEqual({ ...initialState, count: 10 });
    });

    it("should not update the state when the new value is the same as the current value", () => {
      const newState = validateAndSetIfChanged(initialState, "count", 0, validateTotal);
      expect(newState).toBe(initialState);
    });

    it("should not update the state when the new value fails validation", () => {
      const newState = validateAndSetIfChanged(initialState, "count", -1, validateTotal);
      expect(newState).toBe(initialState);
    });

    it("should update the state when no validation function is provided", () => {
      const newState = validateAndSetIfChanged(initialState, "name", "updated");
      expect(newState).toEqual({ ...initialState, name: "updated" });
    });

    it("should not update the state when the new value is the same and no validation function is provided", () => {
      const newState = validateAndSetIfChanged(initialState, "name", "initial");
      expect(newState).toBe(initialState);
    });

    it("should update the state when the validation function is optional and the value is valid", () => {
      const optionalValidator = (value: number) => value >= 0;
      const newState = validateAndSetIfChanged(initialState, "count", 5, optionalValidator);
      expect(newState).toEqual({ ...initialState, count: 5 });
    });

    it("should not update the state when the optional validation function returns false", () => {
      const optionalValidator = (value: number) => value < 0;
      const newState = validateAndSetIfChanged(initialState, "count", 5, optionalValidator);
      expect(newState).toBe(initialState);
    });
  });
});
