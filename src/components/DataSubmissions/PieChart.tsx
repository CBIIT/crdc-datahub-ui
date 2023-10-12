import { Box, Typography, styled } from "@mui/material";
import { PieChartProps } from "@mui/x-charts/PieChart/PieChart";
import { PieChart } from "@mui/x-charts";

const StyledPieChartLabel = styled(Typography)(() => ({
  display: "inline-block",
  color: "#6E888B",
  fontFamily: "'Nunito Sans', 'Rubik', sans-serif",
  fontSize: "18px",
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: "19.174px",
  letterSpacing: "-0.36px",
  textTransform: "capitalize",
  marginBottom: "12px",
  textAlign: "center",
  alignSelf: "center",
}));

const StyledChartContainer = styled(Box)(() => ({
  overflow: "visible",
  "& *": {
    overflow: "visible",
  },
}));

type Props = {
  label: string;
} & PieChartProps;

const CustomPieChart = ({ label, ...rest }: Props) => (
  <StyledChartContainer>
    {label && <StyledPieChartLabel>{label}</StyledPieChartLabel>}
    <PieChart {...rest} />
  </StyledChartContainer>
  );

export default CustomPieChart;
