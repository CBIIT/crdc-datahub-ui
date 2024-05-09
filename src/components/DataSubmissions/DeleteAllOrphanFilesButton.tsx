import { useMemo, useState } from "react";
import { IconButton, IconButtonProps, styled } from "@mui/material";
import { useSnackbar } from "notistack";
import { useMutation } from "@apollo/client";
import { ReactComponent as DeleteAllFilesIcon } from "../../assets/icons/delete_all_files_icon.svg";
import { DELETE_ALL_ORPHANED_FILES, DeleteAllOrphanedFilesResp } from "../../graphql";
import StyledFormTooltip from "../StyledFormComponents/StyledTooltip";
import DeleteDialog from "../../content/dataSubmissions/DeleteDialog";
import { useAuthContext } from "../Contexts/AuthContext";

const StyledIconButton = styled(IconButton)(({ disabled }) => ({
  opacity: disabled ? 0.26 : 1,
}));

const StyledTooltip = styled(StyledFormTooltip)({
  "& .MuiTooltip-tooltip": {
    color: "#000000",
  },
});

/**
 * The roles that are allowed to delete all orphan files within a submission.
 *
 * @note The button is only visible to users with these roles.
 */
const DeleteAllOrphanFileRoles: User["role"][] = [
  "Submitter",
  "Organization Owner",
  "Data Curator",
  "Admin",
];

type Props = {
  submission: Submission;
  onDelete: (success: boolean) => void;
} & IconButtonProps;

const DeleteAllOrphanFilesButton = ({ submission, onDelete, disabled, ...rest }: Props) => {
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState<boolean>(false);
  const [openDeleteAllDialog, setOpenDeleteAllDialog] = useState<boolean>(false);
  const canDeleteOrphanedFiles = useMemo(() => {
    if (
      !user?.role ||
      !DeleteAllOrphanFileRoles.includes(user.role) ||
      !submission?.fileErrors?.length
    ) {
      return false;
    }

    return true;
  }, [user, submission]);

  const [deleteAllOrphanedFiles] = useMutation<DeleteAllOrphanedFilesResp>(
    DELETE_ALL_ORPHANED_FILES,
    {
      context: { clientName: "backend" },
      fetchPolicy: "no-cache",
    }
  );

  const handleClick = async () => {
    setOpenDeleteAllDialog(true);
  };

  const onCloseDeleteDialog = async () => {
    setOpenDeleteAllDialog(false);
  };

  const handleOnDelete = async () => {
    setLoading(true);

    try {
      const { data: d, errors } = await deleteAllOrphanedFiles({
        variables: {
          _id: submission._id,
        },
      });

      if (errors || !d?.deleteAllOrphanedFiles?.success) {
        throw new Error("Unable to delete all orphaned files.");
      }
      enqueueSnackbar("All orphaned files have been successfully deleted.", {
        variant: "success",
      });

      onDelete(true);
    } catch (err) {
      enqueueSnackbar("There was an issue deleting all orphaned files.", {
        variant: "error",
      });
      onDelete(false);
    } finally {
      setLoading(false);
      setOpenDeleteAllDialog(false);
    }
  };

  return (
    <>
      <StyledTooltip
        title="Delete All Orphaned Files"
        placement="top"
        aria-label="Delete all orphaned files tooltip"
        data-testid="delete-all-orphaned-files-tooltip"
      >
        <span>
          <StyledIconButton
            onClick={handleClick}
            disabled={loading || disabled || !canDeleteOrphanedFiles}
            aria-label="Delete all orphan files"
            data-testid="delete-all-orphan-files-button"
            {...rest}
          >
            <DeleteAllFilesIcon data-testid="delete-all-orphan-files-icon" />
          </StyledIconButton>
        </span>
      </StyledTooltip>
      <DeleteDialog
        open={openDeleteAllDialog}
        onClose={onCloseDeleteDialog}
        onConfirm={handleOnDelete}
        header="Delete All Orphaned Files"
        description="All uploaded data files without associate metadata will be deleted. This operation is irreversible. Are you sure you want to proceed?"
        confirmText="Confirm to Delete"
        closeText="Cancel"
      />
    </>
  );
};

export default DeleteAllOrphanFilesButton;
