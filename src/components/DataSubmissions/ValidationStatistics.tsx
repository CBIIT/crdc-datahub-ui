import React, { FC, useState } from 'react';
import { isEqual } from 'lodash';
import { Box, Stack, Typography, styled } from '@mui/material';
import ContentCarousel from '../Carousel';
import NodeTotalChart from '../NodeTotalChart';
import MiniPieChart from '../NodeChart';
import { buildMiniChartSeries, buildPrimaryChartSeries, compareNodeStats } from '../../utils/statisticUtils';
import StatisticLegend, { LegendFilter } from './StatisticLegend';

type Props = {
  dataSubmission: Submission;
  statistics: SubmissionStatistic[];
};

const StyledChartArea = styled(Stack)({
  height: "385px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  overflow: "visible",
  background: "#FFFFFF",
  width: "100%",
  position: "relative",
  "& > *": {
    zIndex: 10
  },
  "&::after": {
    position: "absolute",
    content: '""',
    height: "100%",
    background: "#FFFFFF",
    left: "-100%",
    right: "-100%",
    top: "0",
    bottom: "0",
    boxShadow: "0px 4px 20px 0px #00000059",
    zIndex: 1,
  },
});

const StyledPrimaryChart = styled(Box)({
  margin: "0 90px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  "& > *": {
    zIndex: 10
  },
  // Add top curve to chart area
  "&::before": {
    position: "absolute",
    content: '""',
    width: "calc(100% + 20px)",
    height: "calc(100% + 20px)",
    background: "#FFFFFF",
    zIndex: 1,
    left: "-10px",
    right: "-10px",
    top: "-10px",
    bottom: "-10px",
    borderRadius: "50%",
    boxShadow: "0px 4px 20px 0px #00000059",
  },
  // Remove overlapping box shadow from sides of chart area
  "&::after": {
    position: "absolute",
    content: '""',
    background: "#FFFFFF",
    zIndex: 1,
    left: "-30px",
    right: "-30px",
    top: "3px",
    bottom: "3px",
  },
});

const StyledPrimaryTitle = styled(Typography)({
  position: "absolute",
  top: "28px",
  left: "-48px",
  fontSize: "13px",
  fontWeight: 600,
  textTransform: "uppercase",
  color: "#187A90",
});

const StyledSecondaryStack = styled(Stack)({
  position: "relative",
  height: "100%",
});

const StyledSecondaryTitle = styled(Typography)({
  marginTop: "25px",
  marginBottom: "23px",
  fontSize: "13px",
  fontWeight: 600,
  textTransform: "uppercase",
  color: "#187A90",
});

const StyledNoData = styled(Typography)({
  fontSize: "13px",
  fontWeight: 600,
  textTransform: "uppercase",
  color: "#083A50",
});

const defaultFilters: LegendFilter[] = [
  { label: "New", color: "#4D90D3", disabled: false },
  { label: "Passed", color: "#32E69A", disabled: false },
  { label: "Error", color: "#D65219", disabled: false },
  { label: "Warning", color: "#FFD700", disabled: false },
];

/**
 * The primary chart container with secondary detail charts
 *
 * @param {Props} props
 * @returns {React.FC<Props>}
 */
const DataSubmissionStatistics: FC<Props> = ({ dataSubmission, statistics }: Props) => {
  const [filters, setFilters] = useState<LegendFilter[]>(defaultFilters);
  const disabledSeries: string[] = filters.filter((f) => f.disabled).map((f) => f.label);

  const handleFilterChange = (filter: LegendFilter) => {
    const newFilters = filters.map((f) => {
      if (f.label === filter.label) { return { ...f, disabled: !f.disabled }; }
      return f;
    });

    // If all filters are disabled, do not allow disabling the last one
    if (newFilters.every((f) => f.disabled)) {
      return;
    }

    setFilters(newFilters);
  };

  // If there is no data submission or no items uploaded, do not render
  // NOTE: This does not conform to CRDCDH-538 requirements currently
  if (!dataSubmission || !statistics?.some((s) => s.total > 0)) {
    return (
      <StyledChartArea direction="row">
        <StyledNoData variant="h6">New Data Submission. No data has been uploaded yet.</StyledNoData>
      </StyledChartArea>
    );
  }

  return (
    <StyledChartArea direction="row">
      <StyledPrimaryChart>
        <StyledPrimaryTitle variant="h6">Summary</StyledPrimaryTitle>
        <NodeTotalChart data={buildPrimaryChartSeries(statistics, disabledSeries)} />
      </StyledPrimaryChart>
      <StyledSecondaryStack direction="column" alignItems="center" flex={1}>
        <StyledSecondaryTitle variant="h6">
          Individual Node Types
          {" "}
          {`(${statistics.length})`}
        </StyledSecondaryTitle>
        <ContentCarousel focusOnSelect={statistics.length > 2}>
          {statistics?.sort(compareNodeStats).map((stat) => (
            <MiniPieChart
              key={stat.nodeName}
              label={stat.nodeName}
              centerCount={stat.total}
              data={buildMiniChartSeries(stat, disabledSeries)}
            />
          ))}
        </ContentCarousel>
        <StatisticLegend filters={filters} onClick={handleFilterChange} />
      </StyledSecondaryStack>
    </StyledChartArea>
  );
};

export default React.memo<Props>(DataSubmissionStatistics, (prevProps, nextProps) => isEqual(prevProps, nextProps));
