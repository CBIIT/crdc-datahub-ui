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
 *
 * @param current the authenticated user
 * @param profileOf the user whose profile is being viewed
 * @param viewType the page where the user originated from
 * @return array of editable fields derived from User type keys
 */
export const getEditableFields = (
  current: User,
  profileOf: User,
  viewType: "users" | "profile"
): (keyof User)[] => {
  const fields: (keyof User)[] = [];
  const isSelf: boolean = current._id === profileOf?._id;

  // Only allowed if a user is viewing their own profile
  if (isSelf && viewType === "profile") {
    fields.push("firstName", "lastName");
  }

  // Only allowed if an Admin is coming from Manage Users
  if (current.role === "Admin" && viewType === "users") {
    fields.push("userStatus", "role", "organization", "dataCommons");
  }

  return fields;
};
