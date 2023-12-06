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
  fontFamily: "'Nunito Sans', 'Rubik', sans-serif !important",
  fontSize: "35px !important",
  fontStyle: "normal",
  fontWeight: "900 !important",
  lineHeight: "30px !important",
  marginBottom: "50px !important",
});

const StyledDialogContent = styled(DialogContent)({
  padding: 0,
});

const StyledBodyText = styled(Typography)({
  fontFamily: "'Nunito', 'Rubik', sans-serif !important",
  fontSize: "16px !important",
  fontStyle: "normal",
  fontWeight: "400 !important",
  lineHeight: "19.6px !important",
  marginBottom: "28px !important",
  letterSpacing: "unset !important",
});

const StyledCloseDialogButton = styled(IconButton)(() => ({
  position: 'absolute !important' as 'absolute',
  right: "21px",
  top: "11px",
  padding: "10px",
  "& svg": {
    color: "#44627C"
  }
}));

const StyledCloseButton = styled(Button)({
  width: "128px",
  height: "42px",
  padding: "12px 60px !important",
  borderRadius: "8px !important",
  border: "1px solid #000 !important",
  color: "#000 !important",
  textAlign: "center",
  fontFamily: "'Nunito', 'Rubik', sans-serif !important",
  fontSize: "16px !important",
  fontStyle: "normal",
  fontWeight: "700 !important",
  lineHeight: "24px !important",
  letterSpacing: "0.32px",
  textTransform: "none !important" as 'none',
  alignSelf: "center",
  marginTop: "45px !important",
  "&:hover": {
    background: "transparent !important",
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
        The Uploader CLI is a command-line interface tool provided for directly uploading data submission files from your workstation to the Data Hub cloud storage.
        To download the tool and accompanying instructions, click on the Download link.
      </StyledBodyText>
      <Link to="https://github.com/CBIIT/crdc-datahub-cli-uploader/releases" target="_blank">https://github.com/CBIIT/crdc-datahub-cli-uploader/releases</Link>
    </StyledDialogContent>
    <StyledCloseButton id="uploader-cli-close-button" variant="outlined" onClick={onClose}>
      Close
    </StyledCloseButton>
  </StyledDialog>
);

export default UploaderToolDialog;
