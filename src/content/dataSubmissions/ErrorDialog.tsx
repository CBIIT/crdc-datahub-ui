import { Button, Dialog, DialogProps, IconButton, Stack, Typography, styled } from "@mui/material";
import { ReactComponent as CloseIconSvg } from "../../assets/icons/close_icon.svg";
import { FormatDate } from "../../utils";

const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    maxWidth: "none",
    width: "731px !important",
    padding: "38px 42px 68px",
    borderRadius: "8px",
    border: "2px solid #E25C22",
    background: "linear-gradient(0deg, #F2F6FA 0%, #F2F6FA 100%), #2E4D7B",
    boxShadow: "0px 4px 45px 0px rgba(0, 0, 0, 0.40)",
  },
});

const StyledCloseDialogButton = styled(IconButton)(() => ({
  position: 'absolute',
  right: "21px",
  top: "11px",
  padding: "10px",
  "& svg": {
    color: "#44627C"
  }
}));

const StyledCloseButton = styled(Button)({
  display: "flex",
  width: "128px",
  height: "42px",
  padding: "12px 60px",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: "8px",
  border: "1px solid #000",
  color: "#000",
  textAlign: "center",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: "700",
  lineHeight: "24px",
  letterSpacing: "0.32px",
  textTransform: "none",
  alignSelf: "center",
  marginTop: "45px",
  "&:hover": {
    background: "transparent",
    border: "1px solid #000",
  }
});

const StyledHeader = styled(Typography)({
  color: "#929292",
  fontFamily: "'Nunito Sans', 'Rubik', sans-serif",
  fontSize: "13px",
  fontStyle: "normal",
  fontWeight: "400",
  lineHeight: "27px",
  letterSpacing: "0.5px",
  textTransform: "uppercase",
  marginBottom: "2px"
});

const StyledTitle = styled(Typography)({
  color: "#E25C22",
  fontFamily: "'Nunito Sans', 'Rubik', sans-serif",
  fontSize: "35px",
  fontStyle: "normal",
  fontWeight: "900",
  lineHeight: "30px",
});

const StyledUploadedDate = styled(Typography)({
  color: "#595959",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: "19.6px",
  marginTop: "8px",
  marginBottom: "35px"
});

const StyledSubtitle = styled(Typography)({
  color: "#453D3D",
  fontFamily: "'Public Sans', sans-serif",
  fontSize: "14px",
  fontStyle: "normal",
  fontWeight: 700,
  lineHeight: "20px",
  letterSpacing: "0.14px",
  textTransform: "uppercase",
});

const StyledErrorItem = styled(Typography)({
  color: "#131313",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: "22px",
});

const StyledErrorDetails = styled(Stack)({
  padding: "10px",
  overflowY: "auto",
  maxHeight: "290px"
});

type Props = {
  header?: string;
  title?: string;
  closeText?: string;
  errors: string[];
  uploadedDate: string;
  onClose?: () => void;
} & Omit<DialogProps, "onClose">;

const ErrorDialog = ({
  header,
  title,
  closeText = "Close",
  errors,
  uploadedDate,
  onClose,
  open,
  ...rest
}: Props) => {
  const handleCloseDialog = () => {
    if (typeof onClose === "function") {
      onClose();
    }
  };

  return (
    <StyledDialog open={open} onClose={handleCloseDialog} title="" {...rest}>
      <StyledCloseDialogButton aria-label="close" onClick={handleCloseDialog}>
        <CloseIconSvg />
      </StyledCloseDialogButton>
      <StyledHeader variant="h3">
        {header}
      </StyledHeader>
      <StyledTitle variant="h6">
        {title}
      </StyledTitle>
      <StyledUploadedDate>
        Uploaded on
        {" "}
        {FormatDate(uploadedDate, "M/D/YYYY", "N/A")}
      </StyledUploadedDate>
      <StyledErrorDetails direction="column" spacing={2.5}>
        <StyledSubtitle variant="body2">
          {`${errors?.length || 0} ${errors?.length === 1 ? "ERROR" : "ERRORS"}`}
        </StyledSubtitle>
        <Stack direction="column" spacing={2.75} padding={1.25}>
          {errors?.map((error: string, idx: number) => (
            // eslint-disable-next-line react/no-array-index-key
            <StyledErrorItem key={`${idx}_${error}`}>
              {`${idx + 1}. ${error}`}
            </StyledErrorItem>
          ))}
        </Stack>
      </StyledErrorDetails>
      <StyledCloseButton id="error-dialog-close-button" variant="outlined" onClick={handleCloseDialog}>
        {closeText}
      </StyledCloseButton>
    </StyledDialog>
  );
};

export default ErrorDialog;
