import { Box, FormControl, MenuItem, styled } from "@mui/material";
import { isEqual } from "lodash";
import { FC, memo } from "react";
import { useSearchParams } from "react-router-dom";
import StyledSelect from "../../components/StyledFormComponents/StyledSelect";
import SuspenseLoader from "../../components/SuspenseLoader";

export type DashboardViewProps = {
  url: string;
  currentType: string;
  loading: boolean;
};

const StyledViewHeader = styled(Box)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: "15px",
  marginTop: "15px",
});

const StyledFormControl = styled(FormControl)({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "15px",
  width: "300px",
});

const StyledInlineLabel = styled("label")({
  padding: 0,
  fontWeight: "700",
});

const StyledFrameContainer = styled(Box)({
  position: "relative",
});

const StyledFrame = styled("iframe")({
  width: "100%",
  // TODO: compute the height of the iframe to make it dynamic
  minHeight: "calc(100vh - 209px)",
  border: "none",
});

/**
 * The view for the OperationDashboard component.
 *
 * @param {DashboardViewProps} props The props for the component.
 * @returns {JSX.Element} The OperationDashboard component.
 */
const DashboardView: FC<DashboardViewProps> = ({
  url,
  currentType,
  loading,
}: DashboardViewProps) => {
  const [, setSearchParams] = useSearchParams();

  return (
    <Box data-testid="operation-dashboard-container">
      {/* TODO: Loading also tied in with iframe loading? */}
      {loading && <SuspenseLoader />}
      <StyledViewHeader>
        <StyledFormControl>
          <StyledInlineLabel htmlFor="dashboard-type">Metrics</StyledInlineLabel>
          <StyledSelect
            value={currentType}
            onChange={(e) => setSearchParams({ type: e.target.value as string })}
            MenuProps={{ disablePortal: true }}
            inputProps={{ id: "dashboard-type" }}
          >
            <MenuItem value="Submission">Data Submissions Metrics</MenuItem>
          </StyledSelect>
        </StyledFormControl>
      </StyledViewHeader>
      <StyledFrameContainer>
        {/* TODO: Put a placeholder if loading? and remove hardcoded url */}
        {url ? <StyledFrame title="metric view" src={url} /> : null}
      </StyledFrameContainer>
    </Box>
  );
};

export default memo<DashboardViewProps>(DashboardView, isEqual);
