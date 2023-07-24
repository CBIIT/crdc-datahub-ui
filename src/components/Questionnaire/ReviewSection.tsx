import { Divider, Grid, Stack, Typography, styled } from "@mui/material";
import { FC, ReactNode } from "react";

const GridContainer = styled(Grid)(() => ({
 "&:not(:first-of-type)": {
    marginTop: "25px",
 },
 "&:first-of-type": {
  paddingTop: "25px"
 },
  paddingTop: 0
}));

const StyledTitle = styled(Typography)(() => ({
  color: "#34A286",
  fontSize: "19px",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontStyle: "normal",
  fontWeight: 700,
  lineHeight: "19.6px",
}));

const StyledDivider = styled(Divider)(() => ({
  color: "#34A286",
  marginLeft: "11px",
  flexGrow: 1,
}));

type Props = {
  title: string;
  divider?: boolean;
  children?: ReactNode;
};

const ReviewSection: FC<Props> = ({ title, divider = true, children }) => (
  <GridContainer container rowSpacing={3.125} columnSpacing={0}>
    <Grid xs={12} item sx={{ padding: "0 !important" }}>
      <Stack direction="row" alignItems="center">
        {title && <StyledTitle variant="h6">{title}</StyledTitle>}
        {divider && <StyledDivider />}
      </Stack>
    </Grid>
    {children}
  </GridContainer>
);

export default ReviewSection;
