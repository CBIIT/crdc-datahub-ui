/**
 * A set of error codes that are used to identify specific validation errors.
 */
export const ValidationErrorCodes = {
  UPDATING_DATA: "M018",
} as const;

/**
 * A type that represents the supported validation error codes.
 */
export type ValidationErrorCode = (typeof ValidationErrorCodes)[keyof typeof ValidationErrorCodes];
