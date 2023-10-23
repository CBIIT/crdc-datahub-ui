import { useState } from "react";
import { useMutation } from "@apollo/client";
import { LoadingButton } from "@mui/lab";
import { Button, Stack, Typography, styled } from "@mui/material";
import { useAuthContext } from "../../components/Contexts/AuthContext";
import CustomDialog from "../../components/Shared/Dialog";
import { SUBMISSION_ACTION, SubmissionActionResp } from "../../graphql";

const StyledActionWrapper = styled(Stack)(() => ({
  justifyContent: "center",
  alignItems: "center",
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

const StyledDialog = styled(CustomDialog)({
  "& .MuiDialog-paper": {
    maxWidth: "none",
    borderRadius: "8px",
    width: "567px !important",
  },
});

const StyledCancelText = styled(Typography)({
  fontWeight: 400,
  fontSize: "16px",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  lineHeight: "19.6px",
});

export type ActiveDialog = "Withdraw" | "Reject" | "Complete" | "Cancel";
type UserRole = User["role"];

const SubmitRoles: UserRole[] = ["Submitter", "Organization Owner", "Data Curator", "Admin", "Federal Lead"];
const ReleaseRoles: UserRole[] = ["Data Curator", "Admin", "Federal Lead"];
const WithdrawRoles: UserRole[] = ["Submitter", "Organization Owner", "Federal Lead"];
const RejectRoles: UserRole[] = ["Data Curator", "Admin", "Federal Lead"];
const CompleteRoles: UserRole[] = ["Data Curator", "Admin", "Federal Lead"];
const CancelRoles: UserRole[] = ["Submitter", "Organization Owner", "Data Curator", "Admin", "Federal Lead"];
const ArchiveRoles: UserRole[] = ["Data Curator", "Admin", "Federal Lead"];

const SubmitStatuses: SubmissionStatus[] = ["In Progress"];
const ReleaseStatuses: SubmissionStatus[] = ["Submitted"];
const WithdrawStatuses: SubmissionStatus[] = ["Submitted"];
const RejectStatuses: SubmissionStatus[] = ["Submitted"];
const CompleteStatuses: SubmissionStatus[] = ["Released"];
const CancelStatuses: SubmissionStatus[] = ["New", "In Progress"];
const ArchiveStatuses: SubmissionStatus[] = ["Completed"];

type Props = {
  submission: Submission;
  onSubmissionChange: (submission: Submission) => void;
  onError?: (error: string) => void;
};

const DataSubmissionActions = ({ submission, onSubmissionChange, onError }: Props) => {
  const { user } = useAuthContext();

  const [currentDialog, setCurrentDialog] = useState<ActiveDialog | null>(null);
  const [action, setAction] = useState<SubmissionAction | null>(null);

  const [submissionAction] = useMutation<SubmissionActionResp>(SUBMISSION_ACTION, {
    context: { clientName: 'backend' },
    fetchPolicy: 'no-cache'
  });

  const updateSubmissionAction = async (action: SubmissionAction) => {
    if (!submission?._id) {
      return;
    }

    try {
      const { data: d, errors } = await submissionAction({
        variables: {
          submissionID: submission._id,
          action
        }
      });
      if (errors || !d?.submissionAction?._id) {
        onError(`Error occurred while performing '${action}' submission action.`);
        return;
      }
      onSubmissionChange(d.submissionAction);
    } catch (err) {
      onError(`Error occurred while performing '${action}' submission action.`);
    } finally {
      setAction(null);
    }
  };

  const handleOnAction = (action: SubmissionAction) => {
    if (currentDialog) {
      setCurrentDialog(null);
    }
    setAction(action);
    updateSubmissionAction(action);
  };

  const onOpenDialog = (dialog: ActiveDialog) => {
    setCurrentDialog(dialog);
  };

  const onCloseDialog = () => {
    setCurrentDialog(null);
  };

  return (
    <StyledActionWrapper direction="row" spacing={2}>
      {/* Action Buttons */}
      {SubmitStatuses.includes(submission?.status) && SubmitRoles.includes(user?.role) ? (
        <StyledSubmitButton
          variant="contained"
          onClick={() => handleOnAction("Submit")}
          loading={action === "Submit"}
          disabled={action && action !== "Submit"} /* TODO: Post MVP2-M2 - Will be disabled if fails validation check */
          disableElevation
          disableRipple
          disableTouchRipple
        >
          Submit
        </StyledSubmitButton>
      ) : null}
      {ReleaseStatuses.includes(submission?.status) && ReleaseRoles.includes(user?.role) ? (
        <StyledReleaseButton
          variant="contained"
          onClick={() => handleOnAction("Release")}
          loading={action === "Release"}
          disabled={action && action !== "Release"}
          disableElevation
          disableRipple
          disableTouchRipple
        >
          Release
        </StyledReleaseButton>
      ) : null}
      {WithdrawStatuses.includes(submission?.status) && WithdrawRoles.includes(user?.role) ? (
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
      {RejectStatuses.includes(submission?.status) && RejectRoles.includes(user?.role) ? (
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
      {CompleteStatuses.includes(submission?.status) && CompleteRoles.includes(user?.role) ? (
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
      {ArchiveStatuses.includes(submission?.status) && ArchiveRoles.includes(user?.role) ? (
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
      {CancelStatuses.includes(submission?.status) && CancelRoles.includes(user?.role) ? (
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
        <StyledCancelText variant="body2">
          This action will remove this submission and it will no longer be
          accessible. Are you sure you want to proceed?
        </StyledCancelText>
      </StyledDialog>

      {/* Withdraw Dialog */}
      <StyledDialog
        open={currentDialog === "Withdraw"}
        onClose={onCloseDialog}
        title="Withdraw Data Submission"
        actions={(
          <>
            <Button onClick={onCloseDialog} disabled={!!action}>Cancel</Button>
            <LoadingButton
              onClick={() => handleOnAction("Withdraw")}
              loading={!!action}
              color="error"
              autoFocus
            >
              Withdraw
            </LoadingButton>
          </>
        )}
      >
        <StyledCancelText variant="body2">
          This action will stop the submission process and revert control of the
          submission to you. Are you sure you want to proceed?
        </StyledCancelText>
      </StyledDialog>

      {/* Reject Dialog */}
      <StyledDialog
        open={currentDialog === "Reject"}
        onClose={onCloseDialog}
        title="Reject Data Submission"
        actions={(
          <>
            <Button onClick={onCloseDialog} disabled={!!action}>Cancel</Button>
            <LoadingButton
              onClick={() => handleOnAction("Reject")}
              loading={!!action}
              color="error"
              autoFocus
            >
              Reject
            </LoadingButton>
          </>
        )}
      >
        <StyledCancelText variant="body2">
          This action will reject the submission and return control to the submitter. Are you sure you want to proceed?
        </StyledCancelText>
      </StyledDialog>

      {/* Complete Dialog */}
      <StyledDialog
        open={currentDialog === "Complete"}
        onClose={onCloseDialog}
        title="Complete Data Submission"
        actions={(
          <>
            <Button onClick={onCloseDialog} disabled={!!action}>Cancel</Button>
            <LoadingButton
              onClick={() => handleOnAction("Complete")}
              loading={!!action}
              color="error"
              autoFocus
            >
              Complete
            </LoadingButton>
          </>
        )}
      >
        <StyledCancelText variant="body2">
          This action will close out the submission and start close out activities.  Are you sure you want to proceed?
        </StyledCancelText>
      </StyledDialog>
    </StyledActionWrapper>
  );
};

export default DataSubmissionActions;
