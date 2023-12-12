import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingButton } from "@mui/lab";
import { Button, Stack, Typography, styled } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuthContext } from "../../components/Contexts/AuthContext";
import CustomDialog from "../../components/Shared/Dialog";

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

type Props = {
  submission: Submission;
  disableSubmit?: boolean;
  onAction: (action: SubmissionAction) => Promise<void>;
};

const DataSubmissionActions = ({ submission, disableSubmit, onAction }: Props) => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [currentDialog, setCurrentDialog] = useState<ActiveDialog | null>(null);
  const [action, setAction] = useState<SubmissionAction | null>(null);

  const handleOnAction = async (action: SubmissionAction) => {
    if (currentDialog) {
      setCurrentDialog(null);
    }
    setAction(action);
    if (typeof onAction === "function") {
      await onAction(action);
    }
    setAction(null);
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
          disabled={disableSubmit || (action && action !== "Submit")}
          disableElevation
          disableRipple
          disableTouchRipple
        >
          Submit
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
        open={currentDialog === "Submit"}
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
        title="Reject Data Submission"
        actions={(
          <>
            <Button onClick={onCloseDialog} disabled={!!action}>No</Button>
            <LoadingButton
              onClick={() => handleOnAction("Reject")}
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
          This action will reject the submission and return control to the submitter.
          Are you sure you want to proceed?
        </StyledDialogText>
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
