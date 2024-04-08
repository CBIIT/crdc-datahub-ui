import { FC, useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { ButtonProps, styled } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useSnackbar } from "notistack";
import { useAuthContext } from "../Contexts/AuthContext";
import { VALIDATE_SUBMISSION, ValidateSubmissionResp } from "../../graphql";

const StyledValidateButton = styled(LoadingButton)({
  padding: "10px",
  fontSize: "16px",
  fontStyle: "normal",
  lineHeight: "24px",
  letterSpacing: "0.32px",
  "&.MuiButtonBase-root": {
    height: "fit-content",
    minHeight: "44px",
    minWidth: "137px",
  },
});

/**
 * The roles that are allowed to cross validate a submission.
 *
 * @note The button is only visible to users with these roles.
 */
const CrossValidateRoles: User["role"][] = ["Data Curator", "Admin"];

export type Props = {
  /**
   * The full Data Submission object to initiate cross validation on.
   */
  submission: Submission;
  /**
   * Callback function called when the cross validation is initiated.
   *
   * @param success whether the validation was successfully initiated
   */
  onValidate: (success: boolean) => void;
} & Omit<ButtonProps, "onClick">;

/**
 * Handles initiating cross validation on a submission.
 *
 * This component manages the following:
 * - Who can see the button
 * - When to disable the button
 * - Dispatching the `onValidate` callback when the button is clicked
 *
 * @returns {React.FC<Props>}
 */
export const CrossValidationButton: FC<Props> = ({ submission, onValidate, ...props }) => {
  const { _id, status, crossSubmissionStatus, otherSubmissions } = submission || {};
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(crossSubmissionStatus === "Validating");

  const [validateSubmission] = useMutation<ValidateSubmissionResp>(VALIDATE_SUBMISSION, {
    context: { clientName: "backend" },
    fetchPolicy: "no-cache",
  });

  const handleClick = async () => {
    setLoading(true);

    try {
      const { data, errors } = await validateSubmission({
        variables: {
          _id,
          types: ["cross-submission"],
          scope: "All",
        },
      });

      if (errors || !data?.validateSubmission?.success) {
        throw new Error("Unable to initiate validation process.");
      }

      enqueueSnackbar(
        "Validation process is starting; this may take some time. Please wait before initiating another validation.",
        { variant: "success" }
      );
      setIsValidating(true);
      onValidate?.(true);
    } catch (error) {
      enqueueSnackbar("Unable to initiate validation process.", {
        variant: "error",
      });
      setIsValidating(false);
      onValidate?.(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsValidating(crossSubmissionStatus === "Validating");
  }, [crossSubmissionStatus]);

  if (!user?.role || !CrossValidateRoles.includes(user.role)) {
    return null;
  }

  return (
    <StyledValidateButton
      onClick={handleClick}
      loading={loading}
      disabled={
        isValidating ||
        otherSubmissions?.Submitted?.length === 0 ||
        status !== "Submitted" ||
        props.disabled
      }
      data-testid="cross-validate-button"
      {...props}
    >
      {isValidating ? "Validating..." : "Validate Cross-Submissions"}
    </StyledValidateButton>
  );
};
