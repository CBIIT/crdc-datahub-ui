import { FC, useState } from "react";
import { Button, Dialog, DialogProps, IconButton, OutlinedInput, Stack, Typography, Tooltip as MuiToolTip, styled, TooltipProps } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useMutation } from "@apollo/client";
import { GRANT_TOKEN, GrantTokenResp } from "../../graphql";
import GenericAlert, { AlertState } from "../../components/GenericAlert";

const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    maxWidth: "none",
    borderRadius: "8px",
    width: "755px !important",
    padding: "70px"
  },
});

const StyledTitle = styled(Typography)({
  fontFamily: "'Nunito'",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: "19.6px",
  height: "74px"
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

const StyledCopyTokenButton = styled(StyledGenerateButton)(() => ({
  background: "#005EA2",
  color: "#FFF",
  "&:hover": {
    background: "#005EA2",
  },
  "&.MuiButton-root.Mui-disabled": {
    background: "#BDBDBD",
    color: "#ECECEC"
  }
}));

const StyledCloseDialogButton = styled(IconButton)(() => ({
  position: 'absolute',
  right: 14,
  top: 4,
  padding: "10px",
  "& svg": {
    color: "#44627C"
  }
}));

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
      setChangesAlert({ severity: "success", message: `New API token was created successfully.` });
      setTimeout(() => setChangesAlert(null), 10000);
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

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
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
        onClick={onClose}
      >
        <CloseIcon />
      </StyledCloseDialogButton>
      <StyledTitle variant="h6">
        API Tokens can be used to make API calls when using the Uploader CLI tool to upload your files. The token will expire 60 days after it's created.
      </StyledTitle>
      <Stack direction="row" spacing={2.75} justifyContent="center" alignItems="center">
        <StyledGenerateButton onClick={handleCreateToken}>
          {tokens?.length ? "Refresh Token" : "Create Token"}
        </StyledGenerateButton>
        <StyledCopyTokenButton disabled={!tokens?.length} onClick={handleCopyToken}>
          Copy Token
        </StyledCopyTokenButton>
      </Stack>
      <StyledTokenInput value={tokens?.length ? "*************************************" : ""} readOnly />
    </StyledDialog>
  );
};

export default APITokenDialog;
