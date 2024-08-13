import { FC, useCallback, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Box, styled } from "@mui/material";
import BarTooltip from "./BarTooltip";
import LabelToolTip from "./LabelTooltip";
import CustomTick from "./CustomTick";
import ActiveBar from "./ActiveBar";
import { calculateMaxDomain, calculateTextWidth, formatTick } from "../../utils";

type Props = {
  /**
   * The data to display in the pie chart
   */
  data: BarChartDataset[];
  /**
   * If true, the data bars will be normalized to 100%
   */
  normalize?: boolean;
};

const StyledChartContainer = styled(Box)({
  overflow: "visible",
  width: "482px",
  height: "246px",
});

/**
 * Builds a summary of node states (passed, new, ...) chart for the node statistics
 *
 * @param {Props} props
 * @returns {React.FC<Props>}
 */
const NodeTotalChart: FC<Props> = ({ data, normalize = true }) => {
  const [tooltipData, setTooltipData] = useState<{ label: string; x: number; y: number } | null>(
    null
  );

  const computedBarWidth = useMemo<number>(
    () => (482 - 8 * data.length) / data.length,
    [data.length]
  );

  const shouldRotateLabels = useMemo<boolean>(
    () =>
      data?.some(({ label }) => calculateTextWidth(label, "400 11px Roboto") > computedBarWidth),
    [data, computedBarWidth]
  );

  const handleLabelEnter = useCallback(
    (e) => {
      if (!shouldRotateLabels) {
        return;
      }

      setTooltipData({ ...e, y: e.y + 30 });
    },
    [shouldRotateLabels]
  );

  const handleLabelLeave = useCallback(() => {
    setTooltipData(null);
  }, []);

  return (
    <StyledChartContainer>
      <ResponsiveContainer height="100%" width="100%">
        <BarChart
          layout="horizontal"
          data={data}
          stackOffset={normalize ? "expand" : "none"}
          maxBarSize={53}
          barCategoryGap="8px"
          barGap="8px"
          aria-label="Node Total background"
          // @ts-ignore - `overflow` is not in the type definition for BarChart
          overflow="visible"
        >
          <CartesianGrid stroke="#E1E1E1" strokeWidth="0.6px" vertical={false} />
          <Tooltip content={<BarTooltip normalized={normalize} />} cursor={false} />
          <YAxis
            type="number"
            axisLine={false}
            tickFormatter={(tick) => formatTick(tick, normalize)}
            domain={normalize ? [0, "dataMax"] : [0, calculateMaxDomain]}
            interval={0}
            tickMargin={4}
          />
          <XAxis
            type="category"
            dataKey="label"
            axisLine={false}
            tickLine={false}
            // eslint-disable-next-line react/no-unstable-nested-components
            tick={(p) => (
              <CustomTick
                {...p}
                angled={shouldRotateLabels}
                handleMouseEnter={handleLabelEnter}
                handleMouseLeave={handleLabelLeave}
              />
            )}
            interval={0}
            allowDataOverflow
            allowDuplicatedCategory
          />
          <Bar dataKey="New" fill="#4D90D3" stackId="primary" activeBar={ActiveBar} />
          <Bar dataKey="Passed" fill="#32E69A" stackId="primary" activeBar={ActiveBar} />
          <Bar dataKey="Error" fill="#D65219" stackId="primary" activeBar={ActiveBar} />
          <Bar dataKey="Warning" fill="#FFC700" stackId="primary" activeBar={ActiveBar} />
        </BarChart>
      </ResponsiveContainer>
      {tooltipData && (
        <Tooltip
          content={<LabelToolTip />}
          label={tooltipData.label}
          wrapperStyle={{
            visibility: "visible",
            transform: `translate(${tooltipData.x}px, ${tooltipData.y}px)`,
          }}
          active
        />
      )}
    </StyledChartContainer>
  );
};

export default NodeTotalChart;
