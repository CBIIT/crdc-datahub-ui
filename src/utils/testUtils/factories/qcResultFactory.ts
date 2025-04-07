export const baseQCResult: QCResult = {
  submissionID: "",
  type: "",
  validationType: "metadata",
  batchID: "",
  displayID: 0,
  submittedID: "",
  severity: "Error",
  uploadedDate: "",
  validatedDate: "",
  errors: [],
  warnings: [],
};

/**
 *  Creates a new QCResult object with default values, allowing for field overrides
 *
 * @see {@link baseQCResult}
 * @param {Partial<QCResult>} [overrides={}] - An object containing properties to override the default values
 * @returns {QCResult} A new QCResult object with default propety values applied as well as any overridden properties
 */
export const createQCResult = (overrides: Partial<QCResult> = {}): QCResult => ({
  ...baseQCResult,
  ...overrides,
});
