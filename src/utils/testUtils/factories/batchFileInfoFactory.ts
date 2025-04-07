export const baseBatchFileInfo: BatchFileInfo = {
  filePrefix: "",
  fileName: "",
  nodeType: "",
  status: "New",
  errors: [],
  createdAt: "",
  updatedAt: "",
};

/**
 *  Creates a new BatchFileInfo object with default values, allowing for field overrides
 *
 * @see {@link baseBatchFileInfo}
 * @param {Partial<BatchFileInfo>} [overrides={}] - An object containing properties to override the default values
 * @returns {BatchFileInfo} A new BatchFileInfo object with default propety values applied as well as any overridden properties
 */
export const createBatchFileInfo = (overrides: Partial<BatchFileInfo> = {}): BatchFileInfo => ({
  ...baseBatchFileInfo,
  ...overrides,
});
