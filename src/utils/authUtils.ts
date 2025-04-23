/**
 * Checks whether a user has a specific permission key by matching the
 * first two segments (resource:action) of each permission string.
 *
 * @param {User} user - The user object
 * @param {string} permission - The permission key to check, in the form "resource:action"
 * @returns {boolean} `true` if the user has at least one permission whose first two segments
 *   joined by ":" exactly equal `permission`; otherwise `false`.
 */
export const checkPermissionKey = (user: User, permission: string): boolean => {
  const permissions = user?.permissions ?? [];
  return permissions.some((p) => p.split(":", 2).join(":") === permission);
};
