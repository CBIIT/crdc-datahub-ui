import { FC } from 'react';
import { Box, Stack, Typography, styled } from '@mui/material';
import LegendItem from './LegendItem';

const StyledContainer = styled(Box)({
  borderRadius: "8px",
  background: "#F5F8F9",
  border: "1px solid #939393",
  width: "600px",
  paddingLeft: "18px",
  paddingRight: "18px",
  paddingTop: "3px",
  paddingBottom: "7px",
  marginTop: "20px",
});

const StyledLegendTitle = styled(Typography)({
  color: "#005EA2",
  fontFamily: "'Nunito Sans', 'Rubik', sans-serif",
  fontSize: "14px",
  fontWeight: 600,
  lineHeight: "27px",
});

/**
 * A color code legend for the Data Submissions statistics chart(s)
 *
 * @returns {React.FC}
 */
const StatisticLegend: FC = () => (
  <StyledContainer>
    <StyledLegendTitle>Color Key</StyledLegendTitle>
    <Stack direction="row" justifyItems="center" alignItems="center">
      <LegendItem color="#4D90D3" label="New Counts" />
      <LegendItem color="#32E69A" label="Passed Counts" />
      <LegendItem color="#D65219" label="Failed Counts" />
      <LegendItem color="#FFD700" label="Warning Counts" />
    </Stack>
  </StyledContainer>
);

export default StatisticLegend;
