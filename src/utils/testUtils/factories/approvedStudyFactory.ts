export const baseApprovedStudy: ApprovedStudy = {
  _id: "",
  originalOrg: "",
  studyName: "",
  studyAbbreviation: "",
  dbGaPID: "",
  controlledAccess: false,
  openAccess: false,
  PI: "",
  ORCID: "",
  programs: [],
  primaryContact: null,
  createdAt: "",
};

/**
 *  Creates a new ApprovedStudy object with default values, allowing for field overrides
 *
 * @see {@link baseApprovedStudy}
 * @param {Partial<ApprovedStudy>} [overrides={}] - An object containing properties to override the default values
 * @returns {ApprovedStudy} A new ApprovedStudy object with default propety values applied as well as any overridden properties
 */
export const createApprovedStudy = (overrides: Partial<ApprovedStudy> = {}): ApprovedStudy => ({
  ...baseApprovedStudy,
  ...overrides,
});
