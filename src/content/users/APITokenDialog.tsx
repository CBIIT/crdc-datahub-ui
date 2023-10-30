import { FC, useState } from "react";
import { Button, Dialog, DialogProps, IconButton, OutlinedInput, Stack, Typography, styled } from "@mui/material";
import { useMutation } from "@apollo/client";
import { GRANT_TOKEN, GrantTokenResp } from "../../graphql";
import GenericAlert, { AlertState } from "../../components/GenericAlert";
import { ReactComponent as CopyIconSvg } from "../../assets/icons/copy_icon.svg";
import { ReactComponent as CloseIconSvg } from "../../assets/icons/close_icon.svg";
import { useAuthContext } from "../../components/Contexts/AuthContext";

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
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: "19.6px",
  marginBottom: "58px"
});

const StyledExplanationText = styled(Typography)({
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  color: "#083A50",
  textAlign: "center",
  fontSize: "16px",
  fontStyle: "italic",
  fontWeight: 400,
  lineHeight: "19.6px",
  marginTop: "20px"
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
  fontFamily: "'Nunito', 'Rubik', sans-serif",
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
  fontFamily: "'Nunito', 'Rubik', sans-serif",
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
  marginTop: "45px"
});

const canGenerateTokenRoles: User["role"][] = ["Submitter", "Organization Owner"];

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
  const { user } = useAuthContext();

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
    if (!canGenerateTokenRoles.includes(user?.role)) {
      onGenerateTokenError();
      return;
    }

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
      <StyledHeader id="api-token-header" variant="h3">
        API Token
      </StyledHeader>
      <StyledTitle id="api-token-title" variant="h6">
        An API Token is required to utilize the Uploader CLI tool for file uploads.
        <br />
        <br />
        Each time you click the 'Create Token' button, a new token will be generated, and
        <br />
        the previous token will be invalidated. A token expires 60 days after its creation.
      </StyledTitle>
      <Stack direction={{ xs: "column", md: "row" }} spacing={1.875} justifyContent="center" alignItems="center">
        <StyledGenerateButton id="api-token-create-token-button" onClick={handleCreateToken}>
          Create Token
        </StyledGenerateButton>
        <StyledTokenInput id="api-token-input" value={tokens?.length ? "*************************************" : ""} readOnly />
        <StyledCopyTokenButton id="api-token-copy-token-button" disabled={!tokens?.length} onClick={handleCopyToken}>
          <CopyIconSvg />
        </StyledCopyTokenButton>
      </Stack>
      <StyledExplanationText id="api-token-explanation" sx={{ visibility: tokens?.length ? "visible" : "hidden" }}>
        Copy your token to the clipboard,
        <br />
        as this will be the only time you can see this token
      </StyledExplanationText>
      <StyledCloseButton id="api-token-close-button" variant="outlined" onClick={handleCloseDialog}>
        Close
      </StyledCloseButton>
    </StyledDialog>
  );
};

export default APITokenDialog;
