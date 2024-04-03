import { Box, Grid, Stack, Typography, styled } from "@mui/material";
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
  <Grid lg={6} xs={12} item>
    <Stack
      direction="row"
      alignItems="center"
      width="100%"
      maxWidth="100%"
      spacing={2.75}
    >
      <StyledLabel variant="body1">{label}</StyledLabel>
      <Box flexGrow={1} overflow="hidden">
        {typeof value === "string" ? (
          <StyledValue variant="body1">{value}</StyledValue>
        ) : (
          value
        )}
      </Box>
    </Stack>
  </Grid>
);

export default SubmissionHeaderProperty;
