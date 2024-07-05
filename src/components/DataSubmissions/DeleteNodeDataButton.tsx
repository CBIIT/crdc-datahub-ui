import { memo, useState } from "react";
import { isEqual } from "lodash";
import { IconButton, IconButtonProps, styled } from "@mui/material";
import { useSnackbar } from "notistack";
import { ReactComponent as DeleteAllFilesIcon } from "../../assets/icons/delete_all_files_icon.svg";
import StyledFormTooltip from "../StyledFormComponents/StyledTooltip";
import DeleteDialog from "../DeleteDialog";
import { useSubmissionContext } from "../Contexts/SubmissionContext";

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
} & Omit<IconButtonProps, "onClick">;

const DeleteNodeDataButton = ({ nodeType, selectedItems, disabled, ...rest }: Props) => {
  const { enqueueSnackbar } = useSnackbar();
  const { data, refetch } = useSubmissionContext();
  const { _id } = data?.getSubmission || {};

  const [loading, setLoading] = useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);

  const onClickIcon = async () => {
    setConfirmOpen(true);
  };

  const onCloseDialog = async () => {
    setConfirmOpen(false);
  };

  const onConfirmDialog = async () => {
    // TODO: Implement delete functionality
    // if failure, show snackbar error
    // if success refetch data
    setLoading(false);
    setConfirmOpen(false);
    refetch();
    enqueueSnackbar(`placeholder ${_id}`, { variant: "error" });
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
        title={`Remove ${nodeType} Data`}
        description={`You have selected to delete ${selectedItems.length} ${nodeType}(s). Are you sure you want to remove them and their associated children from this data submission?`}
        confirmText="Confirm"
        closeText="Cancel"
        onConfirm={onConfirmDialog}
        onClose={onCloseDialog}
      />
    </>
  );
};

export default memo<Props>(DeleteNodeDataButton, isEqual);
