const baseAggregatedQCResult: AggregatedQCResult = {
  code: "",
  severity: "Error",
  title: "",
  count: 0,
};

/**
 *  Creates a new AggregatedQCResult object with default values, allowing for field overrides
 *
 * @see {@link baseAggregatedQCResult}
 * @param {Partial<AggregatedQCResult>} [overrides={}] - An object containing properties to override the default values
 * @returns {AggregatedQCResult} A new AggregatedQCResult object with default propety values applied as well as any overridden properties
 */
export const createAggregatedQCResult = (
  overrides: Partial<AggregatedQCResult> = {}
): AggregatedQCResult => ({
  ...baseAggregatedQCResult,
  ...overrides,
});
