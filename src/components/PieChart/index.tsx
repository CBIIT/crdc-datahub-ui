import { FC } from 'react';
import { Box, Typography, styled } from "@mui/material";
import { PieChartProps } from "@mui/x-charts/PieChart/PieChart";
import { PieChart } from "@mui/x-charts";
import PieChartCenter from './PieChartCenter';

type Props = {
  /**
   * Top label for the chart
   */
  label: string;
  /**
   * Node count to display in the center of the chart
   */
  centerCount?: number;
} & PieChartProps;

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
});

/**
 * Builds a Pie Chart with an optional center "Total Count" display
 *
 * @param {string} label Top label for the chart
 * @param {number} centerCount Node count to display in the center of the chart
 * @returns {React.FC<Props>}
 */
const CustomPieChart: FC<Props> = ({ label, centerCount, ...rest }: Props) => {
  const seriesDimensions = rest.series.map((s) => s.innerRadius);
  const smallestInnerRadius = Math.min(...seriesDimensions) || 40;

  return (
    <StyledChartContainer>
      {label && <StyledPieChartLabel>{label}</StyledPieChartLabel>}
      <PieChart {...rest}>
        {centerCount && <PieChartCenter title="Total" count={centerCount} innerRadius={smallestInnerRadius} />}
      </PieChart>
    </StyledChartContainer>
  );
};

export default CustomPieChart;
