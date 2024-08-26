import { Box, FormControl, MenuItem, styled } from "@mui/material";
import { isEqual } from "lodash";
import { FC, memo, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  createEmbeddingContext,
  DashboardExperience,
  EmbeddingContext,
} from "amazon-quicksight-embedding-sdk";
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
  const [, setEmbeddedDashboard] = useState<DashboardExperience>(null);
  const [embeddingContext, setEmbeddingContext] = useState<EmbeddingContext>(null);
  const dashboardElementRef = useRef<HTMLDivElement>(null);

  const createContext = async () => {
    const context = await createEmbeddingContext();
    setEmbeddingContext(context);
  };

  const createEmbed = async () => {
    const options = {
      url,
      container: dashboardElementRef.current,
      height: "500px",
      width: "600px",
    };

    const dashboardExperience = await embeddingContext.embedDashboard(options);
    setEmbeddedDashboard(dashboardExperience);
  };

  useEffect(() => {
    if (!url) {
      return;
    }

    createContext();
  }, [url]);

  useEffect(() => {
    if (embeddingContext) {
      createEmbed();
    }
  }, [embeddingContext]);

  return (
    <Box data-testid="operation-dashboard-container">
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
        <div ref={dashboardElementRef} />
      </StyledFrameContainer>
    </Box>
  );
};

export default memo<DashboardViewProps>(DashboardView, isEqual);
