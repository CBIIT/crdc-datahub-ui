/**
 * Translates the Validation Type radio to an array of types to validate.
 *
 * @param validationType The validation type selected.
 * @returns The array of types to validate.
 */
export const getValidationTypes = (
  validationType: ValidationType
): string[] => {
  switch (validationType) {
    case "Metadata":
      return ["metadata"];
    case "Files":
      return ["file"];
    default:
      return ["metadata", "file"];
  }
};

/**
 * Determines the default "Validation Type" for the given data submission.
 *
 * @param dataSubmission The data submission to get the default validation type for.
 * @returns The default validation type for the given data submission.
 */
export const getDefaultValidationType = (
  dataSubmission: Submission
): ValidationType => {
  const { metadataValidationStatus, fileValidationStatus } =
    dataSubmission || {};

  if (metadataValidationStatus !== null) {
    return "Metadata";
  }
  if (fileValidationStatus !== null) {
    return "Files";
  }

  return "Metadata";
};
