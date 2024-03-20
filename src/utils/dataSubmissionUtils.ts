export type SubmitInfo = {
  disable: boolean;
  isAdminOverride: boolean;
};

/**
 * Determines whether submit for a submission should be disabled based on its validation statuses and user role
 *
 * @param {Submission} submission - The Data Submission
 * @param {User["role"]} userRole - The role of the user
 * @returns {SubmitInfo} Info indicating whether or not to disable submit, as well as if it is due to an admin override
 */
export const shouldDisableSubmit = (
  submission: Submission,
  userRole: User["role"],
): SubmitInfo => {
  if (!userRole) {
    return { disable: true, isAdminOverride: false };
  }
  const { metadataValidationStatus, fileValidationStatus, fileErrors } = submission;

  const isAdmin = userRole === "Admin";
  const isMissingBoth = !metadataValidationStatus && !fileValidationStatus;
  const isMissingOne = !metadataValidationStatus || !fileValidationStatus;
  const isValidating = metadataValidationStatus === "Validating" || fileValidationStatus === "Validating";
  const hasNew = metadataValidationStatus === "New" || fileValidationStatus === "New";
  const hasError = metadataValidationStatus === "Error" || fileValidationStatus === "Error";
  const hasSubmissionLevelErrors = fileErrors?.length > 0;

  const isAdminOverride = isAdmin
    && !isValidating
    && !isMissingBoth
    && !hasNew
    && !hasSubmissionLevelErrors
    && (hasError || isMissingOne);
  const disable = isValidating
    || isMissingBoth
    || hasNew
    || hasSubmissionLevelErrors
    || (userRole !== "Admin" && (hasError || isMissingOne));

  return { disable, isAdminOverride };
};
