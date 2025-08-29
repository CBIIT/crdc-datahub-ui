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

/**
 * Determines whether any of the given studies would end up belonging to more than one program
 * after assigning them to the specified program.  System-managed `"NA"` programs are ignored.
 *
 * @param {ApprovedStudy[]} studies - Array of approved studies.
 * @param {string} newProgramId - The ID of the program under which each study is about to be saved.
 * @returns `true` if at least one study would have more than one program (excluding `"NA"`);
 *          otherwise `false`.
 */
export const hasStudyWithMultiplePrograms = (
  studies: ApprovedStudy[],
  newProgramId: string
): boolean => {
  if (!studies?.length || !newProgramId) {
    return false;
  }

  return studies.some((study) => {
    const validPrograms = study.programs?.filter((p) => p.name !== "NA") || [];
    const distinctProgramIds = new Set<string>([...validPrograms.map((p) => p._id), newProgramId]);

    return distinctProgramIds.size > 1;
  });
};
