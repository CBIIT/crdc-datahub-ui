import { CSSProperties, FC, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineContent,
} from "@mui/lab";
import { styled } from "@mui/material/styles";
import { useFormContext } from "../../Contexts/FormContext";
import { HistoryIconMap } from "../../../assets/history/submissionRequest";
import { FormatDate, SortHistory } from "../../../utils";

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
      return "#E25C22";
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
  fontWeight: "700",
  borderRadius: "8px",
  textTransform: "none",
  letterSpacing: "0.32px",
  background: "#C0DAF3",
  color: "#2E5481",
  width: "165px",
  "&:hover": {
    background: "#C0DAF3",
  },
});

const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    borderRadius: "8px",
    boxShadow: "0px 4px 45px 0px rgba(0, 0, 0, 0.40)",
    padding: "28px 24px",
    width: "567px !important",
    border: "2px solid #388DEE",
    background: "#2E4D7B",
  },
});

const StyledDialogTitle = styled(DialogTitle)({
  paddingBottom: "0",
});

const StyledPreTitle = styled("p")({
  color: "#D5DAE7",
  fontSize: "13px",
  fontFamily: "Nunito Sans",
  lineHeight: "27px",
  letterSpacing: "0.5px",
  textTransform: "uppercase",
  margin: "0",
});

const StyledTitle = styled("p")({
  color: "#FFF",
  fontSize: "35px",
  fontFamily: "Nunito Sans",
  fontWeight: "900",
  lineHeight: "30px",
  margin: "0",
});

const StyledDialogContent = styled(DialogContent)({
  marginTop: "20px",
  marginBottom: "22px",
});

const StyledTimelineItem = styled(TimelineItem)({
  alignItems: "center",
  "&::before": {
    flex: "0",
    padding: "0",
    paddingLeft: "55px",
  },
  // Add vertical separator line between timeline items
  "&:not(:last-of-type)::after": {
    content: '" "',
    height: "1px",
    left: "0",
    right: "0",
    bottom: "0",
    position: "absolute",
    background: "#033277",
  },
  // Add vertical lines between timeline item dots (top)
  "&:not(:first-of-type) .MuiTimelineSeparator-root::before": {
    content: '" "',
    width: "6px",
    background: "#fff",
    top: "0",
    bottom: "50%",
    right: "50%",
    position: "absolute",
    transform: "translateX(50%)",
    zIndex: "1",
  },
  // Add vertical lines between timeline item dots (bottom)
  "&:not(:last-of-type) .MuiTimelineSeparator-root::after": {
    content: '" "',
    width: "6px",
    background: "#fff",
    top: "50%",
    bottom: "0",
    right: "50%",
    position: "absolute",
    transform: "translateX(50%)",
    zIndex: "1",
  },
});

const StyledTimelineSeparator = styled(TimelineSeparator)({
  position: "relative",
  minHeight: "70px",
});

const StyledTimelineDot = styled(TimelineDot)({
  background: "#fff",
  borderWidth: "4px",
  margin: "0",
  zIndex: "2",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
});

const StyledTimelineVerticalLine = styled("span")({
  width: "60px",
  height: "2px",
  background: "#fff",
  position: "absolute",
  top: "50%",
  left: "50%",
  "&::after": {
    content: '" "',
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#fff",
    top: "50%",
    bottom: "0",
    right: "0",
    position: "absolute",
    transform: "translateY(-50%)",
    zIndex: "1",
  },
});

const StyledTimelineContent = styled(TimelineContent)({
  marginLeft: "60px",
  color: "#fff",
});

const StyledTypography = styled(Typography)<{ status?: ApplicationStatus }>(({ status }) => ({
  lineHeight: "2.5",
  minWidth: "100px",
  textAlign: "left",
  color: getStatusColor(status),
}));

const StyledAvatar = styled(Avatar)({
  background: "transparent",
  marginRight: "8px",
});

const StyledCloseButton = styled(Button)({
  fontWeight: "700",
  borderRadius: "8px",
  textTransform: "none",
  color: "#fff",
  borderColor: "#fff",
  margin: "0 auto",
  minWidth: "128px",
  "&:hover": {
    borderColor: "#fff",
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
  const sortedHistory = useMemo(() => SortHistory(history), [history]);

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
            onClick={() => setOpen(true)}
            aria-label="Full History"
            color="primary"
            disableElevation
          >
            Full History
          </StyledButton>
          <StyledDialog
            open={open}
            onClose={() => setOpen(false)}
            scroll="body"
            data-testid="status-bar-history-dialog"
          >
            <StyledDialogTitle>
              <StyledPreTitle>CRDC Submission Request</StyledPreTitle>
              <StyledTitle>Submission History</StyledTitle>
            </StyledDialogTitle>
            <StyledDialogContent>
              <Timeline position="right">
                {sortedHistory.map(({ status, dateTime }, index) => (
                  <StyledTimelineItem
                    key={`history-item-${Math.random()}`}
                    data-testid={`status-bar-history-item-${index}`}
                  >
                    <StyledTimelineSeparator>
                      <StyledTimelineDot />
                      <StyledTimelineVerticalLine />
                    </StyledTimelineSeparator>
                    <StyledTimelineContent>
                      <Stack direction="row" alignContent="center" spacing={1}>
                        <StyledTypography title={dateTime}>
                          {FormatDate(dateTime, "M/D/YYYY", "N/A")}
                        </StyledTypography>
                        <StyledTypography status={status}>
                          {status?.toUpperCase()}
                        </StyledTypography>
                        {index === 0 && HistoryIconMap[status] && (
                          <StyledAvatar>
                            <img
                              src={HistoryIconMap[status]}
                              alt={`${status} icon`}
                              data-testid={`status-bar-history-item-${index}-icon`}
                            />
                          </StyledAvatar>
                        )}
                      </Stack>
                    </StyledTimelineContent>
                  </StyledTimelineItem>
                ))}
              </Timeline>
            </StyledDialogContent>
            <DialogActions>
              <StyledCloseButton
                id="status-bar-close-full-history-button"
                onClick={() => setOpen(false)}
                variant="outlined"
                size="large"
                aria-label="Close dialog"
                data-testid="status-bar-dialog-close"
              >
                Close
              </StyledCloseButton>
            </DialogActions>
          </StyledDialog>
        </>
      )}
    </>
  );
};

export default HistorySection;
