import { PieSectorDataItem } from '../components/NodeTotalChart';

/**
 * Builds the series for the MUI-X Pie Chart for use in Data Submissions
 *
 * @param stat
 * @returns PieChartSeries
 */
export const buildMiniChartSeries = (stat: SubmissionStatistic, omitSeries: string[]) => ([
  { label: 'New', value: stat.new, color: "#4D90D3" },
  { label: 'Passed', value: stat.passed, color: "#32E69A" },
  { label: 'Error', value: stat.error, color: "#D65219" },
  { label: 'Warning', value: stat.warning, color: "#FFC700" },
].filter((series) => !omitSeries.includes(series.label)));

/**
 * Builds the dataset ingested by the primary chart
 *
 * @param stats Data Submissions statistics
 * @returns The series mutated for the primary chart
 */
export const buildPrimaryChartSeries = (stats: SubmissionStatistic[], omitSeries: string[]): PieSectorDataItem[] => {
  const newCount = stats.reduce((acc, stat) => acc + stat.new, 0);
  const passedCount = stats.reduce((acc, stat) => acc + stat.passed, 0);
  const errorCount = stats.reduce((acc, stat) => acc + stat.error, 0);
  const warningCount = stats.reduce((acc, stat) => acc + stat.warning, 0);

  return [
    { label: 'New', value: newCount, color: "#4D90D3" },
    { label: 'Passed', value: passedCount, color: "#32E69A" },
    { label: 'Error', value: errorCount, color: "#D65219" },
    { label: 'Warning', value: warningCount, color: "#FFC700" },
  ].filter((series) => !omitSeries.includes(series.label));
};

/**
 * A utility function to sort the node statistics by the node name
 * This utility is required because the API does not guarantee the order of the nodes,
 * and changing the order of the nodes causes re-animation of the charts.
 *
 * @param stats Data Submissions statistics
 * @returns The sorted statistics
 */
export const compareNodeStats = (a: SubmissionStatistic, b: SubmissionStatistic) => a.nodeName.localeCompare(b.nodeName);
