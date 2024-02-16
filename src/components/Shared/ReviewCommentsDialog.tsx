import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  styled,
} from "@mui/material";
import { CSSProperties } from "react";
import { FormatDate } from "../../utils";
import { ReactComponent as CloseIconSvg } from "../../assets/icons/close_icon.svg";

const StyledDialog = styled(Dialog, {
  shouldForwardProp: (prop) => prop !== "status" && prop !== "getColorScheme"
})<{
  status: unknown;
  getColorScheme:(status: unknown) => CSSProperties;
}>(({ status, getColorScheme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: "8px",
    border: "2px solid",
    borderColor:
      getColorScheme && status ? getColorScheme(status).color : "#E25C22",
    background: "linear-gradient(0deg, #F2F6FA 0%, #F2F6FA 100%), #2E4D7B",
    boxShadow: "0px 4px 45px 0px rgba(0, 0, 0, 0.40)",
    padding: "22px 28px 24px",
    width: "730px",
  },
}));

const StyledCloseDialogButton = styled(IconButton)(() => ({
  position: "absolute",
  right: "21px",
  top: "11px",
  padding: "10px",
  "& svg": {
    color: "#44627C",
  },
}));

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

const StyledTitle = styled("p", {
  shouldForwardProp: (prop) => prop !== "status" && prop !== "getColorScheme"
})<{
  status: unknown;
  getColorScheme:(status: unknown) => CSSProperties;
}>(({ status, getColorScheme }) => ({
  color: getColorScheme && status ? getColorScheme(status).color : "#E25C22",
  fontSize: "35px",
  fontFamily: "Nunito Sans",
  fontWeight: "900",
  lineHeight: "30px",
  margin: "0",
}));

const StyledDialogContent = styled(DialogContent)({
  marginBottom: "11px",
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
  marginBottom: "19px",
});

const StyledCloseButton = styled(Button)({
  minWidth: "137px",
  padding: "10px",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "16px",
  fontStyle: "normal",
  lineHeight: "24px",
  letterSpacing: "0.32px",
  textTransform: "none",
  alignSelf: "center",
  margin: "auto",
});

type Props<T, H> = {
  open: boolean;
  status?: T;
  lastReview: HistoryBase<H>;
  title: string;
  getColorScheme?: (status: T) => CSSProperties;
  onClose?: () => void;
};

const ReviewCommentsDialog = <T, H>({
  open,
  status,
  lastReview,
  title,
  getColorScheme,
  onClose,
}: Props<T, H>) => (
  <StyledDialog
    open={open}
    onClose={() => onClose?.()}
    maxWidth={false}
    status={status}
    getColorScheme={getColorScheme}
    data-testid="review-comments-dialog"
  >
    <StyledCloseDialogButton
      onClick={onClose}
      aria-label="Close dialog icon button"
      data-testid="review-comments-dialog-close-icon-button"
    >
      <CloseIconSvg />
    </StyledCloseDialogButton>
    <StyledDialogTitle>
      <StyledPreTitle>{title}</StyledPreTitle>
      <StyledTitle
        status={status}
        getColorScheme={getColorScheme}
        data-testid="review-comments-dialog-title"
      >
        Review Comments
      </StyledTitle>
      <StyledSubTitle title={lastReview?.dateTime}>
        {`Based on submission from ${FormatDate(
          lastReview?.dateTime,
          "M/D/YYYY",
          "N/A"
        )}:`}
      </StyledSubTitle>
    </StyledDialogTitle>
    <StyledDialogContent>{lastReview?.reviewComment}</StyledDialogContent>
    <DialogActions>
      <StyledCloseButton
        id="close-review-comments-button"
        onClick={() => onClose?.()}
        variant="contained"
        color="info"
        aria-label="Close dialog"
        data-testid="review-comments-dialog-close"
      >
        Close
      </StyledCloseButton>
    </DialogActions>
  </StyledDialog>
);

export default ReviewCommentsDialog;
