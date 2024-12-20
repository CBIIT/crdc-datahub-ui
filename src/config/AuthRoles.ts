/**
 * Defines a list of valid user roles that can be assigned to a user.
 *
 * @see {@link UserRole}
 */
export const Roles: UserRole[] = [
  "User",
  "Submitter",
  "Federal Lead",
  "Admin",
  "Data Commons Personnel",
];

/**
 * A set of roles that are constrained to a set of studies.
 */
export const RequiresStudiesAssigned: UserRole[] = ["Submitter", "Federal Lead"];
