import { CSSProperties, useMemo } from "react";
import {
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { Timeline, TimelineItem, TimelineSeparator, TimelineDot, TimelineContent } from "@mui/lab";
import { styled } from "@mui/material/styles";
import { FormatDate, SortHistory } from "../../utils";

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
    background: "#375F9A",
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
  paddingRight: 0,
  color: "#fff",
});

const StyledTypography = styled(Typography)<{ color: CSSProperties["color"] }>(({ color }) => ({
  lineHeight: "2.5",
  minWidth: "100px",
  textAlign: "left",
  color,
}));

const StyledAvatar = styled(Avatar)({
  background: "transparent",
  marginRight: "8px",
  "&.MuiAvatar-root": {
    marginLeft: "auto",
  },
});

const StyledCloseButton = styled(Button)({
  minWidth: "137px",
  fontWeight: "700",
  borderRadius: "8px",
  textTransform: "none",
  color: "#fff",
  borderColor: "#fff",
  margin: "0 auto",
  padding: "10px",
  lineHeight: "24px",
  "&:hover": {
    borderColor: "#fff",
  },
});

export type IconType<T extends string> = Record<T, string>;

type Props<T extends string> = {
  preTitle: string;
  title: string;
  history: HistoryBase<T>[];
  iconMap: IconType<T>;
  getTextColor: (status: T) => CSSProperties["color"];
  onClose: () => void;
} & DialogProps;

/**
 * Status Bar History Section
 *
 * @returns {JSX.Element}
 */
const HistoryDialog = <T extends string>({
  preTitle,
  title,
  history,
  iconMap,
  getTextColor,
  open,
  onClose,
  ...rest
}: Props<T>) => {
  const sortedHistory = useMemo(() => SortHistory(history), [history]);

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      scroll="body"
      data-testid="history-dialog"
      {...rest}
    >
      <StyledDialogTitle>
        <StyledPreTitle>{preTitle}</StyledPreTitle>
        <StyledTitle>{title}</StyledTitle>
      </StyledDialogTitle>
      <StyledDialogContent>
        <Timeline position="right">
          {sortedHistory?.map(({ status, dateTime }, index) => (
            <StyledTimelineItem
              key={`history-item-${status}-${dateTime}}`}
              data-testid="history-item"
            >
              <StyledTimelineSeparator>
                <StyledTimelineDot />
                <StyledTimelineVerticalLine />
              </StyledTimelineSeparator>
              <StyledTimelineContent>
                <Stack direction="row" alignContent="center" spacing={1} paddingRight={0}>
                  <StyledTypography
                    title={dateTime}
                    color={typeof getTextColor === "function" ? getTextColor(status) : "#FFF"}
                    data-testid="history-item-date"
                  >
                    {FormatDate(dateTime, "M/D/YYYY", "N/A")}
                  </StyledTypography>
                  <StyledTypography
                    color={typeof getTextColor === "function" ? getTextColor(status) : "#FFF"}
                    data-testid="history-item-status"
                  >
                    {status?.toString()?.toUpperCase()}
                  </StyledTypography>
                  {index === 0 && iconMap && iconMap[status] && (
                    <StyledAvatar>
                      <img
                        src={iconMap[status]}
                        alt={`${status} icon`}
                        data-testid={`history-item-${index}-icon`}
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
          id="close-full-history-button"
          onClick={() => onClose()}
          variant="outlined"
          size="large"
          aria-label="Close dialog"
          data-testid="history-dialog-close"
        >
          Close
        </StyledCloseButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default HistoryDialog;
