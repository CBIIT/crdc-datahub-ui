import { FC, useEffect, useState } from "react";
import { Button, ButtonProps } from "@mui/material";
import { useAuthContext } from "../Contexts/AuthContext";

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
  const { crossSubmissionStatus, otherSubmissions } = submission || {};
  const { user } = useAuthContext();

  const [isValidating, setIsValidating] = useState<boolean>(crossSubmissionStatus === "Validating");

  const handleClick = async () => {
    // TODO: Initiate cross validation and handle errors
    onValidate(true);
    setIsValidating(true);
  };

  useEffect(() => {
    setIsValidating(crossSubmissionStatus === "Validating");
  }, [crossSubmissionStatus]);

  if (!user?.role || !CrossValidateRoles.includes(user.role)) {
    return null;
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isValidating || otherSubmissions?.Submitted?.length === 0}
      data-testid="cross-validate-button"
      {...props}
    >
      {crossSubmissionStatus === "Validating" ? "Validating..." : "Validate Cross-Submissions"}
    </Button>
  );
};
