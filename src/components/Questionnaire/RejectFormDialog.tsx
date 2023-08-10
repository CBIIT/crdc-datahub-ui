import { LoadingButton } from "@mui/lab";
import { Button, DialogProps, styled } from "@mui/material";
import { FC } from "react";
import Dialog from "./Dialog";
import TextInput from "./TextInput";

const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    maxWidth: "none",
    borderRadius: "8px",
    width: "567px !important",
  },
});

type Props = {
  title?: string;
  message?: string;
  reviewComment?: string;
  disableActions?: boolean;
  loading?: boolean;
  onReviewCommentChange?: (comment: string) => void;
  onCancel?: () => void;
  onSubmit?: () => void;
} & DialogProps;

const RejectFormDialog: FC<Props> = ({
  title,
  message,
  disableActions,
  loading,
  reviewComment,
  onReviewCommentChange,
  onCancel,
  onSubmit,
  open,
  onClose,
  ...rest
}) => {
  const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event?.target?.value || "";
    onReviewCommentChange(val);
  };

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      title={title || "Reject Application"}
      actions={(
        <>
          <Button onClick={onCancel} disabled={disableActions}>
            Cancel
          </Button>
          <LoadingButton
            onClick={onSubmit}
            loading={loading}
            disabled={!reviewComment || disableActions}
            autoFocus
          >
            Confirm to Reject
          </LoadingButton>
        </>
      )}
      {...rest}
    >
      <TextInput
        id="review-comment"
        name="reviewComment"
        value={reviewComment}
        onChange={handleCommentChange}
        maxLength={500}
        placeholder="500 characters allowed"
        required
        minRows={2}
        maxRows={2}
        multiline
        sx={{ paddingY: "16px" }}
      />
    </StyledDialog>
  );
};

export default RejectFormDialog;
