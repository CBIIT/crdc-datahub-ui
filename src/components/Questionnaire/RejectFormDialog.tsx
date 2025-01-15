import { LoadingButton } from "@mui/lab";
import { Button, DialogProps, styled } from "@mui/material";
import { FC, useState } from "react";
import Dialog from "../Shared/Dialog";
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
  disableActions?: boolean;
  loading?: boolean;
  onCancel?: () => void;
  onSubmit?: (reviewComment: string) => void;
} & DialogProps;

const RejectFormDialog: FC<Props> = ({
  title,
  message,
  disableActions,
  loading,
  onCancel,
  onSubmit,
  open,
  onClose,
  ...rest
}) => {
  const [reviewComment, setReviewComment] = useState("");

  const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event?.target?.value || "";
    setReviewComment(val);
  };

  const handleOnCancel = () => {
    if (typeof onCancel === "function") {
      onCancel();
    }
    setReviewComment("");
  };

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      title={title || "Reject Submission Request"}
      actions={
        <>
          <Button onClick={handleOnCancel} disabled={disableActions}>
            Cancel
          </Button>
          <LoadingButton
            onClick={() => onSubmit(reviewComment)}
            loading={loading}
            disabled={!reviewComment || disableActions}
            autoFocus
          >
            Confirm to Reject
          </LoadingButton>
        </>
      }
      {...rest}
    >
      <TextInput
        id="review-comment"
        name="reviewComment"
        value={reviewComment}
        onChange={handleCommentChange}
        maxLength={500}
        placeholder="500 characters allowed"
        minRows={5}
        maxRows={10}
        required
        multiline
        resize
        sx={{ paddingY: "16px" }}
      />
    </StyledDialog>
  );
};

export default RejectFormDialog;
