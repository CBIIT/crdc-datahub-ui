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
});

const StyledCenterSubtitle = styled('tspan')({
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
  subtitle: string | number;
  value: string | number;
};

/**
 * Builds the center of the pie chart with the title, subtitle, and value.
 *
 * Will not render if the subtitle or value are not provided.
 *
 * @param {Props} props
 * @returns {React.FC<Props>}
 */
const PieChartCenter: FC<Props> = ({ viewBox, title, subtitle, value }) => {
  const { cx, cy } = viewBox;

  if (!subtitle || !value) {
    return null;
  }

  return (
    <g>
      <StyledTextContainer x={cx} y={cy - 40}>
        <StyledCenterTitle>{title}</StyledCenterTitle>
        <StyledCenterSubtitle x={cx} dy={35}>
          {subtitle}
        </StyledCenterSubtitle>
        <StyledCenterValue x={cx} dy={35}>
          {value}
        </StyledCenterValue>
      </StyledTextContainer>
    </g>
  );
};

export default PieChartCenter;
