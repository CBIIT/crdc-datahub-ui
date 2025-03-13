import { FC, memo, useCallback, useEffect, useMemo, useState } from "react";
import { isEqual } from "lodash";
import { IconButton, IconButtonProps, styled } from "@mui/material";
import { useSnackbar } from "notistack";
import { useMutation } from "@apollo/client";
import { ReactComponent as CogIcon } from "../../assets/icons/cog_icon.svg";
import DeleteDialog from "../DeleteDialog";
import { useAuthContext } from "../Contexts/AuthContext";
import StyledFormTooltip from "../StyledFormComponents/StyledTooltip";
import { CANCEL_APP, CancelAppInput, CancelAppResp } from "../../graphql";
import { listAvailableModelVersions, Logger } from "../../utils";
import { hasPermission } from "../../config/AuthPermissions";
import { useSubmissionContext } from "../Contexts/SubmissionContext";

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

  const [cancelApp] = useMutation<CancelAppResp, CancelAppInput>(CANCEL_APP, {
    context: { clientName: "backend" },
    fetchPolicy: "no-cache",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [options, setOptions] = useState<string[]>([]);

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

  const onConfirmDialog = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Migrate to the change model version API
      const { data: d, errors } = await cancelApp({
        variables: { _id, reviewComments: "placeholder" },
      });

      if (errors || !d?.cancelApplication?._id) {
        throw new Error(errors?.[0]?.message || "Unknown API error");
      }

      updateQuery((prev) => ({
        ...prev,
        getSubmission: {
          ...prev.getSubmission,
          status: "Canceled", // TODO: change this to model version
        },
      }));
      setConfirmOpen(false);
    } catch (err) {
      Logger.error("CancelApplicationButton: API error received", err);
      enqueueSnackbar(`Oops! Unable to cancel that Submission Request`, { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [cancelApp, enqueueSnackbar]);

  useEffect(() => {
    if (!canSeeButton || !confirmOpen) {
      return;
    }

    listAvailableModelVersions(dataCommons).then((versions) => {
      setOptions(versions);
    });
  }, [canSeeButton, confirmOpen, dataCommons]);

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
      <DeleteDialog
        scroll="body"
        open={confirmOpen}
        header="Change Data Model Version"
        description={
          <div>
            <p>
              Changing the model version for an in-progress submission may require rerunning
              validation to ensure alignment with the selected version.
            </p>
            {options.map((option) => (
              <div key={option}>
                {option} {option === modelVersion ? "***" : ""}
              </div>
            ))}
          </div>
        }
        confirmText="Save"
        onConfirm={onConfirmDialog}
        confirmButtonProps={{ color: "success" }}
        onClose={onCloseDialog}
        closeText="Cancel"
      />
    </>
  );
};

export default memo<Props>(ModelSelection, isEqual);
