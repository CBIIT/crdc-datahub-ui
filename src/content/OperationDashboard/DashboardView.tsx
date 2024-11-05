import { Box, FormControl, MenuItem, SelectChangeEvent, styled, Typography } from "@mui/material";
import { isEqual } from "lodash";
import { FC, memo, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  createEmbeddingContext,
  DashboardContentOptions,
  DashboardExperience,
  FrameOptions,
  ToolbarOptions,
} from "amazon-quicksight-embedding-sdk";
import StyledSelect from "../../components/StyledFormComponents/StyledSelect";
import SuspenseLoader from "../../components/SuspenseLoader";
import bannerSvg from "../../assets/banner/submission_banner.png";
import { useAuthContext } from "../../components/Contexts/AuthContext";
import { Logger } from "../../utils";

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
 * @note This component MUST be protected by authorization to ensure they have the correct role to access the dashboard.
 *       This component assumes that the AuthState is already populated with the user info.
 * @param {DashboardViewProps} props The props for the component.
 * @returns {JSX.Element} The OperationDashboard component.
 */
const DashboardView: FC<DashboardViewProps> = ({
  url,
  currentType,
  loading,
}: DashboardViewProps) => {
  const { user } = useAuthContext();

  const [, setSearchParams] = useSearchParams();
  const [embeddedDashboard, setEmbeddedDashboard] = useState<DashboardExperience>(null);
  const dashboardElementRef = useRef<HTMLDivElement>(null);

  const contentParameters = useMemo<DashboardContentOptions["parameters"]>(() => {
    const { role, studies, dataCommons } = user || {};
    const params: DashboardContentOptions["parameters"] = [];

    if (role === "Federal Monitor" && Array.isArray(studies) && studies.length > 0) {
      params.push({ Name: "studiesParameter", Values: studies });
    } else if (role === "Federal Monitor") {
      Logger.error("This role requires studies to be set but none were found.", studies);
      params.push({ Name: "studiesParameter", Values: ["NO-CONTENT"] });
    }

    if (role === "Data Curator" && Array.isArray(dataCommons) && dataCommons.length > 0) {
      params.push({ Name: "dataCommonsParameter", Values: dataCommons });
    } else if (role === "Data Curator") {
      Logger.error("This role requires dataCommons to be set but none were found.", dataCommons);
      params.push({ Name: "dataCommonsParameter", Values: ["NO-CONTENT"] });
    }

    return params;
  }, [user]);

  const handleDashboardChange = (e: SelectChangeEvent) => {
    setSearchParams({ type: e.target.value });
    dashboardElementRef.current.innerHTML = "";
    setEmbeddedDashboard(null);
  };

  const createEmbed = async () => {
    if (!url || embeddedDashboard) {
      return;
    }

    const frameConfig: FrameOptions = {
      url,
      container: dashboardElementRef.current,
      height: "1200px",
      width: "100%",
      withIframePlaceholder: true,
    };

    const toolbarOptions: ToolbarOptions = {
      export: true,
    };

    const contentConfig: DashboardContentOptions = {
      parameters: contentParameters,
      toolbarOptions,
    };

    const context = await createEmbeddingContext();
    const dashboard = await context.embedDashboard(frameConfig, contentConfig);

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
