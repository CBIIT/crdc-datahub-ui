/**
 * Formats access types based on controlled and open access flags.
 *
 * @param {boolean} controlledAccess - Indicates whether controlled access is enabled.
 * @param {boolean} openAccess - Indicates whether open access is enabled.
 * @returns A formatted string listing the enabled access types separated by a comma and space.
 *          - Returns "Controlled, Open" if both are enabled.
 *          - Returns "Controlled" if only controlled access is enabled.
 *          - Returns "Open" if only open access is enabled.
 *          - Returns an empty string if neither is enabled.
 */
export const formatAccessTypes = (controlledAccess: boolean, openAccess: boolean): string => {
  const properties: AccessType[] = [];
  if (typeof controlledAccess === "boolean" && controlledAccess === true) {
    properties.push("Controlled");
  }
  if (typeof openAccess === "boolean" && openAccess === true) {
    properties.push("Open");
  }

  return properties.join(", ");
};
