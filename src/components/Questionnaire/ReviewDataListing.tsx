import { Grid, styled } from "@mui/material";
import { ReactNode } from "react";
import { StyledDescription, StyledTitle } from "./SectionGroup";

const GridContainer = styled(Grid)(() => ({
  ":not(:first-of-type)": {
    marginTop: "25px",
  },
  paddingTop: 0,
}));

type Props = {
  title?: string;
  description?: string | JSX.Element;
  hideTitle?: boolean;
  children?: ReactNode;
};

const ReviewDataListing = ({
  title,
  description,
  hideTitle,
  children,
}: Props) => (
  <>
    {title || description ? (
      <Grid xs={12} item>
        {title && (
          <StyledTitle variant="h5">{!hideTitle ? title : null}</StyledTitle>
        )}
        {description && (
          <StyledDescription variant="body1">{description}</StyledDescription>
        )}
      </Grid>
    ) : null}
    <Grid xs={12} item>
      <GridContainer container rowSpacing={0} columnSpacing={1.5}>
        {children}
      </GridContainer>
    </Grid>
  </>
);

export default ReviewDataListing;
