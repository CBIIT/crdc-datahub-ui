import { uniq } from "lodash";

/**
 * Extracts unique `entity:action` keys from an array of raw permission strings,
 * discarding any extra segments beyond the first two.
 *
 * @param {string[]} rawPermissions - Array of permission strings.
 * @returns {string[]} Array of deduplicated strings in the form `"entity:action"`.
 */
export const cleanPermissionKeys = (rawPermissions: string[]): string[] => {
  if (!rawPermissions?.length) {
    return [];
  }

  return uniq(
    rawPermissions
      ?.map((p) => p.split(":", 2).join(":"))
      ?.filter((key) => {
        const [entity, action] = key.split(":");
        return !!entity && !!action;
      })
  );
};

/**
 * Search the user permissions for a given permission with a specific entity and action.
 *
 * @param {User} user - The user with the permissions to check.
 * @param {string} permission - The permission to look for.
 * @returns {AuthPermissions | undefined} The user's AuthPermission.
 */
export const getUserPermissionKey = (user: User, permission: string): AuthPermissions | undefined =>
  user?.permissions?.find((p) => p.split(":", 2).join(":") === permission);

/**
 * Given a permission, it will parse the permission and group the extensions
 * starting at a certain point.
 *
 * @param {AuthPermissions} permission - The permission to split.
 * @param {number} startAt - The point to slice the permission from
 * @returns {string[][]} The groupings of each extension, delimited by a ':'. The delimiter indicating
 *  multiple values per extension is delimited by a '+'.
 */
export const getUserPermissionExtensions = (
  permission: AuthPermissions,
  startAt = 2
): string[][] => {
  const rawExtensions = permission?.split(":");

  if (rawExtensions?.length <= startAt) {
    return [];
  }

  return rawExtensions.slice(startAt)?.map((p) => p.split("+"));
};
