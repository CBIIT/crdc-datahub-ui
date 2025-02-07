import { FC } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  IconButton,
  Typography,
  styled,
} from "@mui/material";
import { ReactComponent as CloseIconSvg } from "../../assets/icons/close_icon.svg";
import PackageTable from "./PackageTable";
import env from "../../env";
import { extractVersion } from "../../utils";

const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    maxWidth: "none",
    borderRadius: "8px",
    width: "740px !important",
    padding: "47px 53px 71px",
    border: "2px solid #0B7F99",
    background: "linear-gradient(0deg, #F2F6FA 0%, #F2F6FA 100%), #2E4D7B",
    boxShadow: "0px 4px 45px 0px rgba(0, 0, 0, 0.40)",
  },
});

const StyledHeader = styled(Typography)({
  color: "#0B7F99",
  fontFamily: "'Nunito Sans' !important",
  fontSize: "35px !important",
  fontStyle: "normal",
  fontWeight: "900 !important",
  lineHeight: "30px !important",
  marginBottom: 0,
  letterSpacing: "normal !important",
});

const StyledDialogContent = styled(DialogContent)({
  padding: 0,
  marginTop: "51px",
});

const StyledBodyText = styled(Typography)({
  fontFamily: "'Nunito', 'Rubik', sans-serif !important",
  fontSize: "16px !important",
  fontStyle: "normal",
  fontWeight: "400 !important",
  lineHeight: "19.6px !important",
  marginBottom: "37px !important",
  letterSpacing: "unset !important",
});

const StyledCloseDialogButton = styled(IconButton)(() => ({
  position: "absolute !important" as "absolute",
  right: "21px",
  top: "11px",
  padding: "10px !important",
  "& svg": {
    color: "#44627C",
  },
}));

const StyledDialogActions = styled(DialogActions)({
  padding: "0 !important",
  justifyContent: "center",
  marginTop: "68px !important",
});

const StyledButton = styled(Button)({
  width: "128px",
  height: "42px",
  padding: "12px 60px !important",
  borderRadius: "8px !important",
  background: "#FFF !important",
  border: "1px solid #000 !important",
  color: "#000 !important",
  textAlign: "center",
  fontFamily: "'Nunito', 'Rubik', sans-serif !important",
  fontSize: "16px !important",
  fontStyle: "normal",
  fontWeight: "700 !important",
  lineHeight: "24px !important",
  letterSpacing: "0.32px",
  textTransform: "none !important" as "none",
  alignSelf: "center",
  "&:hover": {
    background: "transparent !important",
  },
});

const StyledSubtitle = styled(Typography)({
  color: "#595959",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: "19.6px",
  marginTop: "8px",
});

type Props = {
  onClose?: () => void;
} & Omit<DialogProps, "onClose">;

const UploaderToolDialog: FC<Props> = ({ title, onClose, onSubmit, open, ...rest }) => {
  const version = extractVersion(env?.REACT_APP_UPLOADER_CLI_VERSION);

  return (
    <StyledDialog
      open={open}
      onClose={() => onClose?.()}
      aria-labelledby="uploader-cli-header"
      data-testid="uploader-cli-dialog"
      {...rest}
    >
      <StyledCloseDialogButton
        data-testid="uploader-cli-dialog-close-icon"
        aria-label="close"
        onClick={() => onClose?.()}
      >
        <CloseIconSvg />
      </StyledCloseDialogButton>
      <StyledHeader id="uploader-cli-header" variant="h1">
        Uploader CLI Tool
      </StyledHeader>
      {version && (
        <StyledSubtitle data-testid="uploader-cli-version">(Version: v{version})</StyledSubtitle>
      )}

      <StyledDialogContent>
        <StyledBodyText id="uploader-cli-body" variant="body1">
          The Uploader CLI is a command-line interface tool designed for directly uploading data
          submission files from your workstation to the CRDC Submission Portal cloud storage.
          <br />
          <br />
          To download the tool and access the accompanying instructions, please choose from the
          available download options below.
        </StyledBodyText>

        <PackageTable />
      </StyledDialogContent>
      <StyledDialogActions>
        <StyledButton data-testid="uploader-cli-close-button" variant="outlined" onClick={onClose}>
          Close
        </StyledButton>
      </StyledDialogActions>
    </StyledDialog>
  );
};

export default UploaderToolDialog;
