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
