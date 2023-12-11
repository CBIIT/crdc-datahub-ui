import { FC } from 'react';
import { Box, Typography, styled } from "@mui/material";
import { PieChart, Pie, Label, Cell } from 'recharts';
import PieChartCenter from './PieChartCenter';

export type PieSectorDataItem = {
  label: string;
  value: number;
  color: string;
};

type Props = {
  /**
   * Top label for the chart
   */
  label: string;
  /**
   * Node count to display in the center of the chart
   */
  centerCount: number;
  /**
   * The data to display in the pie chart
   */
  data: PieSectorDataItem[];
};

const StyledPieChartLabel = styled(Typography)({
  color: "#3D4551",
  fontFamily: "'Nunito Sans', 'Rubik', sans-serif",
  fontSize: "20px",
  fontWeight: 600,
  lineHeight: "21px",
  textTransform: "capitalize",
  marginBottom: "12px",
  textAlign: "center",
  alignSelf: "center",
});

const StyledChartContainer = styled(Box)({
  overflow: "visible",
  "& div": {
    margin: "0 auto",
  },
  "& svg *:focus": {
    outline: "none",
  },
});

/**
 * Builds a Pie Chart with a center "Total Count" display
 *
 * @param {string} label Top label for the chart
 * @param {number} centerCount Node count to display in the center of the chart
 * @returns {React.FC<Props>}
 */
const NodeChart: FC<Props> = ({ label, centerCount, data }: Props) => (
  <StyledChartContainer>
    {label && <StyledPieChartLabel>{label}</StyledPieChartLabel>}
    <PieChart width={150} height={150}>
      <Pie
        data={data}
        dataKey="value"
        cx="50%"
        cy="50%"
        labelLine={false}
        outerRadius={75}
        innerRadius={40}
      >
        {data.map(({ label, color }) => (<Cell key={label} fill={color} />))}
        <Label
          position="center"
          content={(<PieChartCenter title="Total" count={centerCount} />)}
        />
      </Pie>
    </PieChart>
  </StyledChartContainer>
);

export default NodeChart;
