import { FC } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Box, styled } from "@mui/material";
import NodeTooltip from "./Tooltip";
import { formatTick } from '../../utils';

type Props = {
  /**
   * The data to display in the pie chart
   */
  data: BarChartDataItem[];
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
const NodeTotalChart: FC<Props> = ({ data, normalize = true }) => (
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
      >
        <CartesianGrid stroke="#E1E1E1" strokeWidth="0.6px" vertical={false} />
        <Tooltip content={<NodeTooltip normalized={normalize} />} cursor={{ fill: "transparent" }} />
        {/* TODO: Need Reqs. for the Y Axis domain and interval */}
        <YAxis
          type="number"
          axisLine={false}
          tickFormatter={(tick) => formatTick(tick, normalize)}
          domain={normalize ? [0, "dataMax"] : [0, "dataMax + 100"]}
        />
        <XAxis
          type="category"
          dataKey="label"
          stroke="#474747"
          fontSize="11"
          fontWeight={400}
          fontFamily="Roboto"
          textAnchor="center"
          axisLine={false}
          tickLine={false}
          interval={0}
          style={{ textAnchor: "middle", textTransform: "capitalize" }}
          tickFormatter={(tick) => tick.replace(/_/g, " ")}
          allowDataOverflow
          allowDuplicatedCategory
        />
        <Bar dataKey="New" fill="#4D90D3" stackId="primary" />
        <Bar dataKey="Passed" fill="#32E69A" stackId="primary" />
        <Bar dataKey="Error" fill="#D65219" stackId="primary" />
        <Bar dataKey="Warning" fill="#FFC700" stackId="primary" />
      </BarChart>
    </ResponsiveContainer>
  </StyledChartContainer>
);

export default NodeTotalChart;
