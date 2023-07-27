import React, { FC } from "react";
import {
  Box, Grid, Stack,
  Typography, styled
} from "@mui/material";

type Props = {
  children: React.ReactNode;
  title?: string;
  description?: string | React.ReactNode;
  endButton?: React.ReactNode;
};

const StyledGrid = styled(Grid)({
  marginTop: "46px",
  "&:first-of-type": {
    marginTop: 0,
  },
  "& > .MuiGrid-container": {
    marginTop: "24px",
  },
  "& > .MuiGrid-item + .MuiGrid-container": {
    marginTop: 0,
  },
});

const StyledHeader = styled(Grid)({
  marginBottom: "24px",
});

export const StyledTitle = styled(Typography)({
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  lineHeight: "19.6px",
  fontWeight: 500,
  color: "#7899A1",
  fontSize: "17px",
  textTransform: "uppercase"
});

export const StyledDescription = styled(Typography)({
  fontWeight: 400,
  color: "#34A286",
  marginTop: "25px",
  fontSize: "16px",
});

const StyledEndAdornment = styled(Box)({
  marginLeft: "auto",
});

/**
 * Generic Form Input Section Group
 *
 * @param {Props} props
 * @returns {React.ReactNode}
 */
const SectionGroup: FC<Props> = ({ title, description, children, endButton }) => (
  <StyledGrid container rowSpacing={0} columnSpacing={1.5}>
    <StyledHeader xs={12} item>
      <Stack direction="column" alignItems="flex-start">
        {title && (
          <StyledTitle variant="h5">
            {title}
          </StyledTitle>
        )}
        {description && (
          <StyledDescription variant="body1">
            {description}
          </StyledDescription>
        )}
      </Stack>
    </StyledHeader>
    {children}
    {endButton && <StyledEndAdornment>{endButton}</StyledEndAdornment>}
  </StyledGrid>
);

export default SectionGroup;
