import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { LoadingButton } from "@mui/lab";
import { Button, OutlinedInput, Stack, Typography, styled } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuthContext } from "../../components/Contexts/AuthContext";
import CustomDialog from "../../components/Shared/Dialog";
import { EXPORT_SUBMISSION, ExportSubmissionResp } from "../../graphql";

const StyledActionWrapper = styled(Stack)(() => ({
  justifyContent: "center",
  alignItems: "center",
}));

const StyledOutlinedInput = styled(OutlinedInput)(() => ({
  borderRadius: "8px",
  backgroundColor: "#fff",
  color: "#083A50",
  "& .MuiInputBase-input": {
    fontWeight: 400,
    fontSize: "16px",
    fontFamily: "'Nunito', 'Rubik', sans-serif",
    lineHeight: "19.6px",
    padding: "12px",
    height: "20px",
  },
  "&.MuiInputBase-multiline": {
    padding: "12px",
  },
  "&.MuiInputBase-multiline .MuiInputBase-input": {
    lineHeight: "25px",
    padding: 0,
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#6B7294",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    border: "1px solid #209D7D",
    boxShadow: "2px 2px 4px 0px rgba(38, 184, 147, 0.10), -1px -1px 6px 0px rgba(38, 184, 147, 0.20)",
  },
  "& .MuiInputBase-input::placeholder": {
    color: "#87878C",
    fontWeight: 400,
    opacity: 1
  },
}));

const StyledButtonBase = styled(LoadingButton)(() => ({
  display: "flex",
  width: "128px",
  height: "51px",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: "10px",
  flexShrink: 0,
  borderRadius: "8px",
  textAlign: "center",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 700,
  lineHeight: "16px",
  letterSpacing: "0.32px",
  textTransform: "initial",
  zIndex: 3,
}));

const StyledSubmitButton = styled(StyledButtonBase)(() => ({
  background: "#1D91AB",
  color: "#FFF",
  width: "fit-content",
  minWidth: "128px",
  "&:hover": {
    background: "#1A7B90",
  },
}));

const StyledReleaseButton = styled(StyledButtonBase)(() => ({
  background: "#8DC63F",
  color: "#FFF",
  "&:hover": {
    background: "#7AB32E",
  },
}));

const StyledWithdrawButton = styled(StyledButtonBase)(() => ({
  background: "#DAA520",
  color: "#FFF",
  "&:hover": {
    background: "#C8941A",
  },
}));

const StyledRejectButton = styled(StyledButtonBase)(() => ({
  background: "#D54309",
  color: "#FFF",
  "&:hover": {
    background: "#B83A07",
  },
}));

const StyledCompleteButton = styled(StyledButtonBase)(() => ({
  background: "#4CAF50",
  color: "#FFF",
  "&:hover": {
    background: "#418E46",
  },
}));

const StyledCancelButton = styled(StyledButtonBase)(() => ({
  border: "1px solid #AEAEAE",
  background: "#757D88",
  color: "#FFF",
  "&:hover": {
    background: "#5B6169",
  },
}));

const StyledArchiveButton = styled(StyledButtonBase)(() => ({
  background: "#6A5ACD",
  color: "#FFF",
  "&:hover": {
    background: "#594ABF",
  },
}));

const StyledReturnButton = styled(StyledButtonBase)(() => ({
  background: "#6A5ACD",
  color: "#FFF",
  flexDirection: "row",
  "&:hover": {
    background: "#594ABF",
  },
}));

const StyledDialog = styled(CustomDialog)({
  "& .MuiDialog-paper": {
    maxWidth: "none",
    borderRadius: "8px",
    width: "567px !important",
  },
});

const StyledDialogText = styled(Typography)({
  fontWeight: 400,
  fontSize: "16px",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  lineHeight: "19.6px",
});

export type ActiveDialog = "Submit" | "Release" | "Withdraw" | "Reject" | "Complete" | "Cancel";
type UserRole = User["role"];

type ActionConfig = {
  roles: UserRole[];
  statuses: SubmissionStatus[];
};

type ActionKey = "Submit" | "Release" | "Withdraw" | "SubmittedReject" | "ReleasedReject" | "Complete" | "Cancel" | "Archive";

const actionConfig: Record<ActionKey, ActionConfig> = {
  Submit: {
    roles: ["Submitter", "Organization Owner", "Data Curator", "Admin"],
    statuses: ["In Progress", "Withdrawn"],
  },
  Release: {
    roles: ["Data Curator", "Admin"],
    statuses: ["Submitted"],
  },
  Withdraw: {
    roles: ["Submitter", "Organization Owner"],
    statuses: ["Submitted"],
  },
  SubmittedReject: {
    roles: ["Data Curator", "Admin"],
    statuses: ["Submitted"],
  },
  ReleasedReject: {
    roles: ["Data Commons POC", "Admin"],
    statuses: ["Released"],
  },
  Complete: {
    roles: ["Data Curator", "Admin", "Data Commons POC"],
    statuses: ["Released"],
  },
  Cancel: {
    roles: ["Submitter", "Organization Owner", "Data Curator", "Admin"],
    statuses: ["New", "In Progress"],
  },
  Archive: {
    roles: ["Data Curator", "Admin"],
    statuses: ["Completed"],
  },
};

type SubmitActionButton = {
  label: "Submit" | "Admin Submit";
  disable: boolean;
};

type Props = {
  submission: Submission;
  submitActionButton: SubmitActionButton;
  onAction: (action: SubmissionAction, reviewComment?: string) => Promise<void>;
  onError: (message: string) => void;
};

const DataSubmissionActions = ({ submission, submitActionButton, onAction, onError }: Props) => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [currentDialog, setCurrentDialog] = useState<ActiveDialog | null>(null);
  const [action, setAction] = useState<SubmissionAction | null>(null);
  const [reviewComment, setReviewComment] = useState("");

  const [exportSubmission] = useMutation<ExportSubmissionResp>(EXPORT_SUBMISSION, {
    context: { clientName: 'backend' },
    fetchPolicy: 'no-cache'
  });

  const handleExportSubmission = async (): Promise<boolean> => {
    if (!submission?._id) {
      return false;
    }

    try {
      const { data: d, errors } = await exportSubmission({
        variables: {
          _id: submission._id,
        }
      });
      if (errors || !d?.exportSubmission?.success) {
        throw new Error();
      }
      return d.exportSubmission.success;
    } catch (err) {
      onError("Unable to export submission.");
    }

    return false;
  };

  const handleOnAction = async (action: SubmissionAction) => {
    if (currentDialog) {
      setCurrentDialog(null);
    }
    setAction(action);
    if (action === "Release") {
      const isExported = await handleExportSubmission();
      if (!isExported) {
        setAction(null);
        return;
      }
    }
    if (typeof onAction === "function") {
      await onAction(action, reviewComment || null);
    }
    setAction(null);
    setReviewComment("");
  };

  const onOpenDialog = (dialog: ActiveDialog) => {
    setCurrentDialog(dialog);
  };

  const onCloseDialog = () => {
    setCurrentDialog(null);
  };

  const returnToSubmissionList = () => {
    navigate("/data-submissions");
    window.scrollTo(0, 0);
  };

  const canShowAction = (actionKey: ActionKey) => {
    const config = actionConfig[actionKey];
    return config?.statuses?.includes(submission?.status) && config?.roles?.includes(user?.role);
  };

  const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event?.target?.value || "";
    setReviewComment(val);
  };

  return (
    <StyledActionWrapper direction="row" spacing={2}>
      {/* Return to Data Submission List Button */}
      <StyledReturnButton
        variant="contained"
        onClick={returnToSubmissionList}
        startIcon={<ArrowBackIcon fontSize="small" />}
        disabled={!!action}
        disableElevation
        disableRipple
        disableTouchRipple
      >
        Back
      </StyledReturnButton>
      {/* Action Buttons */}
      {canShowAction("Submit") ? (
        <StyledSubmitButton
          variant="contained"
          onClick={() => onOpenDialog("Submit")}
          loading={action === "Submit"}
          disabled={submitActionButton?.disable || (action && action !== "Submit")}
          disableElevation
          disableRipple
          disableTouchRipple
        >
          {submitActionButton?.label || "Submit"}
        </StyledSubmitButton>
      ) : null}
      {canShowAction("Release") ? (
        <StyledReleaseButton
          variant="contained"
          onClick={() => onOpenDialog("Release")}
          loading={action === "Release"}
          disabled={action && action !== "Release"}
          disableElevation
          disableRipple
          disableTouchRipple
        >
          Release
        </StyledReleaseButton>
      ) : null}
      {canShowAction("Complete") ? (
        <StyledCompleteButton
          variant="contained"
          onClick={() => onOpenDialog("Complete")}
          loading={action === "Complete"}
          disabled={action && action !== "Complete"}
          disableElevation
          disableRipple
          disableTouchRipple
        >
          Complete
        </StyledCompleteButton>
      ) : null}
      {canShowAction("Archive") ? (
        <StyledArchiveButton
          variant="contained"
          onClick={() => handleOnAction("Archive")}
          loading={action === "Archive"}
          disabled={action && action !== "Archive"}
          disableElevation
          disableRipple
          disableTouchRipple
        >
          Archive
        </StyledArchiveButton>
      ) : null}
      {canShowAction("Withdraw") ? (
        <StyledWithdrawButton
          variant="contained"
          onClick={() => onOpenDialog("Withdraw")}
          loading={action === "Withdraw"}
          disabled={action && action !== "Withdraw"}
          disableElevation
          disableRipple
          disableTouchRipple
        >
          Withdraw
        </StyledWithdrawButton>
      ) : null}
      {canShowAction("SubmittedReject") || canShowAction("ReleasedReject") ? (
        <StyledRejectButton
          variant="contained"
          onClick={() => onOpenDialog("Reject")}
          loading={action === "Reject"}
          disabled={action && action !== "Reject"}
          disableElevation
          disableRipple
          disableTouchRipple
        >
          Reject
        </StyledRejectButton>
      ) : null}
      {canShowAction("Cancel") ? (
        <StyledCancelButton
          variant="contained"
          onClick={() => onOpenDialog("Cancel")}
          loading={action === "Cancel"}
          disabled={action && action !== "Cancel"}
          disableElevation
          disableRipple
          disableTouchRipple
        >
          Cancel
        </StyledCancelButton>
      ) : null}

      {/* Submit Dialog */}
      <StyledDialog
        open={currentDialog === "Submit" && submitActionButton.label === "Submit"}
        onClose={onCloseDialog}
        title="Submit Data Submission"
        actions={(
          <>
            <Button onClick={onCloseDialog} disabled={!!action}>No</Button>
            <LoadingButton
              onClick={() => handleOnAction("Submit")}
              loading={!!action}
              color="error"
              autoFocus
            >
              Yes
            </LoadingButton>
          </>
        )}
      >
        <StyledDialogText variant="body2">
          This action will lock your submission and it will no longer accept updates
          to the data. Are you sure you want to proceed?
        </StyledDialogText>
      </StyledDialog>

      {/* Admin Submit Dialog */}
      <StyledDialog
        open={currentDialog === "Submit" && submitActionButton.label === "Admin Submit"}
        onClose={onCloseDialog}
        title="Admin Submit Data Submission"
        actions={(
          <Stack direction="row" marginTop="24px">
            <Button onClick={onCloseDialog} disabled={!!action} color="error">Cancel</Button>
            <LoadingButton
              onClick={() => handleOnAction("Submit")}
              loading={!!action}
              disabled={reviewComment?.trim()?.length <= 0}
              autoFocus
            >
              Confirm to Submit
            </LoadingButton>
          </Stack>
        )}
      >
        <StyledOutlinedInput
          value={reviewComment}
          onChange={handleCommentChange}
          placeholder="500 characters allowed*"
          inputProps={{ "aria-label": "Admin override justification" }}
          slotProps={{ input: { minLength: 1, maxLength: 500 } }}
          minRows={2}
          maxRows={2}
          multiline
          fullWidth
          required
        />
      </StyledDialog>

      {/* Release Dialog */}
      <StyledDialog
        open={currentDialog === "Release"}
        onClose={onCloseDialog}
        title="Release Data Submission"
        actions={(
          <>
            <Button onClick={onCloseDialog} disabled={!!action}>No</Button>
            <LoadingButton
              onClick={() => handleOnAction("Release")}
              loading={!!action}
              color="error"
              autoFocus
            >
              Yes
            </LoadingButton>
          </>
        )}
      >
        <StyledDialogText variant="body2">
          This action will release this submission to data commons and it can no
          longer accept changes to the data.  Are you sure you want to proceed?
        </StyledDialogText>
      </StyledDialog>

      {/* Cancel Dialog */}
      <StyledDialog
        open={currentDialog === "Cancel"}
        onClose={onCloseDialog}
        title="Cancel Data Submission"
        actions={(
          <>
            <Button onClick={onCloseDialog} disabled={!!action}>No</Button>
            <LoadingButton
              onClick={() => handleOnAction("Cancel")}
              loading={!!action}
              color="error"
              autoFocus
            >
              Yes
            </LoadingButton>
          </>
        )}
      >
        <StyledDialogText variant="body2">
          This action will remove this submission and it will no longer be
          accessible. Are you sure you want to proceed?
        </StyledDialogText>
      </StyledDialog>

      {/* Withdraw Dialog */}
      <StyledDialog
        open={currentDialog === "Withdraw"}
        onClose={onCloseDialog}
        title="Withdraw Data Submission"
        actions={(
          <>
            <Button onClick={onCloseDialog} disabled={!!action}>No</Button>
            <LoadingButton
              onClick={() => handleOnAction("Withdraw")}
              loading={!!action}
              color="error"
              autoFocus
            >
              Yes
            </LoadingButton>
          </>
        )}
      >
        <StyledDialogText variant="body2">
          This action will halt the data curation process and give control back to you
          if you wish to update the data within the submission. Are you certain you want to proceed?
        </StyledDialogText>
      </StyledDialog>

      {/* Reject Dialog */}
      <StyledDialog
        open={currentDialog === "Reject"}
        onClose={onCloseDialog}
        title="Reject Data Submission *"
        actions={(
          <Stack direction="row" marginTop="24px">
            <Button onClick={onCloseDialog} disabled={!!action}>Cancel</Button>
            <LoadingButton
              onClick={() => handleOnAction("Reject")}
              loading={!!action}
              disabled={reviewComment?.trim()?.length <= 0}
              color="error"
              autoFocus
            >
              Confirm to Reject
            </LoadingButton>
          </Stack>
        )}
      >
        <StyledOutlinedInput
          value={reviewComment}
          onChange={handleCommentChange}
          placeholder="500 characters allowed"
          minRows={2}
          maxRows={2}
          slotProps={{ input: { minLength: 1, maxLength: 500 } }}
          multiline
          fullWidth
          required
        />
      </StyledDialog>

      {/* Complete Dialog */}
      <StyledDialog
        open={currentDialog === "Complete"}
        onClose={onCloseDialog}
        title="Complete Data Submission"
        actions={(
          <>
            <Button onClick={onCloseDialog} disabled={!!action}>No</Button>
            <LoadingButton
              onClick={() => handleOnAction("Complete")}
              loading={!!action}
              color="error"
              autoFocus
            >
              Yes
            </LoadingButton>
          </>
        )}
      >
        <StyledDialogText variant="body2">
          This action will close out the submission and start close out activities.
          Are you sure you want to proceed?
        </StyledDialogText>
      </StyledDialog>
    </StyledActionWrapper>
  );
};

export default DataSubmissionActions;
