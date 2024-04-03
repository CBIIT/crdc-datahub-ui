import { useState } from "react";
import { useMutation } from "@apollo/client";
import { LoadingButton } from "@mui/lab";
import {
  Button,
  OutlinedInput,
  Stack,
  Typography,
  styled,
} from "@mui/material";
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
    boxShadow:
      "2px 2px 4px 0px rgba(38, 184, 147, 0.10), -1px -1px 6px 0px rgba(38, 184, 147, 0.20)",
  },
  "& .MuiInputBase-input::placeholder": {
    color: "#87878C",
    fontWeight: 400,
    opacity: 1,
  },
}));

const StyledLoadingButton = styled(LoadingButton)(() => ({
  minWidth: "137px",
  width: "fit-content",
  padding: "10px",
  borderRadius: "8px",
  textAlign: "center",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "16px",
  fontStyle: "normal",
  lineHeight: "24px",
  letterSpacing: "0.32px",
  textTransform: "initial",
  zIndex: 3,
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

export type ActiveDialog =
  | "Submit"
  | "Release"
  | "Withdraw"
  | "Reject"
  | "Complete"
  | "Cancel";
type UserRole = User["role"];

type ActionConfig = {
  roles: UserRole[];
  statuses: SubmissionStatus[];
};

type ActionKey =
  | "Submit"
  | "Release"
  | "Withdraw"
  | "SubmittedReject"
  | "ReleasedReject"
  | "Complete"
  | "Cancel"
  | "Archive";

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

const DataSubmissionActions = ({
  submission,
  submitActionButton,
  onAction,
  onError,
}: Props) => {
  const { user } = useAuthContext();

  const [currentDialog, setCurrentDialog] = useState<ActiveDialog | null>(null);
  const [action, setAction] = useState<SubmissionAction | null>(null);
  const [reviewComment, setReviewComment] = useState("");

  const [exportSubmission] = useMutation<ExportSubmissionResp>(
    EXPORT_SUBMISSION,
    {
      context: { clientName: "backend" },
      fetchPolicy: "no-cache",
    }
  );

  const handleExportSubmission = async (): Promise<boolean> => {
    if (!submission?._id) {
      return false;
    }

    try {
      const { data: d, errors } = await exportSubmission({
        variables: {
          _id: submission._id,
        },
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
    setReviewComment("");
  };

  const canShowAction = (actionKey: ActionKey) => {
    const config = actionConfig[actionKey];
    return (
      config?.statuses?.includes(submission?.status) &&
      config?.roles?.includes(user?.role)
    );
  };

  const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event?.target?.value || "";
    setReviewComment(val);
  };

  return (
    <StyledActionWrapper direction="row" spacing={2}>
      {/* Action Buttons */}
      {canShowAction("Submit") ? (
        <StyledLoadingButton
          variant="contained"
          color="primary"
          onClick={() => onOpenDialog("Submit")}
          loading={action === "Submit"}
          disabled={
            submitActionButton?.disable || (action && action !== "Submit")
          }
        >
          {submitActionButton?.label || "Submit"}
        </StyledLoadingButton>
      ) : null}
      {canShowAction("Release") ? (
        <StyledLoadingButton
          variant="contained"
          color="primary"
          onClick={() => onOpenDialog("Release")}
          loading={action === "Release"}
          disabled={action && action !== "Release"}
        >
          Release
        </StyledLoadingButton>
      ) : null}
      {canShowAction("Complete") ? (
        <StyledLoadingButton
          variant="contained"
          color="primary"
          onClick={() => onOpenDialog("Complete")}
          loading={action === "Complete"}
          disabled={action && action !== "Complete"}
        >
          Complete
        </StyledLoadingButton>
      ) : null}
      {canShowAction("Archive") ? (
        <StyledLoadingButton
          variant="contained"
          color="primary"
          onClick={() => handleOnAction("Archive")}
          loading={action === "Archive"}
          disabled={action && action !== "Archive"}
        >
          Archive
        </StyledLoadingButton>
      ) : null}
      {canShowAction("Withdraw") ? (
        <StyledLoadingButton
          variant="contained"
          color="error"
          onClick={() => onOpenDialog("Withdraw")}
          loading={action === "Withdraw"}
          disabled={action && action !== "Withdraw"}
        >
          Withdraw
        </StyledLoadingButton>
      ) : null}
      {canShowAction("SubmittedReject") || canShowAction("ReleasedReject") ? (
        <StyledLoadingButton
          variant="contained"
          color="error"
          onClick={() => onOpenDialog("Reject")}
          loading={action === "Reject"}
          disabled={action && action !== "Reject"}
        >
          Reject
        </StyledLoadingButton>
      ) : null}
      {canShowAction("Cancel") ? (
        <StyledLoadingButton
          variant="contained"
          color="error"
          onClick={() => onOpenDialog("Cancel")}
          loading={action === "Cancel"}
          disabled={action && action !== "Cancel"}
        >
          Cancel
        </StyledLoadingButton>
      ) : null}

      {/* Submit Dialog */}
      <StyledDialog
        open={
          currentDialog === "Submit" && submitActionButton.label === "Submit"
        }
        onClose={onCloseDialog}
        title="Submit Data Submission"
        actions={
          <>
            <Button onClick={onCloseDialog} disabled={!!action}>
              No
            </Button>
            <LoadingButton
              onClick={() => handleOnAction("Submit")}
              loading={!!action}
              color="error"
              autoFocus
            >
              Yes
            </LoadingButton>
          </>
        }
      >
        <StyledDialogText variant="body2">
          This action will lock your submission and it will no longer accept
          updates to the data. Are you sure you want to proceed?
        </StyledDialogText>
      </StyledDialog>

      {/* Admin Submit Dialog */}
      <StyledDialog
        open={
          currentDialog === "Submit" &&
          submitActionButton.label === "Admin Submit"
        }
        onClose={onCloseDialog}
        title="Admin Submit Data Submission"
        actions={
          <Stack direction="row" marginTop="24px">
            <Button onClick={onCloseDialog} disabled={!!action}>
              Cancel
            </Button>
            <LoadingButton
              onClick={() => handleOnAction("Submit")}
              loading={!!action}
              disabled={reviewComment?.trim()?.length <= 0}
              autoFocus
            >
              Confirm to Submit
            </LoadingButton>
          </Stack>
        }
      >
        <StyledOutlinedInput
          value={reviewComment}
          onChange={handleCommentChange}
          placeholder="Enter comments here. Max of 500 characters"
          inputProps={{ "aria-label": "Admin override justification" }}
          slotProps={{ input: { minLength: 1, maxLength: 500 } }}
          minRows={4}
          maxRows={4}
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
        actions={
          <>
            <Button onClick={onCloseDialog} disabled={!!action}>
              No
            </Button>
            <LoadingButton
              onClick={() => handleOnAction("Release")}
              loading={!!action}
              color="error"
              autoFocus
            >
              Yes
            </LoadingButton>
          </>
        }
      >
        <StyledDialogText variant="body2">
          This action will release this submission to data commons and it can no
          longer accept changes to the data. Are you sure you want to proceed?
        </StyledDialogText>
      </StyledDialog>

      {/* Cancel Dialog */}
      <StyledDialog
        open={currentDialog === "Cancel"}
        onClose={onCloseDialog}
        title="Cancel Data Submission"
        actions={
          <>
            <Button onClick={onCloseDialog} disabled={!!action}>
              No
            </Button>
            <LoadingButton
              onClick={() => handleOnAction("Cancel")}
              loading={!!action}
              color="error"
              autoFocus
            >
              Yes
            </LoadingButton>
          </>
        }
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
        actions={
          <>
            <Button onClick={onCloseDialog} disabled={!!action}>
              No
            </Button>
            <LoadingButton
              onClick={() => handleOnAction("Withdraw")}
              loading={!!action}
              color="error"
              autoFocus
            >
              Yes
            </LoadingButton>
          </>
        }
      >
        <StyledDialogText variant="body2">
          This action will halt the data curation process and give control back
          to you if you wish to update the data within the submission. Are you
          certain you want to proceed?
        </StyledDialogText>
      </StyledDialog>

      {/* Reject Dialog */}
      <StyledDialog
        open={currentDialog === "Reject"}
        onClose={onCloseDialog}
        title="Reject Data Submission"
        actions={
          <Stack direction="row" marginTop="24px">
            <Button onClick={onCloseDialog} disabled={!!action}>
              Cancel
            </Button>
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
        }
      >
        <StyledOutlinedInput
          value={reviewComment}
          onChange={handleCommentChange}
          placeholder="Enter comments here. Max of 500 characters"
          inputProps={{ "aria-label": "Reject justification" }}
          slotProps={{ input: { minLength: 1, maxLength: 500 } }}
          minRows={4}
          maxRows={4}
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
        actions={
          <>
            <Button onClick={onCloseDialog} disabled={!!action}>
              No
            </Button>
            <LoadingButton
              onClick={() => handleOnAction("Complete")}
              loading={!!action}
              color="error"
              autoFocus
            >
              Yes
            </LoadingButton>
          </>
        }
      >
        <StyledDialogText variant="body2">
          This action will close out the submission and start close out
          activities. Are you sure you want to proceed?
        </StyledDialogText>
      </StyledDialog>
    </StyledActionWrapper>
  );
};

export default DataSubmissionActions;
