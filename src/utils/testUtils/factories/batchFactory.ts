export const baseBatch: Batch = {
  _id: "",
  displayID: 0,
  submissionID: "",
  type: "metadata",
  fileCount: 1,
  files: [],
  status: "Uploaded",
  errors: [],
  createdAt: "",
  updatedAt: "",
};

/**
 *  Creates a new Batch object with default values, allowing for field overrides
 *
 * @see {@link baseBatch}
 * @param {Partial<Batch>} [overrides={}] - An object containing properties to override the default values
 * @returns {Batch} A new Batch object with default propety values applied as well as any overridden properties
 */
export const createBatch = (overrides: Partial<Batch> = {}): Batch => ({
  ...baseBatch,
  ...overrides,
});
