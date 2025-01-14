/**
 * An object containing all the tooltip text for the Questionnaire/Submission Request page.
 */
export const TOOLTIP_TEXT = {
  STATUS_DESCRIPTIONS: {
    New: "The request form was created.",
    "In Progress": "The request form was being filled out.",
    Submitted: "The request form was submitted for review.",
    Approved: "The request form was reviewed and approved. No further action is needed.",
    Rejected: "The request form was reviewed and rejected. No further action is needed.",
    Inquired: "Additional information or clarification was required from the submitter.",
    Canceled: "The request form was manually canceled by the user and is no longer active.",
    Deleted:
      "The request form was automatically deleted by the system due to inactivity and is no longer active.",
  },
} as const;

export type TooltipText = typeof TOOLTIP_TEXT;
