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

/**
 * Unpacks the Warning and Error severities from the original QCResult into duplicates of the original QCResult
 *
 * @example
 *  - Original QCResult: { severity: "error", errors: [error1, error2], warnings: [warning1, warning2] }
 *  - Unpacked QCResults: [{ severity: "error", errors: [error1] }, { severity: "error", errors: [error2] }, ...
 * @param results - The QC results to unpack
 * @returns A new array of QCResults
 */
export const unpackQCResultSeverities = (results: QCResult[]): QCResult[] => {
  const unpackedResults: QCResult[] = [];

  // Iterate through each result and push the errors and warnings into separate results
  results.forEach((result) => {
    result.errors.slice(0).forEach((error) => {
      unpackedResults.push({
        ...result,
        severity: "Error",
        errors: [error],
        warnings: [],
      });
    });
    result.warnings.slice(0).forEach((warning) => {
      unpackedResults.push({
        ...result,
        severity: "Warning",
        errors: [],
        warnings: [warning],
      });
    });
  });

  return unpackedResults;
};

/**
 * Build a file with data and download it
 *
 * @param content file content
 * @param filename file name
 * @param contentType the content type
 * @returns void
 */
export const downloadBlob = (content: string, filename: string, contentType: string): void => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.setAttribute('download', filename);
  link.click();
  link.remove();
};
