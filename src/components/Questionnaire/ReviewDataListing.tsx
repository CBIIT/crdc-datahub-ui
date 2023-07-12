import { Grid, Typography, styled } from "@mui/material";
import { ReactNode } from "react";

const GridContainer = styled(Grid)(() => ({
  ":not(:first-of-type)": {
    marginTop: "30px",
  },
  paddingTop: 0,
}));

const StyledTitle = styled(Typography)(() => ({
  color: "#083A50",
  fontSize: "16px",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontWeight: 700,
  lineHeight: "19.6px",
  marginBottom: "5px",
  height: "20px",
}));

type Props = {
  title?: string;
  hideTitle?: boolean;
  children: ReactNode;
};

const ReviewDataListing = ({ title, hideTitle, children }: Props) => (
  <Grid xs={12} item>
    {title && (
      <StyledTitle variant="h6">{!hideTitle ? title : null}</StyledTitle>
    )}
    <GridContainer container rowSpacing={3.75} columnSpacing={1.5}>
      {children}
    </GridContainer>
  </Grid>
);

export default ReviewDataListing;
