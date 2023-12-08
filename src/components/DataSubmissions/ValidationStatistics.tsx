import { FC } from 'react';
import { Box, Stack, Typography, styled } from '@mui/material';
import ContentCarousel from '../Carousel';
import PieChart from '../PieChart';
import { buildMiniChartSeries, buildPrimaryChartSeries } from '../../utils/statisticUtils';
import StatisticLegend from './StatisticLegend';

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
  boxShadow: "0px 4px 20px 0px #00000059",
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
  color: "#1D91AB",
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
  color: "#1D91AB",
});

/**
 * The primary chart container with secondary detail charts
 *
 * @param {Props} props
 * @returns {React.FC<Props>}
 */
const DataSubmissionStatistics: FC<Props> = ({ dataSubmission, statistics }: Props) => {
  if (!dataSubmission || !statistics?.some((s) => s.total > 0)) {
    return null;
  }

  return (
    <StyledChartArea direction="row">
      <StyledPrimaryChart>
        <StyledPrimaryTitle variant="h6">Node Totals</StyledPrimaryTitle>
        {/* TODO: migrate this chart to recharts */}
        <PieChart
          label=""
          series={[
            {
              ...buildPrimaryChartSeries(statistics),
              highlightScope: {
                highlighted: "item",
              },
              highlighted: {
                innerRadius: 100
              }
            }
          ]}
          width={391}
          height={391}
          // TODO: Hovering over the chart slice should show the node name and total
          centerCount={100}
          margin={{
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
          }}
          slotProps={{ legend: { hidden: true } }}
          tooltip={{ trigger: 'none' }}
        />
      </StyledPrimaryChart>
      <StyledSecondaryStack direction="column" alignItems="center" flex={1}>
        <StyledSecondaryTitle variant="h6">Node Count Breakdown</StyledSecondaryTitle>
        <ContentCarousel>
          {statistics.map((stat) => (
            <PieChart
              label={stat.nodeName}
              key={stat.nodeName}
              centerCount={stat.total}
              series={[buildMiniChartSeries(stat)]}
              margin={{ right: 5 }}
              width={150}
              height={150}
              slotProps={{ legend: { hidden: true } }}
              tooltip={{ trigger: 'none' }}
              skipAnimation
            />
          ))}
        </ContentCarousel>
        <StatisticLegend />
      </StyledSecondaryStack>
    </StyledChartArea>
  );
};

export default DataSubmissionStatistics;
