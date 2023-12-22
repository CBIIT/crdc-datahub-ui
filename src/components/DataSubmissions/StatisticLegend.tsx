import { FC } from 'react';
import { Stack, styled } from '@mui/material';
import LegendItem from './LegendItem';

const StyledContainer = styled(Stack)({
  borderRadius: "8px",
  background: "#F5F8F9",
  border: "1px solid #939393",
  width: "600px",
  padding: "8px 0",
  marginTop: "20px",
});

/**
 * A color code legend for the Data Submissions statistics chart(s)
 *
 * @returns {React.FC}
 */
const StatisticLegend: FC = () => (
  <StyledContainer direction="row" justifyContent="center" alignItems="center">
    <LegendItem color="#4D90D3" label="New" />
    <LegendItem color="#32E69A" label="Passed" />
    <LegendItem color="#D65219" label="Failed" />
    <LegendItem color="#FFD700" label="Warning" />
  </StyledContainer>
);

export default StatisticLegend;
