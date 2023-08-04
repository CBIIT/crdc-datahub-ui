import { LoadingButton } from "@mui/lab";
import { Button, DialogProps } from "@mui/material";
import { FC } from "react";
import Dialog from "./Dialog";

type Props = {
  title?: string;
  message?: string;
  disableActions?: boolean;
  loading?: boolean;
  onCancel?: () => void;
  onSave?: () => void;
  onDiscard?: () => void;
} & DialogProps;

const UnsavedChangesDialog: FC<Props> = ({
  title,
  message,
  disableActions,
  loading,
  onCancel,
  onSave,
  onDiscard,
  open,
  onClose,
  ...rest
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    title={title || "Unsaved Changes"}
    message={
      message
      || "You have unsaved changes. Your changes will be lost if you leave this section without saving. Do you want to save your data?"
    }
    actions={(
      <>
        <Button onClick={onCancel} disabled={disableActions}>
          Cancel
        </Button>
        <LoadingButton
          onClick={onSave}
          loading={loading}
          disabled={disableActions}
          autoFocus
        >
          Save
        </LoadingButton>
        <Button onClick={onDiscard} disabled={disableActions} color="error">
          Discard
        </Button>
      </>
    )}
    {...rest}
  />
);

export default UnsavedChangesDialog;
