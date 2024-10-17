import React, { FC, useMemo } from "react";
import { Box, DialogProps, MenuItem, styled, TextField } from "@mui/material";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { LoadingButton } from "@mui/lab";
import { useMutation, useQuery } from "@apollo/client";
import { cloneDeep } from "lodash";
import { useSnackbar } from "notistack";
import { ReactComponent as CloseIconSvg } from "../../assets/icons/close_icon.svg";
import StyledOutlinedInput from "../StyledFormComponents/StyledOutlinedInput";
import StyledLabel from "../StyledFormComponents/StyledLabel";
import StyledAsterisk from "../StyledFormComponents/StyledAsterisk";
import Tooltip from "../Tooltip";
import StyledHelperText from "../StyledFormComponents/StyledHelperText";
import StyledCloseDialogButton from "../StyledDialogComponents/StyledDialogCloseButton";
import DefaultDialog from "../StyledDialogComponents/StyledDialog";
import StyledDialogContent from "../StyledDialogComponents/StyledDialogContent";
import DefaultDialogHeader from "../StyledDialogComponents/StyledHeader";
import StyledBodyText from "../StyledDialogComponents/StyledBodyText";
import DefaultDialogActions from "../StyledDialogComponents/StyledDialogActions";
import StyledSelect from "../StyledFormComponents/StyledSelect";
import { useAuthContext } from "../Contexts/AuthContext";
import StyledAutocomplete from "../StyledFormComponents/StyledAutocomplete";
import {
  LIST_ORG_NAMES,
  ListOrgNamesResp,
  REQUEST_ACCESS,
  RequestAccessInput,
  RequestAccessResp,
} from "../../graphql";
import { Logger } from "../../utils";

const StyledDialog = styled(DefaultDialog)({
  "& .MuiDialog-paper": {
    width: "803px !important",
    border: "2px solid #5AB8FF",
  },
});

const StyledForm = styled("form")({
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  margin: "0 auto",
  marginTop: "28px",
  maxWidth: "485px",
});

const StyledHeader = styled(DefaultDialogHeader)({
  color: "#1873BD",
  fontSize: "45px !important",
  marginBottom: "24px !important",
});

const StyledDialogActions = styled(DefaultDialogActions)({
  marginTop: "36px !important",
});

const StyledButton = styled(LoadingButton)({
  minWidth: "137px",
  padding: "10px",
  fontSize: "16px",
  lineHeight: "24px",
  letterSpacing: "0.32px",
});

export type InputForm = {
  role: UserRole;
  organization: string;
  additionalInfo: string;
};

type Props = {
  onClose: () => void;
} & Omit<DialogProps, "onClose">;

/**
 * Provides a dialog for users to request access to a specific role.
 *
 * @param {Props} props
 * @returns {React.FC<Props>}
 */
const FormDialog: FC<Props> = ({ onClose, ...rest }) => {
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const { handleSubmit, register, control, formState } = useForm<InputForm>({
    defaultValues: {
      // TODO: reqs say no pre-selected defaults but verbally said to pre-select user's current info
      role: ["Submitter", "Organization Owner"].includes(user.role) ? user.role : "Submitter",
      organization: user?.organization?.orgName || "",
    },
  });
  const { errors, isSubmitting } = formState;

  const { data } = useQuery<ListOrgNamesResp>(LIST_ORG_NAMES, {
    context: { clientName: "backend" },
    fetchPolicy: "cache-first",
  });

  const [requestAccess] = useMutation<RequestAccessResp, RequestAccessInput>(REQUEST_ACCESS, {
    context: { clientName: "backend" },
    fetchPolicy: "no-cache",
  });

  const sortedOrgs = useMemo<string[]>(
    () =>
      cloneDeep(data?.listOrganizations)
        ?.map(({ name }) => name)
        ?.sort((a, b) => a.localeCompare(b)) || [],
    [data]
  );

  const onSubmit: SubmitHandler<InputForm> = async (variables: InputForm) => {
    const { data, errors } = await requestAccess({ variables }).catch((e) => ({
      data: null,
      errors: e,
    }));

    if (!data?.requestAccess?.success || errors) {
      enqueueSnackbar("Unable to submit access request form. Please try again.", {
        variant: "error",
      });
      Logger.error("Unable to submit form", errors);
      return;
    }

    onClose();
  };

  return (
    <StyledDialog
      onClose={onClose}
      aria-labelledby="access-request-dialog-header"
      data-testid="access-request-dialog"
      scroll="body"
      {...rest}
    >
      <StyledCloseDialogButton
        data-testid="access-request-dialog-close-icon"
        aria-label="close"
        onClick={onClose}
      >
        <CloseIconSvg />
      </StyledCloseDialogButton>
      <StyledHeader
        id="access-request-dialog-header"
        data-testid="access-request-dialog-header"
        variant="h1"
      >
        Request Access
      </StyledHeader>
      <StyledDialogContent>
        <StyledBodyText data-testid="access-request-dialog-body" variant="body1">
          Please fill out the form below to request access.
        </StyledBodyText>
        <StyledForm>
          <Box>
            <StyledLabel id="role-input-label">
              Role
              <StyledAsterisk />
              <Tooltip
                // TODO: no requirements were given for the tooltip content
                title="TODO: we need the tooltip content"
                open={undefined}
                // TODO: hover or click? hover is consistent
                disableHoverListener={false}
                data-testid="role-input-tooltip"
              />
            </StyledLabel>
            <Controller
              name="role"
              control={control}
              rules={{ required: "This field is required" }}
              render={({ field }) => (
                <StyledSelect
                  {...field}
                  size="small"
                  MenuProps={{ disablePortal: true }}
                  inputProps={{ "aria-labelledby": "role-input-label" }}
                >
                  <MenuItem value="Submitter">Submitter</MenuItem>
                  <MenuItem value="Organization Owner">Organization Owner</MenuItem>
                </StyledSelect>
              )}
            />
            <StyledHelperText data-testid="access-request-dialog-error-role">
              {errors?.role?.message}
            </StyledHelperText>
          </Box>
          <Box>
            <StyledLabel id="organization-input-label">
              Organization
              <StyledAsterisk />
              <Tooltip
                // TODO: no requirements were given for the tooltip content
                title="TODO: we need the tooltip content"
                open={undefined}
                // TODO: hover or click? hover is consistent
                disableHoverListener={false}
                data-testid="organization-input-tooltip"
              />
            </StyledLabel>
            <Controller
              name="organization"
              control={control}
              rules={{ required: "This field is required" }}
              render={({ field }) => (
                <StyledAutocomplete
                  {...field}
                  options={sortedOrgs}
                  onChange={(_, data) => field.onChange(data)}
                  onInputChange={(_, data) => field.onChange(data)}
                  renderInput={(params) => (
                    // TODO: placeholder text is missing
                    <TextField {...params} placeholder="TODO: placeholder" />
                  )}
                  freeSolo
                />
              )}
            />
            <StyledHelperText data-testid="access-request-dialog-error-organization">
              {errors?.organization?.message}
            </StyledHelperText>
          </Box>
          <Box>
            <StyledLabel id="additionalInfo-input-label">
              Additional Info
              <Tooltip
                // TODO: no requirements were given for the tooltip content
                title="TODO: we need the tooltip content"
                open={undefined}
                // TODO: hover or click? hover is consistent
                disableHoverListener={false}
                data-testid="additionalInfo-input-tooltip"
              />
            </StyledLabel>
            <StyledOutlinedInput
              {...register("additionalInfo", {
                setValueAs: (v: string) => v?.trim(),
                maxLength: 200,
              })}
              placeholder="Maximum of 200 characters"
              data-testid="uploader-config-dialog-input-additionalInfo"
              inputProps={{ "aria-labelledby": "additionalInfo-input-label" }}
              multiline
              rows={3}
            />
            <StyledHelperText data-testid="access-request-dialog-error-additionalInfo">
              {errors?.additionalInfo?.message}
            </StyledHelperText>
          </Box>
        </StyledForm>
      </StyledDialogContent>
      <StyledDialogActions>
        <StyledButton
          data-testid="access-request-dialog-cancel-button"
          variant="contained"
          color="info"
          size="large"
          onClick={onClose}
        >
          Cancel
        </StyledButton>
        <StyledButton
          data-testid="access-request-dialog-submit-button"
          variant="contained"
          color="success"
          size="large"
          onClick={handleSubmit(onSubmit)}
          loading={isSubmitting}
        >
          Submit
        </StyledButton>
      </StyledDialogActions>
    </StyledDialog>
  );
};

export default React.memo<Props>(FormDialog);
