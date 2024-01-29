import { styled } from '@mui/material';
import { FC } from 'react';

const StyledTextContainer = styled('text')({
  fill: "#165D74",
  fontFamily: "'Nunito Sans', 'Rubik', sans-serif",
  textAnchor: 'middle',
  dominantBaseline: 'central',
});

const StyledCenterTitle = styled('tspan')({
  fontSize: 26,
  fontWeight: 600,
});

const StyledCenterValue = styled('tspan')({
  fontSize: 32,
  fontWeight: 800,
});

type Props = {
  viewBox?: {
    cx: number;
    cy: number;
  };
  title: string | number;
  value: string | number;
};

/**
 * Builds the center of the pie chart with the title, subtitle, and value.
 *
 * @param {Props} props
 * @returns {React.FC<Props>}
 */
const PieChartCenter: FC<Props> = ({ viewBox: { cx, cy }, title, value }) => (
  <g>
    <StyledTextContainer x={cx} y={cy - 25}>
      <StyledCenterTitle>{title}</StyledCenterTitle>
      <StyledCenterValue x={cx} dy={35}>
        {value}
      </StyledCenterValue>
    </StyledTextContainer>
  </g>
);

export default PieChartCenter;
