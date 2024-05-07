import { useState } from "react";
import { Chip, ChipProps, styled } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import { useSnackbar } from "notistack";
import { useMutation } from "@apollo/client";
import { DELETE_EXTRA_FILE, DeleteExtraFileResp } from "../../graphql";

const StyledChip = styled(Chip)({
  "&.MuiChip-root": {
    border: "1px solid #2B528B",
    background: "#2B528B",
    height: "21px",
    marginLeft: "60.5px",
    alignSelf: "center",
  },
  "& .MuiSvgIcon-root": {
    color: "#FFFFFF",
    fontSize: "15px",
    marginLeft: "3.65px",
  },
  "& .MuiChip-label": {
    color: "#D8E3F2",
    fontFamily: "'Inter', 'Rubik', sans-serif",
    fontWeight: 400,
    fontSize: "10px",
    lineHeight: "11px",
    paddingLeft: "8px",
    paddingRight: "5px",
  },
});

type Props = {
  submissionId: Submission["_id"];
  submittedId: QCResult["submittedID"];
  onDeleteFile: (success: boolean) => void;
} & ChipProps;

const DeleteOrphanFileButton = ({
  submissionId,
  submittedId,
  onDeleteFile,
  disabled,
  ...rest
}: Props) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState<boolean>(false);

  const [deleteExtraFile] = useMutation<DeleteExtraFileResp>(DELETE_EXTRA_FILE, {
    context: { clientName: "backend" },
    fetchPolicy: "no-cache",
  });

  const deleteOrphanFile = async () => {
    setLoading(true);

    const { data: d, errors } = await deleteExtraFile({
      variables: {
        _id: submissionId,
        fileName: submittedId,
      },
    });
    setLoading(false);

    if (errors || !d?.deleteExtraFile?.success) {
      enqueueSnackbar("There was an issue deleting orphan file.", {
        variant: "error",
      });
      // return;
    }

    onDeleteFile(d?.deleteExtraFile?.success);
  };

  return (
    <StyledChip
      icon={<CancelIcon />}
      label="Delete orphaned file"
      onClick={deleteOrphanFile}
      disabled={loading || disabled}
      {...rest}
    />
  );
};

export default DeleteOrphanFileButton;
