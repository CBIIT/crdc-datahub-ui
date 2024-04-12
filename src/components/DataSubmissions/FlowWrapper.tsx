import { Box, Grid, Typography, styled } from "@mui/material";
import { FC } from "react";

type Props = {
  /**
   * The index of the flow step.
   *
   * @note This is for visual purposes only. Do not use 0-based indexing.
   * @example 1
   */
  index: number;
  /**
   * The title of the flow step.
   *
   * @example "Upload Metadata"
   */
  title: string;
  /**
   * Whether this is the last flow step.
   * This is used to determine whether to display the bottom border
   *
   * @default false
   */
  last?: boolean;
  /**
   * The primary content of the flow step.
   */
  children: React.ReactNode;
  /**
   * Any action buttons to display at the end of the flow step.
   */
  actions?: React.ReactNode;
};

const StyledGrid = styled(Grid)({
  fontFamily: "Nunito",
  paddingTop: "9px",
});

const StyledRule = styled("hr")({
  border: "none",
  backgroundColor: "#D1D1D1",
  height: "1px",
  marginTop: "14px",
  marginBottom: "9px",
});

const StyledIndexGrid = styled(Grid)({
  width: "40px",
});

const StyledIndex = styled(Box)({
  width: "27px",
  height: "27px",
  borderRadius: "50%",
  border: "1px solid #26B893",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  color: "#0B6CB1",
  fontSize: "16px",
  fontWeight: 700,
});

const StyledPrimaryGrid = styled(Grid)({
  flexGrow: 1,
});

const StyledTitle = styled(Typography)({
  fontFamily: "Nunito Sans",
  fontSize: "13px",
  fontWeight: 600,
  lineHeight: "27px",
  letterSpacing: "0.5px",
  color: "#187A90",
  textTransform: "uppercase",
});

const StyledActionsGrid = styled(Grid)({
  paddingTop: "27px",
  alignSelf: "center",
});

const FlowWrapper: FC<Props> = ({ index, title, last = false, children, actions }) => (
  <StyledGrid container>
    <StyledIndexGrid item>
      <StyledIndex>{index}</StyledIndex>
    </StyledIndexGrid>
    <StyledPrimaryGrid item>
      <StyledTitle variant="h3">{title}</StyledTitle>
      <Box>{children}</Box>
    </StyledPrimaryGrid>
    {actions && <StyledActionsGrid item>{actions}</StyledActionsGrid>}
    {!last && (
      <Grid item xs={12}>
        <StyledRule />
      </Grid>
    )}
  </StyledGrid>
);

export default FlowWrapper;
