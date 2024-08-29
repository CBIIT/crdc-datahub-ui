/**
 * Defines a list of valid user roles.
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
 * Defines a list of roles that are required to have an
 * organization assigned to them. This unlocks the org dropdown.
 *
 * @type {User["role"][]}
 */
export const OrgRequiredRoles: User["role"][] = [
  "Submitter",
  "Organization Owner",
  "Data Commons POC",
];

/**
 * A map of the roles that are required to be pre-assigned
 * to a specific organization in the database. This locks the org dropdown.
 *
 * NOTE: This depends on the organizations existing in the database.
 */
type RoleSubset = Extends<User["role"], "Admin" | "Data Curator" | "Federal Lead">;
export const OrgAssignmentMap: Record<RoleSubset, Organization["name"]> = {
  Admin: "FNL",
  "Data Curator": "FNL",
  "Federal Lead": "NCI",
};

/**
 * Defines a list of roles that are allowed to interact with Cross Validation.
 */
export const CrossValidateRoles: User["role"][] = ["Admin", "Data Curator"];

/**
 * Defines a list of roles that are allowed to generate an API token.
 *
 * @note This also directly defines the roles that are allowed to generate a CLI config.
 */
export const GenerateApiTokenRoles: User["role"][] = ["Organization Owner", "Submitter"];
