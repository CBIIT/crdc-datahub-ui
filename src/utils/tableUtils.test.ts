import {
  validateTotal,
  validatePage,
  validateRowsPerPage,
  validatePerPageOptions,
  validateSortDirection,
  updateIfValidAndChanged,
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

  describe("updateIfValidAndChanged", () => {
    const initialState: Partial<TableState<unknown>> = {
      total: 100,
      page: 1,
      perPage: 10,
      perPageOptions: [10, 20, 30],
      sortDirection: "asc",
    };

    it("should update total if valid and different", () => {
      const updates = {};
      const newState = updateIfValidAndChanged("total", 150, validateTotal, initialState, updates);
      expect(newState.total).toBe(150);
    });

    it("should not update total if not valid", () => {
      const updates = {};
      const newState = updateIfValidAndChanged("total", -10, validateTotal, initialState, updates);
      expect(newState).toEqual(initialState);
    });

    it("should not update total if same value", () => {
      const updates = {};
      const newState = updateIfValidAndChanged("total", 100, validateTotal, initialState, updates);
      expect(newState).toEqual(initialState);
    });

    it("should update perPage if valid and in perPageOptions", () => {
      const updates = {};
      const newState = updateIfValidAndChanged(
        "perPage",
        20,
        (perPage) => validateRowsPerPage(perPage, initialState.perPageOptions),
        initialState,
        updates
      );
      expect(newState.perPage).toBe(20);
    });

    it("should not update perPage if not in perPageOptions", () => {
      const updates = {};
      const newState = updateIfValidAndChanged(
        "perPage",
        5,
        (perPage) => validateRowsPerPage(perPage, initialState.perPageOptions),
        initialState,
        updates
      );
      expect(newState).toEqual(initialState);
    });

    it("should not update perPage if same value", () => {
      const updates = {};
      const newState = updateIfValidAndChanged(
        "perPage",
        10,
        (perPage) => validateRowsPerPage(perPage, initialState.perPageOptions),
        initialState,
        updates
      );
      expect(newState).toEqual(initialState);
    });

    it("should update sortDirection if valid", () => {
      const updates = {};
      const newState = updateIfValidAndChanged(
        "sortDirection",
        "desc",
        validateSortDirection,
        initialState,
        updates
      );
      expect(newState.sortDirection).toBe("desc");
    });

    it("should not update sortDirection if invalid", () => {
      const updates = {};
      const newState = updateIfValidAndChanged(
        "sortDirection",
        "upward" as Order,
        validateSortDirection,
        initialState,
        updates
      );
      expect(newState).toEqual(initialState);
    });

    it("should not update sortDirection if same value", () => {
      const updates = {};
      const newState = updateIfValidAndChanged(
        "sortDirection",
        "asc",
        validateSortDirection,
        initialState,
        updates
      );
      expect(newState).toEqual(initialState);
    });
  });
});
