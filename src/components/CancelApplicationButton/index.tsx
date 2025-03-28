import { memo, useCallback, useMemo, useState } from "react";
import { isEqual } from "lodash";
import { IconButton, IconButtonProps, styled } from "@mui/material";
import { useSnackbar } from "notistack";
import { useMutation } from "@apollo/client";
import RestoreIcon from "../../assets/icons/filled_circular_back.svg?react";
import DeleteIcon from "../../assets/icons/filled_circular_delete.svg?react";
import DeleteDialog from "../DeleteDialog";
import { useAuthContext } from "../Contexts/AuthContext";
import StyledFormTooltip from "../StyledFormComponents/StyledTooltip";
import {
  CANCEL_APP,
  CancelAppInput,
  CancelAppResp,
  RESTORE_APP,
  RestoreAppInput,
  RestoreAppResp,
} from "../../graphql";
import { Logger } from "../../utils";
import { hasPermission } from "../../config/AuthPermissions";

const StyledTooltip = styled(StyledFormTooltip)({
  "& .MuiTooltip-tooltip": {
    color: "#000000",
  },
});

const StyledIconButton = styled(IconButton)(({ disabled }) => ({
  cursor: disabled ? "not-allowed" : "pointer",
  padding: "0px",
  minWidth: "unset",
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
  const { _id, status } = application || {};

  const [cancelApp] = useMutation<CancelAppResp, CancelAppInput>(CANCEL_APP, {
    context: { clientName: "backend" },
    fetchPolicy: "no-cache",
  });

  const [restoreApp] = useMutation<RestoreAppResp, RestoreAppInput>(RESTORE_APP, {
    context: { clientName: "backend" },
    fetchPolicy: "no-cache",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);

  const isRestoreAction = useMemo<boolean>(() => RESTORE_STATUSES.includes(status), [status]);

  const isFromDeletedStatus = useMemo<boolean>(() => status === "Deleted", [status]);

  const textValues = useMemo(
    () => ({
      icon: isRestoreAction ? (
        <RestoreIcon data-testid="application-restore-icon" />
      ) : (
        <DeleteIcon data-testid="application-cancel-icon" />
      ),
      tooltipText: `${isRestoreAction ? "Restore" : "Cancel"} submission request`,
      dialogTitle: `${isRestoreAction ? "Restore" : "Cancel"} Submission Request`,
      dialogDescription: isRestoreAction
        ? `Are you sure you want to restore the previously ${
            isFromDeletedStatus ? "deleted" : "canceled"
          } submission request for the study listed below?`
        : `Are you sure you want to cancel the submission request for the study listed below?`,
    }),
    [isRestoreAction]
  );

  const onClickIcon = async () => {
    setConfirmOpen(true);
  };

  const onCloseDialog = async () => {
    setConfirmOpen(false);
  };

  const onConfirmDialog = useCallback(async () => {
    setLoading(true);
    try {
      if (isRestoreAction) {
        const { data: d, errors } = await restoreApp({
          variables: { _id },
        });

        if (errors || !d?.restoreApplication?._id) {
          throw new Error(errors?.[0]?.message || "Unknown API error");
        }
      } else {
        const { data: d, errors } = await cancelApp({
          variables: { _id },
        });

        if (errors || !d?.cancelApplication?._id) {
          throw new Error(errors?.[0]?.message || "Unknown API error");
        }
      }

      setConfirmOpen(false);
      onCancel();
    } catch (err) {
      Logger.error("CancelApplicationButton: API error received", err);
      enqueueSnackbar(
        `Oops! Unable to ${isRestoreAction ? "restore" : "cancel"} that Submission Request`,
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  }, [isRestoreAction, restoreApp, cancelApp, onCancel, enqueueSnackbar]);

  if (!hasPermission(user, "submission_request", "cancel", application)) {
    return null;
  }

  return (
    <>
      <StyledTooltip
        title={textValues.tooltipText}
        placement="top"
        aria-label="Cancel/Restore action tooltip"
        data-testid="cancel-restore-application-tooltip"
        disableInteractive
        arrow
      >
        <span>
          <StyledIconButton
            onClick={onClickIcon}
            disabled={loading || disabled}
            aria-label="Cancel/Restore icon"
            data-testid="cancel-restore-application-button"
            disableRipple
            {...rest}
          >
            {textValues.icon}
          </StyledIconButton>
        </span>
      </StyledTooltip>
      <DeleteDialog
        open={confirmOpen}
        header={textValues.dialogTitle}
        description={
          <span>
            {textValues.dialogDescription}
            <br />
            <br />
            Study: {application.studyAbbreviation || "NA"}
          </span>
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
