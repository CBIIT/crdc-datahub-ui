import { FC, useState } from "react";
import {
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useFormContext } from "../../Contexts/FormContext";
import { FormatDate, SortHistory } from "../utils";
import { StatusIconMap } from "../icons";

const StyledAvatar = styled(Avatar)({
  background: "transparent",
  marginRight: "8px",
  marginLeft: "8px !important",
});

const StyledStatus = styled("span")<{ status: ApplicationStatus, leftGap: boolean }>(
  ({ theme, status, leftGap }) => ({
    fontWeight: "600",
    fontSize: "16px",
    fontFamily: "Public Sans",
    textTransform: "uppercase",
    marginLeft: !leftGap ? "6px !important" : null,
    letterSpacing: "0.32px",
    color: theme.palette?.[status]?.main || "#2E5481",
  })
);

const StyledButton = styled(Button)<{ status: ApplicationStatus }>(
  ({ theme, status }) => ({
    color: theme.palette?.[status]?.main || "#2E5481",
    background: theme.palette?.[status]?.contrastText || "#C0DAF3",
    fontWeight: "700",
    borderRadius: "8px",
    textTransform: "none",
    width: "165px",
    "&:hover": {
      background: theme.palette?.[status]?.contrastText || "#C0DAF3",
    },
  })
);

const StyledDialog = styled(Dialog)<{ status: ApplicationStatus }>(
  ({ theme, status }) => ({
    "& .MuiDialog-paper": {
      borderRadius: "8px",
      border: "2px solid",
      borderColor: theme.palette?.[status]?.main || "#C0DAF3",
      background: "linear-gradient(0deg, #F2F6FA 0%, #F2F6FA 100%), #2E4D7B",
      boxShadow: "0px 4px 45px 0px rgba(0, 0, 0, 0.40)",
      padding: "28px 24px",
      width: "730px",
    },
  })
);

const StyledDialogTitle = styled(DialogTitle)({
  paddingBottom: "0",
});

const StyledPreTitle = styled("p")({
  color: "#929292",
  fontSize: "13px",
  fontFamily: "Nunito Sans",
  lineHeight: "27px",
  letterSpacing: "0.5px",
  textTransform: "uppercase",
  margin: "0",
});

const StyledTitle = styled("p")<{ status: ApplicationStatus }>(
  ({ theme, status }) => ({
    color: theme.palette?.[status]?.main || "#2E5481",
    fontSize: "35px",
    fontFamily: "Nunito Sans",
    fontWeight: "900",
    lineHeight: "30px",
    margin: "0",
  })
);

const StyledDialogContent = styled(DialogContent)({
  marginBottom: "22px",
  maxHeight: "230px",
  overflowY: "auto",
  overflowX: "hidden",
  whiteSpace: "pre-line",
  overflowWrap: "break-word",
});

const StyledSubTitle = styled("p")({
  color: "#453D3D",
  fontSize: "14px",
  fontFamily: "Public Sans",
  fontWeight: "700",
  lineHeight: "20px",
  letterSpacing: "0.14px",
  textTransform: "uppercase",
  marginTop: "60px",
});

const StyledCloseButton = styled(Button)({
  fontWeight: "700",
  borderRadius: "8px",
  textTransform: "none",
  color: "#000",
  borderColor: "#000",
  margin: "0 auto",
  minWidth: "128px",
  "&:hover": {
    borderColor: "#000",
  },
});

/**
 * Status Bar Application Status Section
 *
 * @returns {JSX.Element}
 */
const StatusSection: FC = () => {
  const {
    data: { status, history },
  } = useFormContext();

  const [open, setOpen] = useState<boolean>(false);
  const [lastReview] = useState<HistoryEvent>(
    SortHistory(history).find((h: HistoryEvent) => h.reviewComment)
  );

  return (
    <>
      {StatusIconMap[status] && (
        <StyledAvatar>
          <img
            src={StatusIconMap[status]}
            alt={`${status} icon`}
            data-testid="status-bar-icon"
          />
        </StyledAvatar>
      )}
      <StyledStatus
        data-testid="status-bar-status"
        status={status}
        leftGap={!StatusIconMap[status]}
      >
        {status}
      </StyledStatus>

      {lastReview?.reviewComment && (
        <>
          <StyledButton
            id="status-bar-review-comments-button"
            variant="contained"
            onClick={() => setOpen(true)}
            aria-label="Review Comments"
            status={status}
            disableElevation
          >
            Review Comments
          </StyledButton>
          <StyledDialog
            open={open}
            onClose={() => setOpen(false)}
            maxWidth={false}
            status={status}
            data-testid="status-bar-review-dialog"
          >
            <StyledDialogTitle>
              <StyledPreTitle>CRDC Submission Request</StyledPreTitle>
              <StyledTitle status={status}>Review Comments</StyledTitle>
              <StyledSubTitle title={lastReview?.dateTime}>
                {`Based on submission from ${FormatDate(
                  lastReview?.dateTime,
                  "M/D/YYYY",
                  "N/A"
                )}:`}
              </StyledSubTitle>
            </StyledDialogTitle>
            <StyledDialogContent>
              {lastReview?.reviewComment}
            </StyledDialogContent>
            <DialogActions>
              <StyledCloseButton
                id="status-bar-close-review-comments-button"
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

export default StatusSection;
