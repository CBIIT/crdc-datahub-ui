import { useState } from "react";
import { IconButton, IconButtonProps, styled } from "@mui/material";
import { useSnackbar } from "notistack";
import { useMutation } from "@apollo/client";
import { ReactComponent as DeleteAllFilesIcon } from "../../assets/icons/delete_all_files_icon.svg";
import { DELETE_ALL_EXTRA_FILES, DeleteAllExtraFilesResp } from "../../graphql";
import StyledFormTooltip from "../StyledFormComponents/StyledTooltip";
import DeleteDialog from "../../content/dataSubmissions/DeleteDialog";

const StyledIconButton = styled(IconButton)(({ disabled }) => ({
  opacity: disabled ? 0.26 : 1,
}));

const StyledTooltip = styled(StyledFormTooltip)({
  "& .MuiTooltip-tooltip": {
    color: "#000000",
  },
});

type Props = {
  submissionId: string;
} & IconButtonProps;

const DeleteAllOrphanFilesButton = ({ submissionId, disabled, ...rest }: Props) => {
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

    const { data: d, errors } = await deleteAllExtraFiles({
      variables: {
        _id: submissionId,
      },
    }).catch((e) => ({ errors: e?.message, data: null }));
    setLoading(false);

    if (errors || !d?.deleteAllExtraFiles?.success) {
      enqueueSnackbar("There was an issue deleting all orphan files.", {
        variant: "error",
      });
      setLoading(false);
      // return;
    }

    // console.log(d.deleteAllExtraFiles);
  };

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
