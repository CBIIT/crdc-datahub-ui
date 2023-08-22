export type FormMode = "Unauthorized" | "Edit" | "View Only" | "Review";

export const EditStatuses = ["New", "In Progress", "Rejected"];
export const ReviewStatuses = ["Submitted", "In Review"];
export const FormModes = {
  UNAUTHORIZED: "Unauthorized",
  EDIT: "Edit",
  VIEW_ONLY: "View Only",
  REVIEW: "Review",
} as const;

/**
 * Calculate the form mode for a user
 * NOTE:
 *  - This is a private helper function for getFormMode
 *
 * @param {User} user - The current user
 * @param {Application} data - The current application/submission
 * @returns {FormMode} - Form mode corresponding to the given form status and user.
 */
const _getFormModeForUser = (
  user: User,
  data: Application
): FormMode => {
  if (user?.role !== "User" && user?.role !== "Submitter") {
    return FormModes.UNAUTHORIZED;
  }

  const { status: formStatus } = data || {};
  const formBelongsToUser = data?.applicant?.applicantID === user?.["_id"];
  const isStatusViewOnlyForUser = ["Submitted", "In Review", "Approved"].includes(formStatus);

  if (formStatus !== "New" && !formBelongsToUser) {
    return FormModes.UNAUTHORIZED;
  }
  if (isStatusViewOnlyForUser) {
    return FormModes.VIEW_ONLY;
  }
  if (EditStatuses.includes(formStatus)) {
    return FormModes.EDIT;
  }
  return FormModes.UNAUTHORIZED;
};

/**
 * Calculate the form mode for a Federal Lead
 * NOTE:
 *  - This is a private helper function for getFormMode
 *
 * @param {User} user - The current user
 * @param {Application} data - The current application/submission
 * @returns {FormMode} - Form mode corresponding to the given form status for a Federal Lead.
 */
const _getFormModeForFederalLead = (
  user: User,
  data: Application
): FormMode => {
  if (user?.role !== "FederalLead") {
    return FormModes.UNAUTHORIZED;
  }

  const { status: formStatus } = data || {};

  if (ReviewStatuses.includes(formStatus)) {
    return FormModes.REVIEW;
  }

  return FormModes.VIEW_ONLY;
};

/**
 * Calculate the form mode for an Organization Owner
 * NOTE:
 *  - This is a private helper function for getFormMode
 *
 * @param {User} user - The current user
 * @param {Application} data - The current application/submission
 * @returns {FormMode} - Form mode corresponding to the given form status and organization owner.
 */
const _getFormModeForOrgOwner = (
  user: User,
  data: Application
): FormMode => {
  if (user.role !== "Owner") {
    return FormModes.UNAUTHORIZED;
  }

  const { status: formStatus } = data || {};
  const formBelongsToUser = data?.applicant?.applicantID === user?.["_id"];
  const isStatusViewOnlyForOrgOwner = ["Submitted", "In Review", "Approved"].includes(formStatus);

  if (!formBelongsToUser || isStatusViewOnlyForOrgOwner) {
    return FormModes.VIEW_ONLY;
  }
  if (EditStatuses.includes(formStatus)) {
    return FormModes.EDIT;
  }
  return FormModes.UNAUTHORIZED;
};

/**
 * Get updated form mode based on role, organization role, and form status
 * NOTE:
 * - Depends on the following private helper functions:
 *    _getFormModeForUser,
 *    _getFormModeForFederalLead,
 *    _getFormModeForOrgOwner
 *
 * @param {User} user - The current user
 * @param {Application} data - The current application/submission
 * @returns {FormMode} - Updated form mode based on role, organization role, and form status
 */
export const getFormMode = (
  user: User,
  data: Application,
): FormMode => {
  if (!user?.role || !data) {
    return FormModes.UNAUTHORIZED;
  }

  if (user.role === "FederalLead") {
    return _getFormModeForFederalLead(user, data);
  }
  if (user.role === "Admin") {
    return FormModes.VIEW_ONLY;
  }
  if (user.role === "Owner") {
    return _getFormModeForOrgOwner(user, data);
  }
  if (user.role === "User" || user.role === "Submitter") {
    return _getFormModeForUser(user, data);
  }
  // Any other authorized user
  if (user.role) {
    return FormModes.VIEW_ONLY;
  }

  return FormModes.UNAUTHORIZED;
};
