import { formatName } from "./stringUtils";

/**
 * Formats a Authentication IDP for visual display
 *
 * @param IDP the IDP to format
 * @returns formatted IDP for visual display
 */
export const formatIDP = (idp: User["IDP"]): string => {
  if (!idp || typeof idp !== "string") {
    return "";
  }

  switch (idp.toLowerCase()) {
    case "nih":
      return "NIH";
    case "login.gov":
      return "Login.gov";
    default:
      return idp;
  }
};

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

/**
 * The data structure for a columized PBAC group
 */
export type ColumnizedPBACGroups<T = unknown> = {
  /**
   * The name of the group of PBACDefaults
   *
   * All PBACDefaults in the group will have the same group name
   */
  name: string;
  /**
   * The PBACDefaults for the group
   */
  data: PBACDefault<T>[];
}[][];

/**
 * A utility function to group an array of PBACDefaults into columns
 * based on the group name.
 *
 * If colCount is greater than the number of groups, the last column will
 * aggregate the remaining groups.
 *
 * Data Structure: Array of Columns -> Array of Groups -> PBAC Defaults for the group
 *
 * @see {@link ColumnizedPBACGroups}
 * @param data The array of PBACDefaults to columnize
 * @param colCount The number of columns to create
 * @returns An array of columns containing an array of PBACDefaults
 */
export const columnizePBACGroups = <T = unknown>(
  data: PBACDefault<T>[],
  colCount = 3
): ColumnizedPBACGroups<T> => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return [];
  }

  const groupedData: Record<string, PBACDefault<T>[]> = {};
  data.forEach((item) => {
    const groupName = typeof item?.group === "string" ? item.group : "";
    if (!groupedData[groupName]) {
      groupedData[groupName] = [];
    }

    groupedData[groupName].push(item);
  });

  const columns: ColumnizedPBACGroups<T> = [];
  Object.entries(groupedData).forEach(([group, data], index) => {
    const groupIndex = index > colCount - 1 ? colCount - 1 : index;
    if (!columns[groupIndex]) {
      columns[groupIndex] = [];
    }

    columns[groupIndex].push({ name: group, data });
  });

  return columns;
};
