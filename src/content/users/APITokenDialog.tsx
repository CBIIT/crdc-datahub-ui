import { FC, useState } from "react";
import { Button, Dialog, DialogProps, IconButton, OutlinedInput, Stack, Typography, styled } from "@mui/material";
import { useMutation } from "@apollo/client";
import { GRANT_TOKEN, GrantTokenResp } from "../../graphql";
import GenericAlert, { AlertState } from "../../components/GenericAlert";
import { ReactComponent as CopyIconSvg } from "../../assets/icons/copy_icon.svg";
import { ReactComponent as CloseIconSvg } from "../../assets/icons/close_icon.svg";

const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    maxWidth: "none",
    borderRadius: "8px",
    width: "755px !important",
    padding: "47px 59px 71px 54px"
  },
});

const StyledHeader = styled(Typography)({
  color: "#0B7F99",
  fontFamily: "'Nunito Sans', 'Rubik', sans-serif",
  fontSize: "35px",
  fontStyle: "normal",
  fontWeight: 900,
  lineHeight: "30px",
  marginBottom: "50px"
});

const StyledTitle = styled(Typography)({
  fontFamily: "'Nunito'",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: "19.6px",
  height: "74px",
  marginBottom: "58px"
});

const StyledTokenInput = styled(OutlinedInput)({
  display: "flex",
  width: "313px",
  height: "44px",
  padding: "12px 9px",
  margin: "34px auto 0",
  justifyContent: "center",
  alignItems: "center",
  gap: "10px",
  flexShrink: 0,
  background: "#FFFFFF",
  color: "#000000",
  fontFamily: "'Nunito'",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: "19.6px",
  "& .MuiOutlinedInput-notchedOutline": {
    borderRadius: "8px",
    border: "1px solid #6B7294 !important",

  }
});

const StyledGenerateButton = styled(Button)({
  display: "flex",
  width: "128px",
  height: "42px",
  padding: "12px 7px",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: "8px",
  border: "1px solid #000",
  background: "#1D91AB",
  color: "#FFFFFF",
  textAlign: "center",
  fontFamily: "'Nunito'",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 700,
  lineHeight: "24px",
  letterSpacing: "0.32px",
  textTransform: "none",
  "&:hover": {
    background: "#1D91AB",
  },
});

const StyledCopyTokenButton = styled(IconButton)(() => ({
  color: "#000000",
  "&.MuiIconButton-root.Mui-disabled": {
    color: "#B0B0B0"
  }
}));

const StyledCloseDialogButton = styled(IconButton)(() => ({
  position: 'absolute',
  right: "21px",
  top: "11px",
  padding: "10px",
  "& svg": {
    color: "#44627C"
  }
}));

const StyledCloseButton = styled(Button)({
  display: "flex",
  width: "128px",
  height: "42px",
  padding: "12px 60px",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: "8px",
  border: "1px solid #000",
  color: "#000",
  textAlign: "center",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: "700",
  lineHeight: "24px",
  letterSpacing: "0.32px",
  textTransform: "none",
  alignSelf: "center",
  marginTop: "112px"
});

type Props = {
  title?: string;
  message?: string;
  disableActions?: boolean;
  loading?: boolean;
  onClose?: () => void;
  onSubmit?: (reviewComment: string) => void;
} & Omit<DialogProps, "onClose">;

const APITokenDialog: FC<Props> = ({
  title,
  message,
  disableActions,
  loading,
  onClose,
  onSubmit,
  open,
  ...rest
}) => {
  const [tokens, setTokens] = useState<string[]>([]);
  const [tokenIdx, setTokenIdx] = useState<number | null>(null);
  const [changesAlert, setChangesAlert] = useState<AlertState>(null);

  const [grantToken] = useMutation<GrantTokenResp>(GRANT_TOKEN, {
    context: { clientName: 'userService' },
    fetchPolicy: 'no-cache'
  });

  const onGenerateTokenError = () => {
    setChangesAlert({ severity: "error", message: `Token was unable to be created.` });
    setTimeout(() => setChangesAlert(null), 10000);
  };

  const generateToken = async () => {
    try {
      const { data: d, errors } = await grantToken();
      const tokens = d?.grantToken?.tokens;
      if (errors || !tokens?.length) {
        onGenerateTokenError();
        return;
      }

      setTokens(tokens);
      setTokenIdx(0);
    } catch (err) {
      onGenerateTokenError();
    }
  };

  const handleCreateToken = () => {
    if (!tokens?.length || tokenIdx + 1 >= tokens.length) {
      generateToken();
      return;
    }
    setTokenIdx((idx) => idx++);
  };

  const handleCopyToken = () => {
    if (!tokens?.length || tokenIdx === null || tokenIdx > tokens.length) {
      return;
    }
    navigator.clipboard.writeText(tokens[tokenIdx]);
  };

  const handleCloseDialog = () => {
    if (typeof onClose === "function") {
      onClose();
    }
    setTokens(null);
    setTokenIdx(null);
    setChangesAlert(null);
  };

  return (
    <StyledDialog
      open={open}
      onClose={handleCloseDialog}
      title=""
      {...rest}
    >
      <GenericAlert open={!!changesAlert} severity={changesAlert?.severity} key="api-token-dialog-changes-alert">
        <span>
          {changesAlert?.message}
        </span>
      </GenericAlert>
      <StyledCloseDialogButton
        aria-label="close"
        onClick={handleCloseDialog}
      >
        <CloseIconSvg />
      </StyledCloseDialogButton>
      <StyledHeader variant="h3">
        API Token
      </StyledHeader>
      <StyledTitle variant="h6">
        An API Token is required to utilize the Uploader CLI tool for file uploads.
        <br />
        <br />
        Each time you click the 'Create Token' button, a new token will be generated, and the previous token will be invalidated. A token expires 60 days after its creation.
      </StyledTitle>
      <Stack direction="row" spacing={1.875} justifyContent="center" alignItems="center">
        <StyledGenerateButton onClick={handleCreateToken}>
          Create Token
        </StyledGenerateButton>
        <StyledTokenInput value={tokens?.length ? "*************************************" : ""} readOnly />
        <StyledCopyTokenButton disabled={!tokens?.length} onClick={handleCopyToken}>
          <CopyIconSvg />
        </StyledCopyTokenButton>
      </Stack>
      <StyledCloseButton variant="outlined" onClick={handleCloseDialog}>
        Close
      </StyledCloseButton>
    </StyledDialog>
  );
};

export default APITokenDialog;
