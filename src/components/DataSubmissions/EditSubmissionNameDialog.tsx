import { useMutation } from "@apollo/client";
import { LoadingButton } from "@mui/lab";
import { Box, Typography, styled } from "@mui/material";
import DialogActions from "@mui/material/DialogActions";
import { useSnackbar } from "notistack";
import React, { useState, useEffect } from "react";

import CloseIconSvg from "../../assets/icons/close_icon.svg?react";
import {
  mutation as UPDATE_SUBMISSION_NAME,
  Input as UpdateNameInput,
  Response as UpdateNameResponse,
} from "../../graphql/updateSubmissionName";
import DefaultDialog from "../StyledDialogComponents/StyledDialog";
import StyledCloseDialogButton from "../StyledDialogComponents/StyledDialogCloseButton";
import DefaultDialogContent from "../StyledDialogComponents/StyledDialogContent";
import DefaultDialogHeader from "../StyledDialogComponents/StyledHeader";
import StyledHelperText from "../StyledFormComponents/StyledHelperText";
import StyledLabel from "../StyledFormComponents/StyledLabel";
import StyledOutlinedInput from "../StyledFormComponents/StyledOutlinedInput";

const StyledDialog = styled(DefaultDialog)({
  "& .MuiDialog-paper": {
    width: "577px !important",
    height: "402.86px",
    borderRadius: "8px",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "#5AB8FF",
    paddingTop: "28px",
    paddingRight: "34px",
    paddingBottom: "60px",
    paddingLeft: "34px",
    boxSizing: "border-box",
    background: "#F2F6FA",
    boxShadow: "0px 4px 45px 0px rgba(0,0,0,0.4)",
  },
});

const StyledTitle = styled(Typography)({
  fontFamily: "Nunito, 'Rubik', sans-serif",
  fontWeight: 600,
  fontSize: "13px",
  lineHeight: "27px",
  letterSpacing: "0.5px",
  textTransform: "uppercase",
  color: "#929292",
});

const StyledDialogActions = styled(DialogActions)({
  padding: "0 !important",
  justifyContent: "center",
  marginTop: "55px !important",
  gap: "10px",
});

const baseButtonStyles: object = {
  width: "128px !important",
  height: "50.59px",
  padding: "12px 60px",
  borderRadius: "8px",
  textAlign: "center",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontWeight: 700,
  fontSize: "16px",
  letterSpacing: "0.32px",
  textTransform: "none" as const,
  margin: "0 15px",
  "&:hover": {
    background: "transparent",
  },
};

const StyledButton = styled(LoadingButton)({
  ...baseButtonStyles,
  background: "#FFF",
  border: "1px solid #000",
  color: "#000",
});

const StyledGreenButton = styled(LoadingButton)({
  ...baseButtonStyles,
  color: "#fff",
  borderColor: "#26B893",
  background: "#1B8369",
});

type Props = {
  open: boolean;
  submissionID: string;
  initialValue: string;
  onCancel: () => void;
  onSave: (newName: string) => void;
};

const EditSubmissionNameDialog: React.FC<Props> = ({
  open,
  submissionID,
  initialValue,
  onCancel,
  onSave,
}) => {
  const [newName, setNewName] = useState<string>(initialValue);
  const [error, setError] = useState("");
  const { enqueueSnackbar } = useSnackbar();

  const [updateSubmissionName] = useMutation<UpdateNameResponse, UpdateNameInput>(
    UPDATE_SUBMISSION_NAME,
    {
      context: { clientName: "backend" },
      fetchPolicy: "no-cache",
    }
  );

  useEffect(() => {
    if (open) {
      setNewName(initialValue);
      setError("");
    }
  }, [open, initialValue]);

  const handleSave = async () => {
    let errorMsg = "";
    if (!newName.trim()) {
      errorMsg = "Submission name is required.";
    }
    if (errorMsg) {
      setError(errorMsg);
      enqueueSnackbar(errorMsg, { variant: "error", autoHideDuration: 4000 });
      return;
    }

    try {
      await updateSubmissionName({
        variables: {
          _id: submissionID,
          name: newName.trim(),
        },
      });
      onSave(newName.trim());
    } catch (err) {
      enqueueSnackbar("An error occurred while changing the submission name.", {
        variant: "error",
        autoHideDuration: 4000,
      });
      setError("Failed to update submission name.");
    }
  };

  return (
    <StyledDialog
      open={open}
      onClose={onCancel}
      data-testid="edit-submission-name-dialog"
      aria-labelledby="edit-submission-name-dialog-header"
    >
      <StyledCloseDialogButton
        onClick={onCancel}
        data-testid="edit-submission-name-dialog-close-icon"
        aria-label="Close dialog"
      >
        <CloseIconSvg />
      </StyledCloseDialogButton>
      <DefaultDialogContent>
        <Box
          sx={{
            width: "484px",
            height: "86px",
            mb: "45px",
          }}
        >
          <StyledTitle data-testid="edit-submission-name-dialog-title">DATA SUBMISSION</StyledTitle>
          <DefaultDialogHeader
            id="edit-submission-name-dialog-header"
            variant="h1"
            sx={{ mt: "5px" }}
            data-testid="edit-submission-name-dialog-header"
          >
            Update
            <br />
            Data Submission Name
          </DefaultDialogHeader>
        </Box>
        <Box
          sx={{
            width: "484px",
            height: "68px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <StyledLabel sx={{ textAlign: "left" }} htmlFor="edit-submission-name-dialog-input">
            Submission Name
          </StyledLabel>
          <StyledOutlinedInput
            id="edit-submission-name-dialog-input"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            data-testid="edit-submission-name-dialog-input"
            inputProps={{ maxLength: 100 }}
            error={!!error}
            required
          />
          {error && (
            <StyledHelperText error={!!error} data-testid="edit-submission-name-dialog-error">
              {error}
            </StyledHelperText>
          )}
        </Box>
      </DefaultDialogContent>
      <StyledDialogActions>
        <StyledButton
          variant="outlined"
          onClick={onCancel}
          data-testid="edit-submission-name-dialog-cancel-button"
        >
          Cancel
        </StyledButton>
        <StyledGreenButton
          variant="contained"
          onClick={handleSave}
          data-testid="edit-submission-name-dialog-save-button"
        >
          Save
        </StyledGreenButton>
      </StyledDialogActions>
    </StyledDialog>
  );
};

export default EditSubmissionNameDialog;
