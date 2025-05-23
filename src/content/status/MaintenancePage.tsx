import { FC, memo } from "react";
import { Box, Stack, styled } from "@mui/material";
import { unstable_useBlocker as useBlocker, useLocation } from "react-router-dom";
import usePageTitle from "../../hooks/usePageTitle";

const StyledContainer = styled(Stack)({
  background: "#114454CC",
  padding: "69px 0",
  alignItems: "center",
  justifyContent: "center",
  // NOTE: 209px is the header height. This is only visible on larger screens.
  minHeight: "calc(100vh - 209px)",
});

const StyledContent = styled(Box)({
  textAlign: "center",
});

/**
 * Provides a maintenance page for the application.
 *
 * If passed `state.data.shouldLock` is true, it will block any navigation away.
 *
 * @returns The maintenance page component.
 */
const MaintenancePage: FC = () => {
  usePageTitle("Website Maintenance");

  const { state } = useLocation();

  useBlocker(() => state?.data?.shouldLock);

  return (
    <StyledContainer>
      <StyledContent>TODO</StyledContent>
    </StyledContainer>
  );
};

export default memo<FC>(MaintenancePage);
