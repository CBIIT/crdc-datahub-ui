export type SubmitInfo = {
  disable: boolean;
  isAdminOverride: boolean;
};

/**
 * Determines whether submit for a submission should be disabled based on its validation statuses and user role
 *
 * @param {ValidationStatus} metadataValidationStatus - The metadata validation status of the submission
 * @param {ValidationStatus} fileValidationStatus - The file validation status of the submission
 * @param {User["role"]} userRole - The role of the user
 * @returns {SubmitInfo} Info indicating whether or not to disable submit, as well as if it is due to an admin override
 */
export const shouldDisableSubmit = (
  metadataValidationStatus: ValidationStatus,
  fileValidationStatus: ValidationStatus,
  userRole: User["role"],
): SubmitInfo => {
  if (!userRole) {
    return { disable: true, isAdminOverride: false };
  }

  const isAdmin = userRole === "Admin";
  const isMissingBoth = !metadataValidationStatus && !fileValidationStatus;
  const isMissingOne = !metadataValidationStatus || !fileValidationStatus;
  const isValidating = metadataValidationStatus === "Validating" || fileValidationStatus === "Validating";
  const hasNew = metadataValidationStatus === "New" || fileValidationStatus === "New";
  const hasError = metadataValidationStatus === "Error" || fileValidationStatus === "Error";

  const isAdminOverride = isAdmin
    && !isValidating
    && !isMissingBoth
    && !hasNew
    && (hasError || isMissingOne);
  const disable = isValidating
    || isMissingBoth
    || hasNew
    || (userRole !== "Admin" && (hasError || isMissingOne));

  return { disable, isAdminOverride };
};
