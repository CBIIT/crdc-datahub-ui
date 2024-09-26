import { Box, FormControl, MenuItem, SelectChangeEvent, styled, Typography } from "@mui/material";
import { isEqual } from "lodash";
import { FC, memo, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  createEmbeddingContext,
  DashboardExperience,
  FrameOptions,
} from "amazon-quicksight-embedding-sdk";
import StyledSelect from "../../components/StyledFormComponents/StyledSelect";
import SuspenseLoader from "../../components/SuspenseLoader";
import bannerSvg from "../../assets/banner/submission_banner.png";

export type DashboardViewProps = {
  url: string;
  currentType: string;
  loading: boolean;
};

const StyledViewHeader = styled(Box)({
  background: `url(${bannerSvg})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  width: "100%",
  height: "296px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: "-178px",
  marginTop: "0px",
});

const StyledFormControl = styled(FormControl)({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "15px",
  width: "300px",
  marginBottom: "auto",
  marginTop: "37px",
});

const StyledInlineLabel = styled("label")({
  padding: 0,
  fontWeight: "700",
});

const StyledFrameContainer = styled(Box)({
  borderRadius: "6px",
  border: "1px solid #E0E0E0",
  background: "#fff",
  position: "relative",
  margin: "0 auto",
  marginBottom: "57px",
  maxWidth: "calc(100% - 64px)",
  boxShadow:
    "0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)",
});

const StyledPlaceholder = styled(Typography)({
  margin: "100px auto",
  textAlign: "center",
  userSelect: "none",
  fontSize: "16px",
  color: "#5C5C5C",
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
  const [embeddedDashboard, setEmbeddedDashboard] = useState<DashboardExperience>(null);
  const dashboardElementRef = useRef<HTMLDivElement>(null);

  const handleDashboardChange = (e: SelectChangeEvent) => {
    setSearchParams({ type: e.target.value });
    dashboardElementRef.current.innerHTML = "";
    setEmbeddedDashboard(null);
  };

  const createEmbed = async () => {
    if (!url || embeddedDashboard) {
      return;
    }

    const options: FrameOptions = {
      url,
      container: dashboardElementRef.current,
      height: "1200px",
      width: "100%",
      withIframePlaceholder: true,
    };

    const context = await createEmbeddingContext();
    const dashboard = await context.embedDashboard(options);

    setEmbeddedDashboard(dashboard);
  };

  useEffect(() => {
    if (!url) {
      return;
    }

    createEmbed();
  }, [url]);

  return (
    <Box data-testid="operation-dashboard-container">
      {loading && <SuspenseLoader />}
      <StyledViewHeader>
        <StyledFormControl>
          <StyledInlineLabel htmlFor="dashboard-type">Metrics</StyledInlineLabel>
          <StyledSelect
            value={currentType}
            onChange={handleDashboardChange}
            MenuProps={{ disablePortal: true }}
            inputProps={{ id: "dashboard-type" }}
          >
            <MenuItem value="Submission">Data Submissions Metrics</MenuItem>
          </StyledSelect>
        </StyledFormControl>
      </StyledViewHeader>
      <StyledFrameContainer>
        {!embeddedDashboard && (
          <StyledPlaceholder variant="body1">Please select a metric to visualize</StyledPlaceholder>
        )}
        <div ref={dashboardElementRef} />
      </StyledFrameContainer>
    </Box>
  );
};

export default memo<DashboardViewProps>(DashboardView, isEqual);
