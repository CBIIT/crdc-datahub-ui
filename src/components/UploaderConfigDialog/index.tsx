import React, { FC, useEffect, useState } from "react";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  IconButton,
  Typography,
  styled,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useForm } from "react-hook-form";
import { ReactComponent as CloseIconSvg } from "../../assets/icons/close_icon.svg";
import StyledOutlinedInput from "../StyledFormComponents/StyledOutlinedInput";
import StyledLabel from "../StyledFormComponents/StyledLabel";

const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    maxWidth: "none",
    borderRadius: "8px",
    width: "731px !important",
    padding: "47px 59px 71px 54px",
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
  marginBottom: "30px !important",
});

const StyledDialogContent = styled(DialogContent)({
  padding: 0,
  marginBottom: "32px",
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

const StyledCloseDialogButton = styled(IconButton)({
  position: "absolute !important" as "absolute",
  right: "21px",
  top: "11px",
  padding: "10px",
  "& svg": {
    color: "#44627C",
  },
});

const StyledForm = styled("form")({
  display: "flex",
  flexDirection: "column",
  gap: "28px",
  margin: "0 auto",
  marginTop: "28px",
  maxWidth: "484px",
});

const StyledDialogActions = styled(DialogActions)({
  padding: "0 !important",
  justifyContent: "center",
});

const StyledButton = styled(LoadingButton)({
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
  margin: "0 15px !important",
  marginTop: "45px !important",
  "&:hover": {
    background: "transparent !important",
  },
});

export type InputForm = {
  dataFolder: string;
  manifest: string;
};

type Props = {
  onClose: () => void;
  onDownload: (form: InputForm) => Promise<void>;
} & Omit<DialogProps, "onClose">;

/**
 * Provides a dialog form for downloading a Uploader CLI configuration file.
 *
 * @param {Props} props
 * @returns {React.FC<Props>}
 */
const UploaderConfigDialog: FC<Props> = ({ onClose, onDownload, open, ...rest }) => {
  const { reset, register, getValues } = useForm<InputForm>();

  const [downloading, setDownloading] = useState<boolean>(false);

  const handleDownload = async () => {
    setDownloading(true);
    await onDownload(getValues());
    setDownloading(false);
  };

  useEffect(() => {
    reset();
  }, [open]);

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      aria-labelledby="uploader-config-dialog-header"
      data-testid="uploader-config-dialog"
      {...rest}
    >
      <StyledCloseDialogButton
        data-testid="uploader-config-dialog-close-icon"
        aria-label="close"
        onClick={onClose}
      >
        <CloseIconSvg />
      </StyledCloseDialogButton>
      <StyledHeader
        id="uploader-config-dialog-header"
        data-testid="uploader-config-dialog-header"
        variant="h1"
      >
        Download
        <br />
        Configuration File
      </StyledHeader>
      <StyledDialogContent>
        <StyledBodyText data-testid="uploader-config-dialog-body" variant="body1">
          Please provide the full pathway to the data files on your local system and to the file
          manifest.
        </StyledBodyText>
        <StyledForm onSubmit={handleDownload}>
          <Box>
            <StyledLabel id="data-folder-input-label">Local Path of Data Files Folder</StyledLabel>
            <StyledOutlinedInput
              {...register("dataFolder", { required: true })}
              placeholder="/Users/me/my-data-files-folder"
              data-testid="uploader-config-dialog-input-data-folder"
              inputProps={{ "aria-labelledby": "data-folder-input-label" }}
            />
          </Box>
          <Box>
            <StyledLabel id="manifest-input-label">Local Path of Manifest File</StyledLabel>
            <StyledOutlinedInput
              {...register("manifest", { required: true })}
              placeholder="/Users/me/my-metadata-folder/my-file-manifest.tsv"
              data-testid="uploader-config-dialog-input-manifest"
              inputProps={{ "aria-labelledby": "manifest-input-label" }}
            />
          </Box>
        </StyledForm>
      </StyledDialogContent>
      <StyledDialogActions>
        <StyledButton
          data-testid="uploader-config-dialog-close-button"
          variant="outlined"
          onClick={onClose}
        >
          Cancel
        </StyledButton>
        <StyledButton
          data-testid="uploader-config-dialog-download-button"
          variant="outlined"
          onClick={handleDownload}
          loading={downloading}
        >
          Download
        </StyledButton>
      </StyledDialogActions>
    </StyledDialog>
  );
};

export default UploaderConfigDialog;
