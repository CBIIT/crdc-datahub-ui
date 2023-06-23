import React, { FC } from "react";
import { Stack, Typography } from "@mui/material";
import styled from "@emotion/styled";
import StatusSection from "./components/StatusSection";
import HistorySection from "./components/HistorySection";

const StyledStack = styled(Stack)({
  padding: "27px",
  background: "#fff",
  boxShadow: "2px 4px 10px rgba(0, 0, 0, 0.35)",
  borderRadius: "8px",
  transform: "translateY(-50%)",
  marginBottom: "-45px",
});

const StyledH1 = styled(Typography)({
  fontWeight: "700",
  fontSize: "19px",
  color: "#282828",
});

/**
 * Form Status Bar Primary Component
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const StatusBar: FC = () => (
  <StyledStack direction="row" justifyContent="space-between">
    <Stack direction="row" spacing={2} alignItems="center">
      <StyledH1 variant="h6">Status:</StyledH1>
      <StatusSection />
    </Stack>
    <Stack direction="row" spacing={2} alignItems="center">
      <StyledH1 variant="h6">Last updated:</StyledH1>
      <HistorySection />
    </Stack>
  </StyledStack>
);

export default StatusBar;
