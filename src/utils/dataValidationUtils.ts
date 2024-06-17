/**
 * Translates the Validation Type radio to an array of types to validate.
 *
 * @param validationType The validation type selected.
 * @returns The array of types to validate.
 */
export const getValidationTypes = (validationType: ValidationType | "All"): ValidationType[] => {
  switch (validationType) {
    case "metadata":
      return ["metadata"];
    case "file":
      return ["file"];
    default:
      return ["metadata", "file"];
  }
};

/**
 * Determines the default "Validation Type" for the given data submission.
 *
 * @param dataSubmission The data submission to get the default validation type for.
 * @param user The current user.
 * @param permissionMap The map of permissions for each submission status.
 * @returns The default validation type for the given data submission.
 */
export const getDefaultValidationType = (
  dataSubmission: Submission,
  user: User,
  permissionMap: Partial<Record<Submission["status"], User["role"][]>>
): ValidationType | "All" => {
  const { role } = user || {};
  const { status, metadataValidationStatus, fileValidationStatus } = dataSubmission || {};

  if (
    status === "Submitted" &&
    permissionMap["Submitted"]?.includes(role) &&
    metadataValidationStatus &&
    fileValidationStatus
  ) {
    return "All";
  }
  if (metadataValidationStatus !== null) {
    return "metadata";
  }
  if (fileValidationStatus !== null) {
    return "file";
  }

  return "metadata";
};

/**
 * Determines the default Validation Target.
 *
 * @param dataSubmission The data submission to get the default validation type for.
 * @param user The current user.
 * @param permissionMap The map of permissions for each submission status.
 */
export const getDefaultValidationTarget = (
  dataSubmission: Submission,
  user: User,
  permissionMap: Partial<Record<Submission["status"], User["role"][]>>
): ValidationTarget => {
  const { role } = user || {};
  const { status } = dataSubmission || {};

  if (status === "Submitted" && permissionMap["Submitted"]?.includes(role)) {
    return "all";
  }

  return "new";
};
