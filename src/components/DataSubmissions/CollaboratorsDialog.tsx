import { Button, Dialog, DialogProps, IconButton, Stack, Typography, styled } from "@mui/material";
import { useQuery } from "@apollo/client";
import { ReactComponent as CloseIconSvg } from "../../assets/icons/close_icon.svg";
import CollaboratorsTable from "./CollaboratorsTable";
import { useSubmissionContext } from "../Contexts/SubmissionContext";
import {
  LIST_POTENTIAL_COLLABORATORS,
  ListPotentialCollaboratorsInput,
  ListPotentialCollaboratorsResp,
} from "../../graphql";

const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    maxWidth: "none",
    width: "731px !important",
    padding: "47px 54px 74px",
    borderRadius: "8px",
    border: "2px solid #0B7F99",
    background: "linear-gradient(0deg, #F2F6FA 0%, #F2F6FA 100%), #2E4D7B",
    boxShadow: "0px 4px 45px 0px rgba(0, 0, 0, 0.40)",
  },
});

const StyledCloseDialogButton = styled(IconButton)(() => ({
  position: "absolute",
  right: "21px",
  top: "11px",
  padding: "10px",
  "& svg": {
    color: "#44627C",
  },
}));

const StyledCloseButton = styled(Button)({
  background: "#FFFFFF",
  "&.MuiButton-root": {
    minWidth: "120px",
    padding: "10px",
    fontSize: "16px",
    fontStyle: "normal",
    fontWeight: 700,
    lineHeight: "24px",
    letterSpacing: "0.32px",
    textTransform: "none",
    alignSelf: "center",
    border: "1px solid #000",
  },
});

const StyledSaveButton = styled(Button)({
  "&.MuiButton-root": {
    minWidth: "120px",
    padding: "10px",
    fontSize: "16px",
    fontStyle: "normal",
    fontWeight: 700,
    lineHeight: "24px",
    letterSpacing: "0.32px",
    textTransform: "none",
    alignSelf: "center",
    border: "1px solid #000",
  },
});

const StyledCancelButton = styled(Button)({
  "&.MuiButton-root": {
    minWidth: "120px",
    padding: "10px",
    fontSize: "16px",
    fontStyle: "normal",
    fontWeight: 700,
    lineHeight: "24px",
    letterSpacing: "0.32px",
    textTransform: "none",
    alignSelf: "center",
    border: "1px solid #000",
  },
});

const StyledHeader = styled(Typography)({
  color: "#0B7F99",
  fontFamily: "'Nunito Sans', 'Rubik', sans-serif",
  fontSize: "35px",
  fontStyle: "normal",
  fontWeight: 900,
  lineHeight: "30px",
  marginBottom: "44px",
});

const StyledDescription = styled(Typography)({
  fontSize: "16px",
  fontWeight: 400,
  lineHeight: "22px",
  marginBottom: "44px",
});

type Props = {
  header?: string;
  description?: string;
  closeText?: string;
  confirmText?: string;
  onClose: () => void;
  onConfirm: () => void;
} & Omit<DialogProps, "onClose" | "title">;

const CollaboratorsDialog = ({
  closeText = "Cancel",
  confirmText = "Confirm to Remove",
  onClose,
  onConfirm,
  open,
  ...rest
}: Props) => {
  const { data: submission } = useSubmissionContext();

  const { data: listPotentialCollaboratorsResp } = useQuery<
    ListPotentialCollaboratorsResp,
    ListPotentialCollaboratorsInput
  >(LIST_POTENTIAL_COLLABORATORS, {
    variables: { submissionID: submission?.getSubmission?._id },
    context: { clientName: "backend" },
    skip: !submission?.getSubmission?._id,
    fetchPolicy: "cache-and-network",
  });

  const handleOnSave = () => {};

  const handleOnCancel = () => {};

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      title=""
      data-testid="collaborators-dialog"
      {...rest}
    >
      <StyledCloseDialogButton
        onClick={onClose}
        aria-label="close"
        data-testid="collaborators-dialog-close-icon-button"
      >
        <CloseIconSvg />
      </StyledCloseDialogButton>
      <StyledHeader variant="h3" data-testid="collaborators-dialog-header">
        Data Submission
        <br />
        Collaborators
      </StyledHeader>
      <StyledDescription data-testid="collaborators-dialog-description">
        Lorem ipsum odor amet, consectetuer adipiscing elit. Mi dis enim per hac erat augue dolor.
        Fusce vestibulum ipsum odio eu rutrum euismod. Magna tellus leo cubilia eget potenti
        vulputate neque. Sodales felis etiam pellentesque a pretium mauris.
      </StyledDescription>

      <CollaboratorsTable
        collaborators={submission?.getSubmission?.collaborators}
        potentialCollaborators={listPotentialCollaboratorsResp?.listPotentialCollaborators ?? []}
      />

      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={2}
        marginTop="58px"
      >
        <StyledSaveButton
          variant="contained"
          color="success"
          onClick={handleOnSave}
          aria-label="Save changes button"
          data-testid="collaborators-dialog-save-button"
        >
          Save
        </StyledSaveButton>
        <StyledCancelButton
          variant="contained"
          color="error"
          onClick={handleOnCancel}
          aria-label="Cancel button"
          data-testid="collaborators-dialog-cancel-button"
        >
          Cancel
        </StyledCancelButton>
        <StyledCloseButton
          variant="contained"
          color="info"
          onClick={onClose}
          aria-label="Close button"
          data-testid="collaborators-dialog-close-button"
        >
          Close
        </StyledCloseButton>
      </Stack>
    </StyledDialog>
  );
};

export default CollaboratorsDialog;
