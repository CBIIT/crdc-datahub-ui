import { FC } from 'react';
import { Stack, Typography, styled } from '@mui/material';
import LegendItem from './LegendItem';

export type Props = {
  filters: LegendFilter[];
  onClick?: (filter: LegendFilter) => void;
};

const StyledContainer = styled(Stack)({
  borderRadius: "8px",
  background: "#F5F8F9",
  border: "1px solid #939393",
  width: "600px",
  padding: "8px 0",
  marginTop: "20px",
});

const StyledLegendTitle = styled(Typography)({
  fontFamily: "Nunito",
  fontSize: "13px",
  fontWeight: 600,
  color: "#156071",
  marginLeft: "-48px",
  marginRight: "30px",
});

/**
 * A color code legend for the Data Submissions statistics chart(s)
 *
 * @returns {React.FC}
 */
const StatisticLegend: FC<Props> = ({ filters, onClick }) => (
  <StyledContainer direction="row" justifyContent="center" alignItems="center">
    <StyledLegendTitle>Validation Status</StyledLegendTitle>
    {filters.map((filter) => (
      <LegendItem
        key={filter.label}
        color={filter.color}
        label={filter.label}
        disabled={filter.disabled}
        onClick={() => onClick?.(filter)}
      />
    ))}
  </StyledContainer>
);

export default StatisticLegend;
