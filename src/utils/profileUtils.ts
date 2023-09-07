/**
 * Formats a Authentication IDP for visual display
 *
 * @param IDP the IDP to format
 * @returns formatted IDP for visual display
 */
export const formatIDP = (idp: User["IDP"]): string => {
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
 * Determines which fields are editable by the current user
 *
 * NOTE:
 * - The `organization` field means organization assignment in general,
 *   it does not mean modifying the actual organization
 * - When a `organization` is assigned, the `User.role` should be
 *   switched to `User` on save if it's not already
 *
 * @param current the authenticated user
 * @param profileOf the user whose profile is being viewed
 * @return array of editable fields derived from User type keys
 */
export const getEditableFields = (current: User, profileOf: User): (keyof User)[] => {
  const fields: (keyof User)[] = [];
  const isSelf: boolean = current._id === profileOf?._id;

  if (current.role === "Admin" && !isSelf) {
    fields.push("userStatus", "role", "organization");
  }
  if (isSelf) {
    fields.push("firstName", "lastName");
  }

  return fields;
};
