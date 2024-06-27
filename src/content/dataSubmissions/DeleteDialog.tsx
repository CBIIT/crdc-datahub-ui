import {
  Button,
  Dialog,
  DialogProps,
  IconButton,
  Stack,
  Typography,
  styled,
} from "@mui/material";
import { ReactComponent as CloseIconSvg } from "../../assets/icons/close_icon.svg";

const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    maxWidth: "none",
    width: "731px !important",
    padding: "47px 54px 74px",
    borderRadius: "8px",
    border: "2px solid #6B7294",
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
  "&.MuiButton-root": {
    minWidth: "101px",
    padding: "10px",
    color: "#949494",
    fontFamily: "'Nunito', 'Rubik', sans-serif",
    fontSize: "16px",
    fontStyle: "normal",
    fontWeight: 500,
    lineHeight: "24px",
    letterSpacing: "0.32px",
    textTransform: "none",
    alignSelf: "center",
  }
});

const StyledConfirmButton = styled(Button)({
  "&.MuiButton-root": {
    minWidth: "137px",
    padding: "10px",
    fontFamily: "'Nunito', 'Rubik', sans-serif",
    fontSize: "16px",
    fontStyle: "normal",
    fontWeight: 700,
    lineHeight: "24px",
    letterSpacing: "0.32px",
    textTransform: "none",
    alignSelf: "center",
  }
});

const StyledHeader = styled(Typography)({
  color: "#4B5368",
  fontFamily: "'Nunito Sans', 'Rubik', sans-serif",
  fontSize: "35px",
  fontStyle: "normal",
  fontWeight: 900,
  lineHeight: "30px",
  marginBottom: "50px",
});

const StyledDescription = styled(Typography)({
  fontFamily: "'Public Sans', sans-serif",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: "22px",
});

type Props = {
  header?: string;
  description?: string;
  closeText?: string;
  confirmText?: string;
  onClose: () => void;
  onConfirm: () => void;
} & Omit<DialogProps, "onClose">;

const DeleteDialog = ({
  header = "Remove Data",
  description,
  closeText = "Cancel",
  confirmText = "Confirm to Remove",
  onClose,
  onConfirm,
  open,
  ...rest
}: Props) => (
  <StyledDialog open={open} onClose={onClose} title="" {...rest}>
    <StyledCloseDialogButton aria-label="close" onClick={onClose}>
      <CloseIconSvg />
    </StyledCloseDialogButton>
    <StyledHeader variant="h3">{header}</StyledHeader>
    <StyledDescription>
      {description || (
        <>
          The metadata or files specified in the selected files, along with their associated child
          nodes, will be removed from this data submission, and this action is irreversible.
          <br />
          Are you sure you want to proceed?
        </>
      )}
    </StyledDescription>

    <Stack
      direction="row"
      justifyContent="center"
      alignItems="center"
      spacing={2}
      marginTop="61px"
    >
      <StyledCloseButton
        id="error-dialog-close-button"
        variant="contained"
        color="info"
        onClick={onClose}
      >
        {closeText}
      </StyledCloseButton>
      <StyledConfirmButton
        id="error-dialog-delete-button"
        variant="contained"
        color="error"
        onClick={onConfirm}
      >
        {confirmText}
      </StyledConfirmButton>
    </Stack>
  </StyledDialog>
);

export default DeleteDialog;
