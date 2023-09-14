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
  beginButton?: React.ReactNode;
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
  marginBottom: "18px",
});

export const StyledTitle = styled(Typography)({
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  lineHeight: "19.6px",
  fontWeight: 500,
  color: "#5A7C81",
  fontSize: "17px",
});

export const StyledDescription = styled(Typography)({
  fontWeight: 400,
  color: "#2A836D",
  marginTop: "16px",
  fontSize: "16px",
});

const StyledEndAdornment = styled(Box)({
  marginLeft: "auto",
});
const StyledBeginAdornment = styled(Box)({
  marginRight: "12px",
  marginTop: "auto",
  marginBottom: "auto",
  paddingTop: "25px",
});

/**
 * Generic Form Input Section Group
 *
 * @param {Props} props
 * @returns {React.ReactNode}
 */
const SectionGroup: FC<Props> = ({ title, description, children, endButton, beginButton }) => (
  <StyledGrid container rowSpacing={0} columnSpacing={1.5}>
    <StyledHeader xs={12} item>
      <Stack direction="column" alignItems="flex-start">
        {title && (
          <StyledTitle variant="h5">
            {title}
          </StyledTitle>
        )}
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" width="100%">
          {description && (
            <StyledDescription variant="body1">
              {description}
            </StyledDescription>
          )}
          {beginButton && <StyledBeginAdornment>{beginButton}</StyledBeginAdornment>}
        </Stack>

      </Stack>
    </StyledHeader>
    {children}
    {endButton && <StyledEndAdornment>{endButton}</StyledEndAdornment>}
  </StyledGrid>
);

export default SectionGroup;
