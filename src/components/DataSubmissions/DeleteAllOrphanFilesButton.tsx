import { useState } from "react";
import { IconButton, IconButtonProps, styled } from "@mui/material";
import { useSnackbar } from "notistack";
import { useMutation } from "@apollo/client";
import { ReactComponent as DeleteAllFilesIcon } from "../../assets/icons/delete_all_files_icon.svg";
import { DELETE_ALL_EXTRA_FILES, DeleteAllExtraFilesResp } from "../../graphql";
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
} & IconButtonProps;

const DeleteAllOrphanFilesButton = ({ submission, disabled, ...rest }: Props) => {
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState<boolean>(false);
  const [openDeleteAllDialog, setOpenDeleteAllDialog] = useState<boolean>(false);

  const [deleteAllExtraFiles] = useMutation<DeleteAllExtraFilesResp>(DELETE_ALL_EXTRA_FILES, {
    context: { clientName: "backend" },
    fetchPolicy: "no-cache",
  });

  const handleClick = async () => {
    setOpenDeleteAllDialog(true);
  };

  const onCloseDeleteDialog = async () => {
    setOpenDeleteAllDialog(false);
  };

  const deleteAllOrphanedFiles = async () => {
    setLoading(true);

    try {
      const { data: d, errors } = await deleteAllExtraFiles({
        variables: {
          _id: submission._id,
        },
      });

      if (errors || !d?.deleteAllExtraFiles?.success) {
        throw new Error("Unable to delete all orphaned files.");
      }
    } catch (err) {
      enqueueSnackbar("There was an issue deleting all orphan files.", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (
    !user?.role ||
    !DeleteAllOrphanFileRoles.includes(user.role) ||
    !submission?.fileErrors?.length
  ) {
    return null;
  }

  return (
    <>
      <StyledTooltip title="Delete All Orphaned Files" placement="top">
        <span>
          <StyledIconButton
            onClick={handleClick}
            disabled={loading || disabled}
            data-testid="delete-all-orphan-files-button"
            aria-label="Delete all orphan files"
            {...rest}
          >
            <DeleteAllFilesIcon />
          </StyledIconButton>
        </span>
      </StyledTooltip>
      <DeleteDialog
        open={openDeleteAllDialog}
        onClose={onCloseDeleteDialog}
        onConfirm={deleteAllOrphanedFiles}
        header="Delete All Orphaned Files"
        description="All uploaded data files without associate metadata will be deleted. This operation is irreversible. Are you sure you want to proceed?"
      />
    </>
  );
};

export default DeleteAllOrphanFilesButton;
