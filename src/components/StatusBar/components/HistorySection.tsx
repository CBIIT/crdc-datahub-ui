import { CSSProperties, FC, useCallback, useState } from "react";
import { Button, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";
import { HistoryIconMap } from "./SubmissionRequestIconMap";
import { useFormContext } from "../../Contexts/FormContext";
import { FormatDate } from "../../../utils";
import HistoryDialog from "../../HistoryDialog";
import { ReactComponent as BellIcon } from "../../../assets/icons/border_filled_bell_icon.svg";
import Tooltip from "../../Tooltip";

/**
 * Determines the text color for a History event based
 *
 * @param status The current Questionnaire's status
 * @returns Color scheme to match the status
 */
const getStatusColor = (status: ApplicationStatus): CSSProperties["color"] => {
  switch (status) {
    case "Approved":
      return "#10EBA9";
    case "Rejected":
      return "#FFA985";
    case "In Review":
      return "#4DC9FF";
    default:
      return "#fff";
  }
};

const StyledDate = styled("span")({
  fontWeight: "600",
  fontSize: "16px",
  fontFamily: "Public Sans",
  textTransform: "uppercase",
  color: "#2E5481",
  lineHeight: "22px",
  marginRight: "10px !important",
});

const StyledButton = styled(Button)({
  "&.MuiButton-root": {
    minWidth: "192px",
    padding: "10px 20px",
    border: "1px solid #004A80",
    color: "#004A80",
    fontFamily: "'Nunito Sans', 'Rubik', sans-serif",
    fontSize: "16px",
    fontStyle: "normal",
    fontWeight: 700,
    lineHeight: "17px",
    letterSpacing: "0.32px",
    textTransform: "none",
    "&:hover": {
      backgroundColor: "#FFF",
      borderColor: "#004A80",
      color: "#004A80",
    },
  },
});

const StyledBellIcon = styled(BellIcon)({
  width: "18px",
  marginLeft: "5px",
  color: "#D82F00",
});

/**
 * Status Bar History Section
 *
 * @returns {JSX.Element}
 */
const HistorySection: FC = () => {
  const {
    data: { updatedAt, history, conditional, pendingConditions },
  } = useFormContext();
  const [open, setOpen] = useState<boolean>(false);

  const buildStatusWrapper = useCallback(
    (status: ApplicationStatus): React.FC<{ children: React.ReactNode }> => {
      if (!conditional || !pendingConditions?.length || status !== "Approved") {
        return ({ children }) => <span>{children}</span>;
      }

      return ({ children }) => (
        <Tooltip
          title={pendingConditions?.join(", ")}
          placement="top"
          open={undefined}
          disableHoverListener={false}
          arrow
        >
          <Stack direction="row" alignItems="center">
            {children}
            <StyledBellIcon />
          </Stack>
        </Tooltip>
      );
    },
    [conditional, pendingConditions]
  );

  return (
    <>
      <StyledDate data-testid="status-bar-last-updated">
        {FormatDate(updatedAt, "M/D/YYYY", "N/A")}
      </StyledDate>

      {history && history.length > 0 && (
        <>
          <StyledButton
            id="status-bar-full-history-button"
            variant="contained"
            color="info"
            onClick={() => setOpen(true)}
            aria-label="Full History"
            disableElevation
          >
            Full History
          </StyledButton>
          <HistoryDialog
            preTitle="CRDC Submission Request"
            title="Submission History"
            history={history}
            iconMap={HistoryIconMap}
            getTextColor={getStatusColor}
            getStatusWrapper={buildStatusWrapper}
            open={open}
            onClose={() => setOpen(false)}
            showHeaders={false}
            data-testid="status-bar-history-dialog"
          />
        </>
      )}
    </>
  );
};

export default HistorySection;
