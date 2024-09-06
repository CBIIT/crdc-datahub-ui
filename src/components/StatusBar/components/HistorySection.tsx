import { CSSProperties, FC, useState } from "react";
import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useFormContext } from "../../Contexts/FormContext";
import { HistoryIconMap } from "./SubmissionRequestIconMap";
import { FormatDate } from "../../../utils";
import HistoryDialog from "../../HistoryDialog";

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

/**
 * Status Bar History Section
 *
 * @returns {JSX.Element}
 */
const HistorySection: FC = () => {
  const {
    data: { updatedAt, history },
  } = useFormContext();
  const [open, setOpen] = useState<boolean>(false);

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
            open={open}
            onClose={() => setOpen(false)}
            data-testid="status-bar-history-dialog"
          />
        </>
      )}
    </>
  );
};

export default HistorySection;
