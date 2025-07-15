import { useMutation } from "@apollo/client";
import { Box, Button, ButtonProps, styled } from "@mui/material";
import { isEqual } from "lodash";
import { useSnackbar } from "notistack";
import { memo, useCallback, useId, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import StyledLabel from "@/components//StyledFormComponents/StyledLabel";
import DeleteDialog from "@/components/DeleteDialog";
import Asterisk from "@/components/StyledFormComponents/StyledAsterisk";
import BaseOutlinedInput from "@/components/StyledFormComponents/StyledOutlinedInput";
import StyledFormTooltip from "@/components/StyledFormComponents/StyledTooltip";
import { REQUEST_PV, RequestPVInput, RequestPVResponse } from "@/graphql";
import { Logger } from "@/utils";

const StyledTooltip = styled(StyledFormTooltip)({
  margin: "0 !important",
  "& .MuiTooltip-tooltip": {
    color: "#000000",
  },
});

const StyledButton = styled(Button)({
  background: "#E9F1F4 !important",
  borderRadius: "8px",
  border: "2px solid #136071 !important",
  color: "#156071 !important",
  textTransform: "none",
  fontWeight: 700,
  fontSize: "16px",
  lineHeight: "19px",
});

const StyledFormBox = styled(Box)({
  marginTop: "18.5px",
});

const StyledOutlinedInput = styled(BaseOutlinedInput)({
  "& .MuiInputBase-inputMultiline": {
    resize: "vertical",
    minHeight: "125px",
    maxHeight: "375px",
  },
});

type FormFields = {
  value: string;
  comment: string;
};

type Props = {
  /**
   * An optional closure function to be called when the submit action is completed.
   */
  onSubmit?: () => void;
} & Omit<ButtonProps, "onClick">;

/**
 * Provides a button to request a new permissible value (PV) for a data submission.
 *
 * @returns The PVRequestButton component.
 */
const PVRequestButton = ({ disabled, onSubmit, ...rest }: Props) => {
  const valueFieldId = useId();
  const descriptionFieldId = useId();

  const { enqueueSnackbar } = useSnackbar();
  const {
    register,
    watch,
    formState: { isValid },
  } = useForm<FormFields>({
    mode: "onBlur",
    defaultValues: {
      value: "", // TODO: Need from API
      comment: "",
    },
  });

  const [requestPV] = useMutation<RequestPVResponse, RequestPVInput>(REQUEST_PV, {
    context: { clientName: "backend" },
    fetchPolicy: "no-cache",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);

  const confirmButtonProps = useMemo<ButtonProps>(
    () => ({
      disabled: !isValid || loading,
    }),
    [isValid, loading]
  );

  const onButtonClick = async () => {
    setConfirmOpen(true);
  };

  const onCloseDialog = async () => {
    setConfirmOpen(false);
  };

  const onConfirmDialog = useCallback(async () => {
    setLoading(true);
    try {
      const value = watch("value")?.trim();
      const comment = watch("comment")?.trim();

      const { data: d, errors } = await requestPV({
        variables: {
          submissionID: null, // TODO: Need from QC Results dropdown or submission context
          nodeName: null, // TODO: Need from QC Results dropdown
          property: null, // TODO: Need from API
          value,
          comment,
        },
      });

      if (errors || !d?.requestPV?.success) {
        throw new Error(errors?.[0]?.message || d?.requestPV?.message || "Unknown API error");
      }

      setConfirmOpen(false);
      // TODO: show success message
      onSubmit?.();
    } catch (err) {
      Logger.error("PVRequestButton: API error received", err);
      enqueueSnackbar("Oops! Unable to submit the PV request.", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [requestPV, enqueueSnackbar, onSubmit]);

  return (
    <>
      <StyledTooltip
        title="A request has already been submitted for this permissible value in this data submission."
        placement="top"
        aria-label="PV request button tooltip"
        data-testid="request-pv-tooltip"
        disableInteractive
        disableHoverListener={!disabled}
        arrow
      >
        <span>
          <StyledButton
            variant="outlined"
            color="error"
            type="button"
            onClick={onButtonClick}
            disabled={loading || disabled}
            aria-label="Request New PV"
            data-testid="request-pv-button"
            {...rest}
          >
            Request New PV
          </StyledButton>
        </span>
      </StyledTooltip>
      <DeleteDialog
        open={confirmOpen}
        header="Request New PV"
        PaperProps={{
          "aria-labelledby": "",
          "aria-label": "Request New PV",
        }}
        description={
          <div>
            Please fill out the form below to start your new PV request.
            <br />
            <br />
            <StyledFormBox>
              <StyledLabel htmlFor={valueFieldId}>
                Confirm the value you are requesting to add
                <Asterisk />
              </StyledLabel>
              <StyledOutlinedInput
                // TODO: Is this locked or editable?
                id={valueFieldId}
                data-testid="request-pv-value"
                placeholder="500 characters allowed"
                required
                inputProps={{ maxLength: 500 }}
                {...register("value", {
                  required: true,
                  maxLength: 500,
                  minLength: 1,
                })}
              />
            </StyledFormBox>
            <StyledFormBox>
              <StyledLabel htmlFor={descriptionFieldId}>
                Please provide a brief explanation or justification for the request
                <Asterisk />
              </StyledLabel>
              <StyledOutlinedInput
                id={descriptionFieldId}
                data-testid="request-pv-description"
                placeholder="500 characters allowed"
                required
                multiline
                inputProps={{ maxLength: 500 }}
                {...register("comment", {
                  required: true,
                  maxLength: 500,
                  minLength: 1,
                  setValueAs: (v) => v?.trim(),
                })}
              />
            </StyledFormBox>
          </div>
        }
        closeText="Cancel"
        onClose={onCloseDialog}
        // TODO: button shouldn't be red
        confirmText="Confirm and Submit"
        onConfirm={onConfirmDialog}
        confirmButtonProps={confirmButtonProps}
        scroll="body"
      />
    </>
  );
};

export default memo<Props>(PVRequestButton, isEqual);
