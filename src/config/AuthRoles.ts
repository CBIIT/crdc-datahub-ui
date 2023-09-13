/**
 * Defines a list of valid roles that can be assigned to a user.
 *
 * NOTE: Must be updated with the User type.
 *
 * @type {User["role"][]}
 */
export const Roles: User["role"][] = [
  "User",
  "Submitter",
  "Organization Owner",
  "Federal Lead",
  "Data Curator",
  "Data Commons POC",
  "Admin",
  // TODO: Disabled in MVP-1
  // "Concierge",
  // "DC_OWNER",
];

/**
 * Defines a list of roles in which an account
 * IS REQUIRED TO BE ASSIGNED TO AN ORGANIZATION.
 *
 * @type {User["role"][]}
 */
export const OrgRequiredRoles: User["role"][] = [
  "Submitter",
  "Organization Owner",
];
