import { Grid, Typography, styled } from "@mui/material";
import { ReactNode } from "react";

const StyledTitle = styled(Typography)(() => ({
  color: "#083A50",
  fontSize: "16px",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontWeight: 700,
  lineHeight: "19.6px",
  marginBottom: "5px",
  height: "20px",
}));

const StyledAsterisk = styled("span")(() => ({
  color: "#D54309",
  marginLeft: "8px",
  marginRight: "8px",
}));

type Props = {
  title?: string;
  hideTitle?: boolean;
  required?: boolean;
  children: ReactNode;
};

const ReviewDataListing = ({
  title,
  hideTitle,
  required = false,
  children,
}: Props) => (
  <Grid md={6} xs={12} item>
    {title && (
      <StyledTitle variant="h6">
        {!hideTitle ? (
          <>
            {title}
            {required && <StyledAsterisk>*</StyledAsterisk>}
          </>
        ) : null}
      </StyledTitle>
    )}
    {children}
  </Grid>
);

export default ReviewDataListing;
