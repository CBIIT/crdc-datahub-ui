/**
 * Builds the series for the MUI-X Pie Chart for use in Data Submissions
 *
 * @param stat
 * @returns PieChartSeries
 */
export const buildMiniChartSeries = (stat: SubmissionStatistic, omitSeries: SeriesLabel[]): PieSectorDataItem[] => {
  const series = [
    { label: 'New', value: stat.new, color: "#4D90D3" },
    { label: 'Passed', value: stat.passed, color: "#32E69A" },
    { label: 'Error', value: stat.error, color: "#D65219" },
    { label: 'Warning', value: stat.warning, color: "#FFC700" },
  ].filter(({ label }) => !omitSeries.includes(label as SeriesLabel));

  return series as PieSectorDataItem[];
};

/**
 * Builds the dataset ingested by the primary chart
 *
 * @param stats Data Submissions statistics
 * @returns The series mutated for the primary chart
 */
export const buildPrimaryChartSeries = (stats: SubmissionStatistic[], omitSeries: SeriesLabel[]): BarChartDataset[] => [...stats]
  .map((stat) => ({
    label: stat.nodeName,
    New: omitSeries.includes("New") ? 0 : stat.new,
    Passed: omitSeries.includes("Passed") ? 0 : stat.passed,
    Error: omitSeries.includes("Error") ? 0 : stat.error,
    Warning: omitSeries.includes("Warning") ? 0 : stat.warning,
  }));

/**
 * A utility function to sort the node statistics by the node name
 * This utility is required because the API does not guarantee the order of the nodes,
 * and changing the order of the nodes causes re-animation of the charts.
 *
 * @param stats Data Submissions statistics
 * @returns The sorted statistics
 */
export const compareNodeStats = (a: SubmissionStatistic, b: SubmissionStatistic) => a.nodeName.localeCompare(b.nodeName);

/**
 * Format a Y-Axis tick label
 *
 * @param tick The tick value
 * @param normalized Whether the tick is normalized
 * @returns The formatted tick label
 */
export const formatTick = (tick: number, normalized = false) => (normalized
  ? `${tick * 100}%`
  : (new Intl.NumberFormat("en-US", { style: "decimal", minimumFractionDigits: 0 })).format(tick)
);
