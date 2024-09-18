/**
 * Object containing static content that will be used as
 * text within a tooltip. This is for tooltips within the
 * Data Submission Dashboard only.
 */
export const TOOLTIP_TEXT = {
  VALIDATION_CONTROLS: {
    VALIDATION_TYPE: {
      VALIDATE_METADATA:
        "Run validations on any metadata submission templates that have been uploaded.",
      VALIDATE_DATA_FILES: "Run validations on any data files that have been uploaded.",
      VALIDATE_BOTH:
        "Run validations on both data files and metadata submission templates that have been uploaded.",
    },
    VALIDATION_TARGET: {
      NEW_UPLOADED_DATA: "Run validations only on files that have not previously been validated.",
      ALL_UPLOADED_DATA: "Run validations on all files regardless of previous validations.",
    },
  },
  SUBMISSION_ACTIONS: {
    RELEASE: {
      DISABLED: {
        NO_CROSS_VALIDATION:
          "Multiple active data submissions detected for the same study. Please run cross-validation before releasing each submission individually.",
      },
    },
    SUBMIT: {
      DISABLED: {
        VALIDATION_RUNNING:
          "Validation is in progress. Please wait until it completes and address any issues before submitting.",
        NEW_DATA_OR_VALIDATION_ERRORS:
          "There are new data entries or validation issues that need to be resolved.",
        MISSING_DATA_FILE:
          "There are no data files for this submission. Please upload the appropriate data files and validate to enable the Submit button.",
      },
    },
  },
} as const;

export type TooltipText = typeof TOOLTIP_TEXT;