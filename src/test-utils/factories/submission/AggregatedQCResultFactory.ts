import { Factory } from "../Factory";

/**
 * Base AggregatedQCResult object
 */
export const baseAggregatedQCResult: AggregatedQCResult = {
  code: "",
  severity: "Error",
  title: "",
  count: 0,
};

/**
 * AggregatedQCResult factory for creating AggregatedQCResult instances
 */
export const aggregatedQCResultFactory = new Factory<AggregatedQCResult>((overrides) => ({
  ...baseAggregatedQCResult,
  ...overrides,
}));
