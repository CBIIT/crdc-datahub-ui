import { FC } from 'react';
import { styled } from "@mui/material";
import { useDrawingArea } from "@mui/x-charts";

const StyledCircle = styled('circle')(({ theme }) => ({
  fill: theme.palette.background.paper,
  stroke: theme.palette.divider,
  strokeWidth: 1,
  filter: "drop-shadow(0px 0px 11px rgba(0, 0, 0, 0.3))",
}));

const StyledTextContainer = styled('text')({
  fill: "#3D4551",
  fontFamily: "'Nunito Sans', 'Rubik', sans-serif",
  textAnchor: 'middle',
  dominantBaseline: 'central',
});

const StyledCenterTitle = styled('tspan')({
  fontSize: 16,
});

const StyledCenterCount = styled('tspan')({
  fontSize: 18,
  fontWeight: 600,
});

type PieChartCenterProps = {
  /**
   * Main text to display in the center of the chart
   */
  title: string;
  /**
   * The count to display in the center of the chart
   *
   * @TODO format this number with commas
   */
  count: number;
  /**
   * The smallest series inner radius to use for the center circle
   */
  innerRadius: number;
};

/**
 * Builds the center circle and text for a Pie Chart
 *
 * Will automatically center itself based on the drawing area
 * and not overlap if the chart has multiple series
 *
 * @param {Props} props
 * @returns {React.FC<PieChartCenterProps>}
 */
const PieChartCenter: FC<PieChartCenterProps> = ({ title, count, innerRadius }: PieChartCenterProps) => {
  const { width, height, left, top } = useDrawingArea();
  const centerX = left + width / 2;
  const centerY = top + height / 2;

  return (
    <g>
      <StyledCircle cx={centerX} cy={centerY} r={innerRadius} />
      <StyledTextContainer x={centerX} y={centerY - 10}>
        <StyledCenterTitle>{title}</StyledCenterTitle>
        <StyledCenterCount x={centerX} dy={20}>
          {count}
        </StyledCenterCount>
      </StyledTextContainer>
    </g>
  );
};

export default PieChartCenter;
