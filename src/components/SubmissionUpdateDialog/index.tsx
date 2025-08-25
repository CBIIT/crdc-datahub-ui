import { useMutation } from "@apollo/client";
import { IconButton, IconButtonProps, styled } from "@mui/material";
import { isEqual } from "lodash";
import { useSnackbar } from "notistack";
import { FC, memo, useCallback, useMemo, useState } from "react";

import { useAuthContext } from "@/components/Contexts/AuthContext";
import { useSubmissionContext } from "@/components/Contexts/SubmissionContext";
import StyledFormTooltip from "@/components/StyledFormComponents/StyledTooltip";
import { hasPermission } from "@/config/AuthPermissions";
import { UPDATE_MODEL_VERSION, UpdateModelVersionInput, UpdateModelVersionResp } from "@/graphql";
import { Logger } from "@/utils";

import FormDialog, { InputForm } from "./FormDialog";

const StyledTooltip = styled(StyledFormTooltip)({
  "& .MuiTooltip-tooltip": {
    color: "#000000",
  },
});

const StyledIconButton = styled(IconButton)(({ disabled }) => ({
  cursor: disabled ? "not-allowed" : "pointer",
  opacity: disabled ? 0.5 : 1,
  padding: "0px",
  margin: "0px",
}));

/**
 * The statuses of the Data Submission that qualify for updating
 */
const ENABLED_STATUSES: SubmissionStatus[] = ["New", "In Progress", "Rejected", "Withdrawn"];

type Props = {
  /**
   * The icon to display in the button
   */
  icon: React.ReactNode;
} & Omit<IconButtonProps, "onClick">;

/**
 * Provides functionality to adjust the Data Model Version of a data submission.
 *
 * This component will handle the following:
 * - Visibility of the button based on permissions
 * - Changing the Data Model Version
 * - Updating the local cache state
 *
 * @returns The SubmissionUpdate component
 */
const SubmissionUpdate: FC<Props> = ({ icon, disabled, ...rest }: Props) => {
  const { data, updateQuery } = useSubmissionContext();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();

  const { getSubmission } = data || {};
  const { _id, status } = getSubmission || {};

  const [updateVersion] = useMutation<UpdateModelVersionResp, UpdateModelVersionInput>(
    UPDATE_MODEL_VERSION,
    {
      context: { clientName: "backend" },
      fetchPolicy: "no-cache",
    }
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);

  const canSeeButton = useMemo<boolean>(
    () => hasPermission(user, "data_submission", "review", getSubmission, true),
    [user, getSubmission]
  );

  const isDisabled = useMemo<boolean>(
    () => !ENABLED_STATUSES.includes(status) || disabled,
    [status, disabled]
  );

  const onClickIcon = async () => {
    setConfirmOpen(true);
  };

  const onCloseDialog = async () => {
    setConfirmOpen(false);
  };

  const onConfirmDialog = useCallback(
    async ({ version }: InputForm) => {
      setLoading(true);
      try {
        const { data: d, errors } = await updateVersion({
          variables: { _id, version },
        });

        if (errors || !d?.updateSubmissionModelVersion?.modelVersion) {
          throw new Error(errors?.[0]?.message || "Unknown API error");
        }

        // TODO: Change submitter name and ID

        // TODO: Only reset validation if the model version changed
        updateQuery((prev) => ({
          ...prev,
          getSubmission: {
            ...prev.getSubmission,
            metadataValidationStatus: "New",
            fileValidationStatus: "New",
            modelVersion: d.updateSubmissionModelVersion.modelVersion,
          },
          submissionStats: {
            stats: prev.submissionStats?.stats?.map((stat) => ({
              ...stat,
              new: stat?.total || 0,
              error: 0,
              passed: 0,
              warning: 0,
            })),
          },
        }));

        // TODO: success snackbar
      } catch (err) {
        Logger.error("SubmissionUpdate: API error received", err);
        enqueueSnackbar("Oops! An error occurred while changing the model version", {
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [_id, updateVersion, enqueueSnackbar, updateQuery]
  );

  if (!canSeeButton) {
    return null;
  }

  return (
    <>
      <StyledTooltip
        title="Changes are not allowed in the current submission state."
        placement="top"
        aria-label="Update submission button tooltip"
        data-testid="update-submission-tooltip"
        disableHoverListener={!isDisabled}
        disableInteractive
        arrow
      >
        <span>
          <StyledIconButton
            onClick={onClickIcon}
            disabled={loading || isDisabled}
            aria-label="Update submission button"
            data-testid="update-submission-button"
            disableRipple
            {...rest}
          >
            {icon}
          </StyledIconButton>
        </span>
      </StyledTooltip>
      <FormDialog open={confirmOpen} onSubmitForm={onConfirmDialog} onClose={onCloseDialog} />
    </>
  );
};

export default memo<Props>(SubmissionUpdate, isEqual);
