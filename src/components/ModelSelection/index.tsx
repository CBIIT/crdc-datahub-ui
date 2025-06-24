import { useMutation } from "@apollo/client";
import { IconButton, IconButtonProps, styled } from "@mui/material";
import { isEqual } from "lodash";
import { useSnackbar } from "notistack";
import { FC, memo, useCallback, useMemo, useState } from "react";

import CogIcon from "../../assets/icons/cog_icon.svg?react";
import { hasPermission } from "../../config/AuthPermissions";
import {
  UPDATE_MODEL_VERSION,
  UpdateModelVersionInput,
  UpdateModelVersionResp,
} from "../../graphql";
import { Logger } from "../../utils";
import { useAuthContext } from "../Contexts/AuthContext";
import { useSubmissionContext } from "../Contexts/SubmissionContext";
import StyledFormTooltip from "../StyledFormComponents/StyledTooltip";

import FormDialog, { InputForm } from "./FormDialog";

const StyledTooltip = styled(StyledFormTooltip)({
  "& .MuiTooltip-tooltip": {
    color: "#000000",
  },
});

const StyledIconButton = styled(IconButton)(({ disabled }) => ({
  cursor: disabled ? "not-allowed" : "pointer",
  padding: "4px",
  minWidth: "unset",
  marginTop: "-3px",
  borderRadius: "5px",
  "&:hover": {
    backgroundColor: "#BDDDEB",
  },
}));

/**
 * The statuses of the Data Submission that qualify for model version change.
 */
const ENABLED_STATUSES: SubmissionStatus[] = ["New", "In Progress"];

type Props = Omit<IconButtonProps, "onClick">;

/**
 * Provides functionality to adjust the Data Model Version of a data submission.
 *
 * This component will handle the following:
 * - Visibility of the button based on permissions
 * - Changing the Data Model Version
 * - Updating the local cache state
 *
 * @returns The ModelSelection component
 */
const ModelSelection: FC<Props> = ({ disabled, ...rest }: Props) => {
  const { data, updateQuery } = useSubmissionContext();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();

  const { getSubmission } = data || {};
  const { _id, status, dataCommons, modelVersion } = getSubmission || {};

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
    () =>
      hasPermission(user, "data_submission", "review", getSubmission, true) &&
      ENABLED_STATUSES.includes(status) &&
      user?.dataCommons?.includes(dataCommons) &&
      user?.role === "Data Commons Personnel",
    [user, getSubmission, status, dataCommons]
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
      } catch (err) {
        Logger.error("ModelSelection: API error received", err);
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
        title="Change Data Model Version"
        placement="top"
        aria-label="Change model version tooltip"
        data-testid="change-model-version-tooltip"
        disableInteractive
        arrow
      >
        <span>
          <StyledIconButton
            onClick={onClickIcon}
            disabled={loading || disabled}
            aria-label="Change model version"
            data-testid="change-model-version-button"
            disableRipple
            {...rest}
          >
            <CogIcon />
          </StyledIconButton>
        </span>
      </StyledTooltip>
      <FormDialog
        open={confirmOpen}
        modelVersion={modelVersion}
        dataCommons={dataCommons}
        onSubmitForm={onConfirmDialog}
        onClose={onCloseDialog}
      />
    </>
  );
};

export default memo<Props>(ModelSelection, isEqual);
