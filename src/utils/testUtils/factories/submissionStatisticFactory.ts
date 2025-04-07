export const baseSubmissionStatistic: SubmissionStatistic = {
  nodeName: "",
  total: 0,
  new: 0,
  passed: 0,
  warning: 0,
  error: 0,
};

/**
 *  Creates a new SubmissionStatistic object with default values, allowing for field overrides
 *
 * @see {@link baseSubmissionStatistic}
 * @param {Partial<SubmissionStatistic>} [overrides={}] - An object containing properties to override the default values
 * @returns {SubmissionStatistic} A new SubmissionStatistic object with default propety values applied as well as any overridden properties
 */
export const createSubmissionStatistic = (
  overrides: Partial<SubmissionStatistic> = {}
): SubmissionStatistic => ({
  ...baseSubmissionStatistic,
  ...overrides,
});
