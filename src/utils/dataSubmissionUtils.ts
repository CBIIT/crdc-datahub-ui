import { safeParse } from "./jsonUtils";

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
export const shouldDisableSubmit = (submission: Submission, userRole: User["role"]): SubmitInfo => {
  if (!userRole) {
    return { disable: true, isAdminOverride: false };
  }
  const { metadataValidationStatus, fileValidationStatus, fileErrors, intention, dataType } =
    submission;

  const isAdmin = userRole === "Admin";
  const isMissingBoth = !metadataValidationStatus && !fileValidationStatus;
  const isMissingOne = !metadataValidationStatus || !fileValidationStatus;
  const isValidating =
    metadataValidationStatus === "Validating" || fileValidationStatus === "Validating";
  const isDeleteIntention = intention === "Delete";
  const hasNew = metadataValidationStatus === "New" || fileValidationStatus === "New";
  const hasError = metadataValidationStatus === "Error" || fileValidationStatus === "Error";
  const hasSubmissionLevelErrors = fileErrors?.length > 0;
  const allowsMetadataOnly = isDeleteIntention || dataType === "Metadata Only";

  const isAdminOverride =
    isAdmin &&
    !isValidating &&
    !isMissingBoth &&
    !hasNew &&
    !hasSubmissionLevelErrors &&
    (hasError || (isMissingOne && !allowsMetadataOnly));
  const disable =
    isValidating ||
    isMissingBoth ||
    hasNew ||
    hasSubmissionLevelErrors ||
    (isDeleteIntention && !metadataValidationStatus) ||
    (userRole !== "Admin" && (hasError || (isMissingOne && !allowsMetadataOnly)));

  return { disable, isAdminOverride };
};

/**
 * Unpacks the Warning and Error severities from the original normal validation or cross validation
 * result into duplicates of the original array
 *
 * @example
 *  - Original: { severity: "error", errors: [error1, error2], warnings: [warning1, warning2] }
 *  - Unpacked: [{ severity: "error", errors: [error1] }, { severity: "error", errors: [error2] }, ...
 * @param results - The validation results to unpack
 * @returns A new array of validation results
 */
export const unpackValidationSeverities = <T extends QCResult | CrossValidationResult>(
  results: T[]
): T[] => {
  const unpackedResults: T[] = [];

  // Iterate through each result and push the errors and warnings into separate results
  results.forEach(({ errors, warnings, ...result }) => {
    errors.forEach((error) => {
      unpackedResults.push({
        ...result,
        severity: "Error",
        errors: [error],
        warnings: [],
      } as T);
    });
    warnings.forEach((warning) => {
      unpackedResults.push({
        ...result,
        severity: "Warning",
        errors: [],
        warnings: [warning],
      } as T);
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
  const link = document.createElement("a");

  link.setAttribute("download", filename);
  link.setAttribute("href", url);
  link.click();
  link.remove();
};

export type ReleaseInfo = {
  /**
   * Whether the release button should be disabled entirely
   */
  disable: boolean;
  /**
   * Whether the release button should require a special alert prior to releasing
   */
  requireAlert: boolean;
};

/**
 * Determines if a submission can be Released based on the cross-validation status and the status of
 * other submissions related to the current submission.
 *
 * @note This function DOES NOT factor these attributes into the decision, and should be handled separately:
 *    - The user's role
 *    - The submission status
 * @param submission The submission to check
 * @returns {ReleaseInfo} Whether the submission meets the cross-validation criteria to be released
 */
export const shouldDisableRelease = (submission: Submission): ReleaseInfo => {
  const { crossSubmissionStatus, otherSubmissions } = submission || {};
  const parsedSubmissions = safeParse<OtherSubmissions>(otherSubmissions);

  // Cross-validation has already occurred and passed, nothing else required
  const shortCircuitStatuses: CrossSubmissionStatus[] = ["Passed"];
  if (crossSubmissionStatus && shortCircuitStatuses.includes(crossSubmissionStatus)) {
    return { disable: false, requireAlert: false };
  }

  // Scenario 1: All other submissions are "In Progress", allow release with alert
  const hasRelatedSubmitted = parsedSubmissions?.Submitted?.length > 0;
  const hasRelatedReleased = parsedSubmissions?.Released?.length > 0;
  if (!hasRelatedSubmitted && !hasRelatedReleased && parsedSubmissions["In Progress"]?.length > 0) {
    return { disable: false, requireAlert: true };
  }

  // Scenario 2: More than one other Submitted/Released submission exists, disable release entirely
  if (hasRelatedSubmitted || hasRelatedReleased) {
    return { disable: true, requireAlert: false };
  }

  // Scenario 0: No restrictions, allow release
  return { disable: false, requireAlert: false };
};
