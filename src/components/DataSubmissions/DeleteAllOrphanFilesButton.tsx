import { useState } from "react";
import { IconButton, IconButtonProps } from "@mui/material";
import { useSnackbar } from "notistack";
import { useMutation } from "@apollo/client";
import { ReactComponent as DeleteAllFilesIcon } from "../../assets/icons/delete_all_files_icon.svg";
import { DELETE_ALL_EXTRA_FILES, DeleteAllExtraFilesResp } from "../../graphql";

type Props = {
  submissionId: string;
} & IconButtonProps;

const DeleteAllOrphanFilesButton = ({ submissionId, disabled, ...rest }: Props) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState<boolean>(false);

  const [deleteAllExtraFiles] = useMutation<DeleteAllExtraFilesResp>(DELETE_ALL_EXTRA_FILES, {
    context: { clientName: "backend" },
    fetchPolicy: "no-cache",
  });

  const handleClick = async () => {
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
    <IconButton
      onClick={handleClick}
      disabled={loading || disabled}
      data-testid="delete-all-orphan-files-button"
      aria-label="Delete all orphan files"
      {...rest}
    >
      <DeleteAllFilesIcon />
    </IconButton>
  );
};

export default DeleteAllOrphanFilesButton;
