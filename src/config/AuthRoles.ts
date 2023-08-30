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
  "ORG_OWNER",
  "FederalLead",
  // "Concierge",
  "Curator",
  "DC_OWNER",
  // "DC_POC",
  "Admin",
];

/**
 * Defines a list of roles in which an account
 * IS ALLOWED TO BE ASSIGNED TO AN ORGANIZATION.
 *
 * @type {User["role"][]}
 */
export const OrgAllowedRoles: User["role"][] = [
  "Submitter",
  "ORG_OWNER",
];
