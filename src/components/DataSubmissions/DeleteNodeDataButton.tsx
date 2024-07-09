import { memo, useState } from "react";
import { isEqual } from "lodash";
import { IconButton, IconButtonProps, styled } from "@mui/material";
import { useSnackbar } from "notistack";
import { useMutation } from "@apollo/client";
import { ReactComponent as DeleteAllFilesIcon } from "../../assets/icons/delete_all_files_icon.svg";
import StyledFormTooltip from "../StyledFormComponents/StyledTooltip";
import DeleteDialog from "../DeleteDialog";
import { useSubmissionContext } from "../Contexts/SubmissionContext";
import { DELETE_DATA_RECORDS, DeleteDataRecordsInput, DeleteDataRecordsResp } from "../../graphql";
import { titleCase } from "../../utils";

const StyledIconButton = styled(IconButton)(({ disabled }) => ({
  opacity: disabled ? 0.26 : 1,
}));

const StyledTooltip = styled(StyledFormTooltip)({
  "& .MuiTooltip-tooltip": {
    color: "#000000",
  },
});

type Props = {
  /**
   * The name of the node type currently selected
   */
  nodeType: string;
  /**
   * An array of the selected node IDs
   */
  selectedItems: string[];
  /**
   * Optional callback function for when successful deletion occurs
   */
  onDelete?: () => void;
} & Omit<IconButtonProps, "onClick">;

const DeleteNodeDataButton = ({ nodeType, selectedItems, disabled, onDelete, ...rest }: Props) => {
  const { enqueueSnackbar } = useSnackbar();
  const { data } = useSubmissionContext();
  const { _id } = data?.getSubmission || {};

  const [loading, setLoading] = useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);

  const [deleteDataRecords] = useMutation<DeleteDataRecordsResp, DeleteDataRecordsInput>(
    DELETE_DATA_RECORDS,
    {
      context: { clientName: "backend" },
    }
  );

  const onClickIcon = async () => {
    setConfirmOpen(true);
  };

  const onCloseDialog = async () => {
    setConfirmOpen(false);
  };

  const onConfirmDialog = async () => {
    try {
      const { data: d, errors } = await deleteDataRecords({
        variables: {
          _id,
          nodeType,
          nodeIds: selectedItems,
        },
      });

      if (errors || !d?.deleteDataRecords?.success) {
        throw new Error("Unable to delete selected nodes.");
      }

      setConfirmOpen(false);
      onDelete?.();
    } catch (err) {
      enqueueSnackbar("An error occurred while deleting the selected nodes.", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StyledTooltip
        title="Delete all selected nodes from this data submission"
        placement="top"
        data-testid="delete-node-data-tooltip"
      >
        <span>
          <StyledIconButton
            onClick={onClickIcon}
            disabled={loading || disabled || selectedItems.length === 0}
            aria-label="Delete nodes icon"
            data-testid="delete-node-data-button"
            {...rest}
          >
            <DeleteAllFilesIcon />
          </StyledIconButton>
        </span>
      </StyledTooltip>
      <DeleteDialog
        open={confirmOpen}
        header={`Delete ${titleCase(nodeType)}(s)`}
        description={`You have selected to delete ${selectedItems.length} ${nodeType}${
          selectedItems.length !== 1 ? "(s)" : ""
        }. Are you sure you want to delete them and their associated children from this data submission?`}
        confirmText="Confirm"
        closeText="Cancel"
        onConfirm={onConfirmDialog}
        onClose={onCloseDialog}
      />
    </>
  );
};

export default memo<Props>(DeleteNodeDataButton, isEqual);
