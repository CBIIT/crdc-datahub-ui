import { formatName } from "./stringUtils";

/**
 * Converts a user object to a collaborator object
 *
 * @param {User} user Partial user object
 * @param {CollaboratorPermissions} permission Collaborator permission
 * @returns {Collaborator} Collaborator object
 */
export const userToCollaborator = (
  user: Partial<User>,
  permission: CollaboratorPermissions = "Can View"
): Collaborator => ({
  collaboratorID: user?._id,
  collaboratorName: formatName(user?.firstName, user?.lastName),
  permission,
  Organization: {
    orgID: user?.organization?.orgID,
    orgName: user?.organization?.orgName,
  },
});
