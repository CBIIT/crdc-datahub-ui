import { PieSectorDataItem } from '../components/NodeTotalChart';

/**
 * Builds the series for the MUI-X Pie Chart for use in Data Submissions
 *
 * @param stat
 * @returns PieChartSeries
 */
export const buildMiniChartSeries = (stat: SubmissionStatistic) => ({
  innerRadius: 40,
  outerRadius: 75,
  data: [
    { label: 'New', value: stat.new, color: "#4D90D3" },
    { label: 'Passed', value: stat.passed, color: "#32E69A" },
    { label: 'Error', value: stat.error, color: "#D65219" },
    { label: 'Warning', value: stat.warning, color: "#FFC700" },
  ]
});

/**
 * Builds the dataset ingested by the primary chart
 *
 * @param stats Data Submissions statistics
 * @returns The series mutated for the primary chart
 */
export const buildPrimaryChartSeries = (stats: SubmissionStatistic[]): PieSectorDataItem[] => {
  const newCount = stats.reduce((acc, stat) => acc + stat.new, 0);
  const passedCount = stats.reduce((acc, stat) => acc + stat.passed, 0);
  const errorCount = stats.reduce((acc, stat) => acc + stat.error, 0);
  const warningCount = stats.reduce((acc, stat) => acc + stat.warning, 0);

  return [
    { label: 'New', value: newCount, color: "#4D90D3" },
    { label: 'Passed', value: passedCount, color: "#32E69A" },
    { label: 'Error', value: errorCount, color: "#D65219" },
    { label: 'Warning', value: warningCount, color: "#FFC700" },
  ];
};
