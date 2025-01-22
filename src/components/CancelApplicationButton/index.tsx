import { memo, useMemo, useState } from "react";
import { isEqual } from "lodash";
import { IconButton, IconButtonProps, styled } from "@mui/material";
import { useSnackbar } from "notistack";
import { useMutation } from "@apollo/client";
import { ReactComponent as DeleteAllFilesIcon } from "../../assets/icons/delete_all_files_icon.svg";
import DeleteDialog from "../DeleteDialog";
import { useAuthContext } from "../Contexts/AuthContext";
import { CANCEL_APP, CancelAppInput, CancelAppResp } from "../../graphql";
import { Logger } from "../../utils";
import { hasPermission } from "../../config/AuthPermissions";

const StyledIconButton = styled(IconButton)(({ disabled }) => ({
  opacity: disabled ? 0.26 : 1,
}));

/**
 * The statuses of the application that can be restored from.
 */
const RESTORE_STATUSES: ApplicationStatus[] = ["Canceled", "Deleted"];

type Props = {
  /**
   * The the application to be canceled/restored
   */
  application: Application | Omit<Application, "questionnaireData">;
  /**
   * Optional callback function for when successful cancellation/restoration occurs
   */
  onCancel?: () => void;
} & Omit<IconButtonProps, "onClick">;

const CancelApplicationButton = ({ application, onCancel, disabled, ...rest }: Props) => {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const { _id, status } = application;

  const [cancelApp] = useMutation<CancelAppResp, CancelAppInput>(CANCEL_APP, {
    context: { clientName: "backend" },
    fetchPolicy: "no-cache",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);

  const isRestoreAction = useMemo<boolean>(() => RESTORE_STATUSES.includes(status), [status]);

  const textValues = useMemo(
    () => ({
      // TODO: Icon from the design
      icon: isRestoreAction ? <DeleteAllFilesIcon /> : <DeleteAllFilesIcon />,
      dialogTitle: `${isRestoreAction ? "Restore" : "Cancel"} Submission Request`,
      dialogDescription: isRestoreAction
        ? `Are you sure you want to restore the previously canceled submission request for the study listed below?`
        : `Are you sure you want to cancel the submission request for the study listed below?`,
    }),
    [status, isRestoreAction]
  );

  const onClickIcon = async () => {
    setConfirmOpen(true);
  };

  const onCloseDialog = async () => {
    setConfirmOpen(false);
  };

  const onConfirmDialog = async () => {
    try {
      const { data: d, errors } = await cancelApp({
        variables: { _id },
      });

      if (errors || !d?.cancelApplication?._id) {
        Logger.error("Failed to cancel the application", errors);
        throw new Error("Oops! Unable to cancel that Submission Request.");
      }

      setConfirmOpen(false);
      onCancel();
    } catch (err) {
      enqueueSnackbar(err, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (!hasPermission(user, "submission_request", "cancel", application)) {
    return null;
  }

  return (
    <>
      <StyledIconButton
        onClick={onClickIcon}
        disabled={loading || disabled}
        aria-label="Cancel/Restore icon"
        data-testid="cancel-restore-application-button"
        {...rest}
      >
        {textValues.icon}
      </StyledIconButton>
      <DeleteDialog
        open={confirmOpen}
        header={textValues.dialogTitle}
        description={
          <p>
            {textValues.dialogDescription}
            <br />
            <br />
            {/* TODO: technically this needs to be study name */}
            Study: {application.studyAbbreviation || "N/A"}
          </p>
        }
        confirmText="Confirm"
        closeText="Cancel"
        onConfirm={onConfirmDialog}
        onClose={onCloseDialog}
      />
    </>
  );
};

export default memo<Props>(CancelApplicationButton, isEqual);
