import React, { FC, useState } from 'react';
import { isEqual } from 'lodash';
import { Stack, Tab, Tabs, Typography, styled } from '@mui/material';
import ContentCarousel from '../Carousel';
import NodeTotalChart from '../NodeTotalChart';
import MiniPieChart from '../NodeChart';
import SuspenseLoader from '../SuspenseLoader';
import { buildMiniChartSeries, buildPrimaryChartSeries, compareNodeStats } from '../../utils';
import StatisticLegend from './StatisticLegend';

type Props = {
  dataSubmission: Submission;
  statistics: SubmissionStatistic[];
};

const StyledChartArea = styled(Stack)({
  height: "422px",
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

const StyledSectionTitle = styled(Typography)({
  marginTop: "5px",
  marginBottom: "23px",
  fontSize: "13px",
  fontWeight: 600,
  textTransform: "uppercase",
  color: "#187A90",
});

const StyledNoData = styled(Typography)({
  fontSize: "16px",
  fontWeight: 400,
  fontFamily: "Nunito",
  color: "#083A50",
  userSelect: "none",
});

const StyledTab = styled(Tab)({
  color: "#156071",
  opacity: 0.6,
  textTransform: "none",
  fontSize: "13px",
  fontWeight: 600,
  fontFamily: "Nunito",
  paddingBottom: "0px",
  paddingLeft: "0px",
  paddingRight: "0px",
  minWidth: "auto",
  marginRight: "10px",
  marginLeft: "10px",
  "&.Mui-selected": {
    color: "#156071",
    opacity: 1,
  },
  "&.MuiTab-root": {
    minWidth: "auto",
  },
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
  const [tabValue, setTabValue] = useState<"count" | "percentage">("count");
  const disabledSeries: SeriesLabel[] = filters.filter((f) => f.disabled).map((f) => f.label);

  const handleFilterChange = (filter: LegendFilter) => {
    const newFilters = filters.map((f) => {
      if (f.label === filter.label) { return { ...f, disabled: !f.disabled }; }
      return f;
    });

    setFilters(newFilters);
  };

  const handleViewByChange = (_: React.SyntheticEvent, newValue: "count" | "percentage") => setTabValue(newValue);

  if (!dataSubmission || !statistics) {
    return (
      <StyledChartArea direction="row">
        <SuspenseLoader fullscreen={false} />
      </StyledChartArea>
    );
  }

  if (!statistics?.some((s) => s.total > 0)) {
    return (
      <StyledChartArea direction="row">
        <StyledNoData variant="h6">No data has been successfully uploaded at this time.</StyledNoData>
      </StyledChartArea>
    );
  }

  return (
    <StyledChartArea direction="row">
      <Stack direction="column" alignItems="center" flex={1}>
        <StyledSectionTitle variant="h6">Summary Total</StyledSectionTitle>
        <NodeTotalChart data={buildPrimaryChartSeries(statistics, disabledSeries)} normalize={tabValue === "percentage"} />
        <Tabs value={tabValue} onChange={handleViewByChange} aria-label="View chart by" centered>
          <StyledTab label="View By Count" value="count" />
          <StyledTab label="View By Percentage" value="percentage" />
        </Tabs>
      </Stack>
      <Stack direction="column" alignItems="center" flex={1} height={344}>
        <StyledSectionTitle variant="h6">
          Individual Node Types
          {" "}
          {`(${statistics.length})`}
        </StyledSectionTitle>
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
      </Stack>
    </StyledChartArea>
  );
};

export default React.memo<Props>(DataSubmissionStatistics, (prevProps, nextProps) => isEqual(prevProps, nextProps));
