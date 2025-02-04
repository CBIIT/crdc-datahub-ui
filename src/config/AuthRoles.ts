/**
 * Defines a list of valid user roles that can be assigned to a user.
 *
 * @note This list is rendered in the UI exactly as ordered here, without additional sorting.
 * @see {@link UserRole}
 */
export const Roles: UserRole[] = [
  "User",
  "Submitter",
  "Data Commons Personnel",
  "Federal Lead",
  "Admin",
];

/**
 * A set of roles that are constrained to a set of studies.
 */
export const RequiresStudiesAssigned: UserRole[] = ["Submitter", "Federal Lead"];

/**
 * A set of roles that are constrained to only be able to submit their own
 * Submission Request forms and cannot submit on behalf of other users.
 */
export const CanSubmitOnlyTheirOwnSubmissionRequestRoles: UserRole[] = ["User", "Submitter"];
