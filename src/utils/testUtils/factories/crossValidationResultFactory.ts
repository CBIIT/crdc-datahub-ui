export const baseCrossValidationResult: CrossValidationResult = {
  submissionID: "",
  type: "",
  validationType: "metadata",
  batchID: "",
  displayID: 0,
  submittedID: "",
  severity: "Error",
  uploadedDate: "",
  validatedDate: "",
  conflictingSubmission: "",
  errors: [],
  warnings: [],
};

/**
 *  Creates a new CrossValidationResult object with default values, allowing for field overrides
 *
 * @see {@link baseCrossValidationResult}
 * @param {Partial<CrossValidationResult>} [overrides={}] - An object containing properties to override the default values
 * @returns {CrossValidationResult} A new CrossValidationResult object with default propety values applied as well as any overridden properties
 */
export const createCrossValidationResult = (
  overrides: Partial<CrossValidationResult> = {}
): CrossValidationResult => ({
  ...baseCrossValidationResult,
  ...overrides,
});
