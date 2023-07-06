import { Divider, Grid, Stack, Typography, styled } from "@mui/material";
import { FC, ReactNode } from "react";

const GridContainer = styled(Grid)(() => ({
 ":not(:first-of-type)": {
    marginTop: "30px",
 },
  paddingTop: 0
}));

const StyledTitle = styled(Typography)(() => ({
  color: "#34A286",
  fontSize: "17px",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontStyle: "normal",
  fontWeight: 700,
  lineHeight: "19.6px",
  textTransform: "uppercase",
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
  <GridContainer container rowSpacing={3.75} columnSpacing={1.5}>
    <Grid xs={12} item>
      <Stack direction="row" alignItems="center">
        {title && <StyledTitle variant="h6">{title}</StyledTitle>}
        {divider && <StyledDivider />}
      </Stack>
    </Grid>
    {children}
  </GridContainer>
);

export default ReviewSection;
