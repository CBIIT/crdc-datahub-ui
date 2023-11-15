import { FC } from "react";
import {
  Button, Dialog, DialogContent, DialogProps,
  IconButton, Typography, styled,
} from "@mui/material";
import { Link } from 'react-router-dom';
import { ReactComponent as CloseIconSvg } from "../../assets/icons/close_icon.svg";

const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    maxWidth: "none",
    borderRadius: "8px",
    width: "755px !important",
    padding: "47px 59px 71px 54px",
    border: "2px solid #0B7F99",
    background: "linear-gradient(0deg, #F2F6FA 0%, #F2F6FA 100%), #2E4D7B",
    boxShadow: "0px 4px 45px 0px rgba(0, 0, 0, 0.40)",
  },
});

const StyledHeader = styled(Typography)({
  color: "#0B7F99",
  fontFamily: "'Nunito Sans', 'Rubik', sans-serif",
  fontSize: "35px",
  fontStyle: "normal",
  fontWeight: 900,
  lineHeight: "30px",
  marginBottom: "50px"
});

const StyledDialogContent = styled(DialogContent)({
  padding: 0,
});

const StyledBodyText = styled(Typography)({
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: "19.6px",
  marginBottom: "28px",
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

type Props = {
  onClose?: () => void;
} & Omit<DialogProps, "onClose">;

const UploaderToolDialog: FC<Props> = ({
  title,
  onClose,
  onSubmit,
  open,
  ...rest
}) => (
  <StyledDialog
    open={open}
    onClose={() => onClose?.()}
    {...rest}
  >
    <StyledCloseDialogButton
      aria-label="close"
      onClick={() => onClose?.()}
    >
      <CloseIconSvg />
    </StyledCloseDialogButton>
    <StyledHeader id="uploader-cli-header" variant="h3">
      Uploader CLI Tool
    </StyledHeader>
    <StyledDialogContent>
      <StyledBodyText id="uploader-cli-body" variant="h6">
        The Uploader CLI is a command-line interface tool provided for directly uploading
        data submission files from your workstation to the Data Hub cloud storage.
        To download the tool and locate the README for instructions, click on the GitHub URL below.
      </StyledBodyText>
      <Link to="https://github.com/CBIIT/crdc-datahub-cli-uploader" target="_blank">https://github.com/CBIIT/crdc-datahub-cli-uploader</Link>
    </StyledDialogContent>
    <StyledCloseButton id="uploader-cli-close-button" variant="outlined" onClick={onClose}>
      Close
    </StyledCloseButton>
  </StyledDialog>
);

export default UploaderToolDialog;
