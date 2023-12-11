import { FC } from 'react';
import { styled } from "@mui/material";

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
   */
  count: number;
  viewBox?: {
    cx: number;
    cy: number;
  };
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
const PieChartCenter: FC<PieChartCenterProps> = ({ title, count, viewBox }: PieChartCenterProps) => {
  const { cx, cy } = viewBox;

  return (
    <g>
      <StyledCircle cx={cx} cy={cy} r={40} />
      <StyledTextContainer x={cx} y={cy - 10}>
        <StyledCenterTitle>{title}</StyledCenterTitle>
        <StyledCenterCount x={cx} dy={20}>
          {count}
        </StyledCenterCount>
      </StyledTextContainer>
    </g>
  );
};

export default PieChartCenter;