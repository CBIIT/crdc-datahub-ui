import { LoadingButton } from "@mui/lab";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogProps,
  DialogTitle,
  styled,
} from "@mui/material";
import { FC } from "react";

const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    maxWidth: "451px",
    borderRadius: "8px",
    border: "1px solid #E25C22",
    background: "#EDF0F1",
    boxShadow: "0px 4px 10px 0px rgba(0, 0, 0, 0.15)",
  },
});

const StyledDialogTitle = styled(DialogTitle)({
  color: "#E25C22",
  fontSize: "15px",
  fontFamily: "'Inter', 'Rubik', sans-serif",
  fontStyle: "normal",
  fontWeight: "700",
  lineHeight: "normal",
  padding: "18px 15px 10px",
});

const StyledDialogContent = styled(DialogContent)({
  padding: "0 15px 18px",
});

const StyledDialogContentText = styled(DialogContentText)({
  color: "#000000",
  fontSize: "15px",
  fontFamily: "'Inter', 'Rubik', sans-serif",
  fontStyle: "normal",
  fontWeight: "400",
  lineHeight: "normal",
});

const StyledDialogActions = styled(DialogActions)({
  fontSize: "15px",
  fontFamily: "'Inter', 'Rubik', sans-serif",
  fontStyle: "normal",
  fontWeight: "400",
  lineHeight: "normal",
  padding: "0 15px 10px",
});

type Props = {
  title?: string;
  message?: string;
  disableActions?: boolean;
  onCancel?: () => void;
  onSave?: () => void;
  onDiscard?: () => void;
} & DialogProps;

const UnsavedChangesDialog: FC<Props> = ({
  title,
  message,
  disableActions,
  onCancel,
  onSave,
  onDiscard,
  open,
  ...rest
}) => (
  <StyledDialog open={open} {...rest}>
    <StyledDialogTitle>{title || "Unsaved Changes"}</StyledDialogTitle>
    <StyledDialogContent>
      <StyledDialogContentText>
        {message
          || "You have unsaved changes. Your changes will be lost if you leave this section without saving. Do you want to save your data?"}
      </StyledDialogContentText>
    </StyledDialogContent>
    <StyledDialogActions>
      <Button onClick={onCancel} disabled={disableActions}>
        Cancel
      </Button>
      <LoadingButton onClick={onSave} loading={disableActions} autoFocus>
        Save
      </LoadingButton>
      <Button onClick={onDiscard} disabled={disableActions} color="error">
        Discard
      </Button>
    </StyledDialogActions>
  </StyledDialog>
);

export default UnsavedChangesDialog;
