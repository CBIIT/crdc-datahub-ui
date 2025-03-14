import React, { FC, useEffect, useState } from "react";
import { Box, DialogProps, MenuItem, styled } from "@mui/material";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { LoadingButton } from "@mui/lab";
import { ReactComponent as CloseIconSvg } from "../../assets/icons/close_icon.svg";
import StyledLabel from "../StyledFormComponents/StyledLabel";
import StyledAsterisk from "../StyledFormComponents/StyledAsterisk";
import StyledHelperText from "../StyledFormComponents/StyledHelperText";
import StyledCloseDialogButton from "../StyledDialogComponents/StyledDialogCloseButton";
import DefaultDialog from "../StyledDialogComponents/StyledDialog";
import StyledDialogContent from "../StyledDialogComponents/StyledDialogContent";
import DefaultDialogHeader from "../StyledDialogComponents/StyledHeader";
import StyledBodyText from "../StyledDialogComponents/StyledBodyText";
import DefaultDialogActions from "../StyledDialogComponents/StyledDialogActions";
import StyledSelect from "../StyledFormComponents/StyledSelect";
import { listAvailableModelVersions } from "../../utils";

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
  version: string;
};

type Props = {
  /**
   * The Data Model (Data Commons) of the Data Submission
   */
  dataCommons: string;
  /**
   * The current Data Model Version of the Data Submission
   */
  modelVersion: string;
  /**
   * Function to handle form submission
   */
  onSubmitForm: (form: InputForm) => Promise<void>;
  /**
   * Function to handle closing the dialog
   */
  onClose: () => void;
} & Omit<DialogProps, "onClose">;

/**
 * Provides a dialog for users to change the assigned Data Model Version of a data submission.
 *
 * @returns The FormDialog component
 */
const FormDialog: FC<Props> = ({ dataCommons, modelVersion, onSubmitForm, onClose, ...rest }) => {
  const { handleSubmit, control, formState } = useForm<InputForm>({
    defaultValues: {
      version: modelVersion,
    },
  });
  const { errors, isSubmitting } = formState;

  const [options, setOptions] = useState<string[]>([modelVersion]);

  const onSubmit: SubmitHandler<InputForm> = async (form: InputForm) => {
    await onSubmitForm(form);
    onClose();
  };

  useEffect(() => {
    if (!rest?.open) {
      return;
    }

    listAvailableModelVersions(dataCommons).then((versions) => {
      setOptions(versions);
    });
  }, [dataCommons, rest?.open]);

  return (
    <StyledDialog
      onClose={onClose}
      aria-labelledby="model-version-dialog-header"
      data-testid="model-version-dialog"
      scroll="body"
      {...rest}
    >
      <StyledCloseDialogButton
        data-testid="model-version-dialog-close-icon"
        aria-label="close"
        onClick={onClose}
      >
        <CloseIconSvg />
      </StyledCloseDialogButton>
      <StyledHeader
        id="model-version-dialog-header"
        data-testid="model-version-dialog-header"
        variant="h1"
      >
        Change Data Model Version
      </StyledHeader>
      <StyledDialogContent>
        <StyledBodyText data-testid="model-version-dialog-body" variant="body1">
          Changing the model version for an in-progress submission may require rerunning validation
          to ensure alignment with the selected version.
        </StyledBodyText>
        <StyledForm>
          <Box>
            <StyledLabel id="version-input-label">
              Model Version
              <StyledAsterisk />
            </StyledLabel>
            <Controller
              name="version"
              control={control}
              rules={{ required: "This field is required" }}
              render={({ field }) => (
                <StyledSelect
                  {...field}
                  size="small"
                  MenuProps={{ disablePortal: true }}
                  data-testid="model-version-version-field"
                  inputProps={{ "aria-labelledby": "version-input-label" }}
                >
                  {options.map((version) => (
                    <MenuItem key={version} value={version}>
                      {version}
                    </MenuItem>
                  ))}
                </StyledSelect>
              )}
            />
            <StyledHelperText data-testid="model-version-dialog-error-role">
              {errors?.version?.message}
            </StyledHelperText>
          </Box>
        </StyledForm>
      </StyledDialogContent>
      <StyledDialogActions>
        <StyledButton
          data-testid="model-version-dialog-cancel-button"
          variant="contained"
          color="info"
          size="large"
          onClick={onClose}
        >
          Cancel
        </StyledButton>
        <StyledButton
          data-testid="model-version-dialog-submit-button"
          variant="contained"
          color="success"
          size="large"
          onClick={handleSubmit(onSubmit)}
          loading={isSubmitting}
        >
          Save
        </StyledButton>
      </StyledDialogActions>
    </StyledDialog>
  );
};

export default React.memo<Props>(FormDialog);
