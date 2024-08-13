/**
 * Builds the series for the MUI-X Pie Chart for use in Data Submissions
 *
 * @param stat
 * @returns PieChartSeries
 */
export const buildMiniChartSeries = (
  stat: SubmissionStatistic,
  omitSeries: SeriesLabel[]
): PieSectorDataItem[] => {
  const series = [
    { label: "New", value: stat.new, color: "#4D90D3" },
    { label: "Passed", value: stat.passed, color: "#32E69A" },
    { label: "Error", value: stat.error, color: "#D65219" },
    { label: "Warning", value: stat.warning, color: "#FFC700" },
  ].filter(({ label }) => !omitSeries.includes(label as SeriesLabel));

  return series as PieSectorDataItem[];
};

/**
 * Builds the dataset ingested by the primary chart
 *
 * @param stats Data Submissions statistics
 * @returns The series mutated for the primary chart
 */
export const buildPrimaryChartSeries = (
  stats: SubmissionStatistic[],
  omitSeries: SeriesLabel[]
): BarChartDataset[] =>
  [...stats].map((stat) => ({
    label: stat.nodeName,
    New: omitSeries.includes("New") ? 0 : stat.new,
    Passed: omitSeries.includes("Passed") ? 0 : stat.passed,
    Error: omitSeries.includes("Error") ? 0 : stat.error,
    Warning: omitSeries.includes("Warning") ? 0 : stat.warning,
  }));

/**
 * A utility function to sort the node statistics in ascending order by:
 *
 * - SubmissionStatistic.total (primary)
 * - SubmissionStatistic.nodeName (secondary)
 *
 * This utility is required because the API does not guarantee the order of the nodes,
 * and changing the order of the nodes causes re-animation of the charts.
 *
 * @param a The first SubmissionStatistic
 * @param b The second SubmissionStatistic
 * @returns The comparison result
 */
export const compareNodeStats = (a: SubmissionStatistic, b: SubmissionStatistic): number => {
  if (a.total === b.total) {
    return a.nodeName.localeCompare(b.nodeName);
  }

  return a.total - b.total;
};

/**
 * Format a Y-Axis tick label
 *
 * @param tick The tick value
 * @param normalized Whether the tick is normalized
 * @returns The formatted tick label
 */
export const formatTick = (tick: number, normalized = false) =>
  normalized
    ? `${tick * 100}%`
    : new Intl.NumberFormat("en-US", {
        style: "decimal",
        minimumFractionDigits: 0,
      }).format(tick);

/**
 * Determine the maximum positive domain for the Y-Axis
 *
 * - If the dataMax is greater than 1000, the domain will be the next multiple of 1000
 * - If the dataMax is greater than 100, the domain will be the next multiple of 100
 * - If the dataMax is less than 100, the domain will be the next multiple of 10
 *
 * @param dataMax The maximum value in the dataset
 * @returns The calculated maximum domain
 */
export const calculateMaxDomain = (dataMax: number): number => {
  if (dataMax <= 0 || Number.isNaN(dataMax) || !Number.isFinite(dataMax)) {
    return 1;
  }
  if (dataMax > 1000) {
    return Math.ceil(dataMax / 1000) * 1000;
  }
  if (dataMax > 100) {
    return Math.ceil(dataMax / 100) * 100;
  }

  return Math.ceil(dataMax / 10) * 10;
};

/**
 * A utility function to compute the approximate width of a text element
 * rendered on an SVG canvas.
 *
 * @param text The text to measure
 * @param fontSize The font size of the text element
 * @param fontFamily The font family of the text element
 * @returns The computed width of the text element or 0 if the width is not available
 */
export const calculateTextWidth = (
  text: string,
  fontSize = "12px",
  fontFamily = "Arial"
): number => {
  if (typeof text !== "string" || text.length === 0) {
    return 0;
  }

  try {
    const svgCanvas = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const textNode = document.createElementNS("http://www.w3.org/2000/svg", "text");

    svgCanvas.setAttribute("display", "hidden");
    textNode.setAttribute("x", "0");
    textNode.setAttribute("y", "0");
    textNode.setAttribute("font-size", fontSize);
    textNode.setAttribute("font-family", fontFamily);
    textNode.textContent = text;

    svgCanvas.appendChild(textNode);
    document.body.appendChild(svgCanvas);
    const { width } = textNode.getBBox();
    document.body.removeChild(svgCanvas);

    return width || 0;
  } catch (e) {
    return 0;
  }
};
