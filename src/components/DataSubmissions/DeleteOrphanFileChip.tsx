import { useMemo, useState } from "react";
import { Chip, ChipProps, styled } from "@mui/material";
import { useSnackbar } from "notistack";
import { useMutation } from "@apollo/client";
import { ReactComponent as DeleteFileIcon } from "../../assets/icons/delete_single_file_icon.svg";
import { DELETE_EXTRA_FILE, DeleteExtraFileResp } from "../../graphql";
import { useAuthContext } from "../Contexts/AuthContext";

const StyledChip = styled(Chip)({
  "&.MuiChip-root": {
    border: "1px solid #2B528B",
    background: "#2B528B",
    height: "23px",
    marginLeft: "60.5px",
    alignSelf: "center",
  },
  "& .MuiChip-icon": {
    marginLeft: "3.62px",
    marginRight: 0,
    height: "100%",
    width: "14.69px",
    alignSelf: "center",
    paddingTop: "2.65px",
    paddingBottom: "3.66px",
  },
  "& .MuiChip-label": {
    color: "#D8E3F2",
    fontFamily: "'Inter', 'Rubik', sans-serif",
    fontWeight: 400,
    fontSize: "10px",
    lineHeight: "12.1px",
    paddingLeft: "3.66px",
    paddingRight: "5px",
    paddingTop: "2px",
    paddingBottom: "3px",
  },
});

/**
 * The roles that are allowed to delete orphan files within a submission.
 *
 * @note The button is only visible to users with these roles.
 */
const DeleteOrphanFileRoles: User["role"][] = [
  "Submitter",
  "Organization Owner",
  "Data Curator",
  "Admin",
];

type Props = {
  submission: Submission;
  submittedID: QCResult["submittedID"];
  onDeleteFile: (success: boolean) => void;
} & ChipProps;

const DeleteOrphanFileChip = ({
  submission,
  submittedID,
  onDeleteFile,
  disabled,
  ...rest
}: Props) => {
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState<boolean>(false);
  const isOrphanFile = useMemo(
    () => submission?.fileErrors?.find((error) => error.submittedID === submittedID),
    [submission?.fileErrors, submittedID]
  );
  const canDeleteOrphanedFiles = useMemo(() => {
    if (
      !user?.role ||
      !DeleteOrphanFileRoles.includes(user.role) ||
      !submission?.fileErrors?.length
    ) {
      return false;
    }

    return true;
  }, [user, submission]);

  const [deleteExtraFile] = useMutation<DeleteExtraFileResp>(DELETE_EXTRA_FILE, {
    context: { clientName: "backend" },
    fetchPolicy: "no-cache",
  });

  const deleteOrphanFile = async () => {
    setLoading(true);

    try {
      const { data: d, errors } = await deleteExtraFile({
        variables: {
          _id: submission._id,
          fileName: submittedID,
        },
      });

      if (errors || !d?.deleteExtraFile?.success) {
        throw new Error("Unable to delete orphan file.");
      }

      enqueueSnackbar("The orphaned file has been successfully deleted.", {
        variant: "success",
      });

      onDeleteFile(true);
    } catch (err) {
      enqueueSnackbar("There was an issue deleting orphaned file.", {
        variant: "error",
      });
      onDeleteFile(false);
    } finally {
      setLoading(false);
    }
  };

  if (!isOrphanFile) {
    return null;
  }

  return (
    <StyledChip
      icon={<DeleteFileIcon data-testid="delete-orphaned-file-icon" />}
      label="Delete orphaned file"
      onClick={deleteOrphanFile}
      disabled={loading || disabled || !canDeleteOrphanedFiles}
      aria-label="Delete orphaned file"
      data-testid="delete-orphaned-file-chip"
      {...rest}
    />
  );
};

export default DeleteOrphanFileChip;
