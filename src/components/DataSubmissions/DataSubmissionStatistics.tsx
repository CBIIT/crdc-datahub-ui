import { FC } from 'react';
import { Box, Stack, styled } from '@mui/material';
import ContentCarousel from '../Carousel';
import PieChart from '../PieChart';

const dummyChartData = [
  { label: 'Group A', value: 12, color: "#DFC798" },
  { label: 'Group B', value: 28, color: "#137E87" },
  { label: 'Group C', value: 30, color: "#99A4E4" },
  { label: 'Group D', value: 30, color: "#CB2809" },
];

const dummyChartSeries = [
  {
    innerRadius: 40,
    outerRadius: 75,
    data: dummyChartData,
  },
];

type Props = {
  dataSubmission: Submission;
  statistics: SubmissionStatistic[];
};

const StyledPrimaryChart = styled(Box)({
  margin: "0 90px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
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

const StyledFakeChart = styled(Box)({
  width: "391px",
  height: "391px",
  background: "red",
  borderRadius: "50%",
  zIndex: 10,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

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

const DataSubmissionStatistics: FC<Props> = ({ dataSubmission, statistics }: Props) => {
  // eslint-disable-next-line no-console
  console.log("DataSubmissionStatistics", dataSubmission, statistics);

  // TODO: Also check if statistics are available. disabled because they aren't yet...
  if (!dataSubmission) {
    return null;
  }

  return (
    <StyledChartArea direction="row">
      <StyledPrimaryChart>
        <StyledFakeChart>
          TODO: Replace with actual chart
        </StyledFakeChart>
      </StyledPrimaryChart>
      <ContentCarousel>
        {/* TODO: Build dynamically */}
        {Array.from({ length: 5 }, (_, i) => (
          <PieChart
            label={`Study ${i + 1}`}
            key={i}
            centerCount={25 + i * 9}
            series={dummyChartSeries}
            margin={{ right: 5 }}
            width={150}
            height={150}
            slotProps={{ legend: { hidden: true } }}
            tooltip={{ trigger: 'none' }}
          />
        ))}
      </ContentCarousel>

      {/* TODO: Add legend if in final design */}
    </StyledChartArea>
  );
};

export default DataSubmissionStatistics;
