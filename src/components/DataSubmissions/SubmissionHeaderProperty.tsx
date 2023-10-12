import { Grid, Stack, Typography, styled } from "@mui/material";
import { FC } from "react";

const StyledLabel = styled(Typography)(() => ({
  color: "#000000",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "13px",
  fontStyle: "normal",
  fontWeight: 700,
  lineHeight: "19.6px",
  letterSpacing: "0.52px",
  textTransform: "uppercase",
  marginRight: "22px",
}));

export const StyledValue = styled(Typography)(() => ({
  color: "#595959",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: "19.6px",
}));

type Props = {
  label: string;
  value: string | JSX.Element;
};

const SubmissionHeaderProperty: FC<Props> = ({ label, value }) => (
  <Grid md={6} xs={12} item>
    <Stack direction="row" alignItems="center">
      <StyledLabel variant="body1">{label}</StyledLabel>
      {typeof value === "string" ? (
        <StyledValue variant="body1">{value}</StyledValue>
      ) : (
        value
      )}
    </Stack>
  </Grid>
);

export default SubmissionHeaderProperty;
