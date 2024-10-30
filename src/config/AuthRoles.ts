/**
 * Defines a list of valid user roles that can be assigned to a user.
 *
 * @see {@link UserRole}
 */
export const Roles: UserRole[] = [
  "User",
  "Submitter",
  "Organization Owner",
  "Federal Monitor",
  "Federal Lead",
  "Data Curator",
  "Data Commons POC",
  "Admin",
];

/**
 * Defines a list of roles that are required to have an
 * organization assigned to them. This unlocks the Organization assignment dropdown.
 */
export const OrgRequiredRoles: UserRole[] = ["Submitter", "Organization Owner", "Data Commons POC"];

/**
 * A map of the roles that are required to be pre-assigned
 * to a specific organization in the database. This locks the Organization assignment dropdown.
 *
 * @note This requires that an organization with the specified name exists in the database.
 */
type RoleSubset = Extends<UserRole, "Admin" | "Federal Lead" | "Federal Monitor">;
export const OrgAssignmentMap: Record<RoleSubset, string> = {
  Admin: "FNL",
  "Federal Lead": "NCI",
  "Federal Monitor": "NCI",
};

/**
 * Defines a list of roles that are allowed to interact with regular Validation.
 */
export const ValidateRoles: UserRole[] = [
  "Submitter",
  "Organization Owner",
  "Data Curator",
  "Admin",
];

/**
 * Defines a list of roles that are allowed to interact with Cross Validation.
 */
export const CrossValidateRoles: UserRole[] = ["Admin", "Data Curator"];

/**
 * Defines a list of roles that can, at a minimum, view profiles of other users.
 */
export const CanManageUsers: UserRole[] = ["Admin", "Organization Owner"];

/**
 * Defines a list of roles that are allowed to generate an API token.
 *
 * @note This also directly defines the roles that are allowed to generate a CLI config.
 */
export const GenerateApiTokenRoles: User["role"][] = ["Organization Owner", "Submitter"];

/**
 * Defines a list of roles that are allowed to interact with the Operation Dashboard.
 */
export const DashboardRoles: UserRole[] = [
  "Admin",
  "Data Curator",
  "Federal Lead",
  "Federal Monitor",
];

/**
 * Defines a list of roles that are allowed to submit a Data Submission
 */
export const SubmitDataSubmissionRoles: UserRole[] = [
  "Submitter",
  "Organization Owner",
  "Data Curator",
  "Admin",
];

/**
 * Defines a list of roles that are allowed to view Data Submissions
 * outside of their organization
 */
export const canViewOtherOrgRoles: UserRole[] = [
  "Admin",
  "Data Commons POC",
  "Data Curator",
  "Federal Lead",
  "Federal Monitor",
];

/**
 * Defines a list of roles that can modify collaborators in a Data Submission
 */
export const canModifyCollaboratorsRoles: UserRole[] = ["Submitter", "Organization Owner"];

/**
 * The users with permission to delete data nodes from a submission.
 *
 */
export const canDeleteDataNodesRoles: UserRole[] = [
  "Submitter",
  "Organization Owner",
  "Data Curator",
  "Admin",
];

/**
 * Defines a list of roles that can upload metadata to a Data Submission
 */
export const canUploadMetadataRoles: UserRole[] = ["Submitter", "Organization Owner"];
