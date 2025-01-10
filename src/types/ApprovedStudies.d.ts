type ApprovedStudy = {
  _id: string;
  originalOrg: string;
  /**
   * Study name
   *
   * @example Genomic Information System
   */
  studyName: string;
  /**
   * Study Abbreviation
   *
   * @example GIS
   */
  studyAbbreviation: string;
  /**
   * dbGaP ID associated with the study
   */
  dbGaPID: string;
  /**
   * Boolean flag dictating whether the study has controlled access data
   */
  controlledAccess: boolean;
  /**
   * Boolean flag dictating whether the study has open access data
   */
  openAccess: boolean;
  /**
   * Principal Investigator's name
   */
  PI: string;
  /**
   * Open Researcher and Contributor ID.
   *
   * @example 0000-0001-2345-6789
   */
  ORCID: string;
  /**
   * The User object of the Primary contact associcated with the study
   */
  primaryContact: User;
  /**
   * Submission Request approval date or manual record creation date
   */
  createdAt: string;
};

type ApprovedStudyOfMyOrganization = Pick<
  ApprovedStudy,
  "_id" | "studyName" | "studyAbbreviation" | "dbGaPID" | "controlledAccess"
>;

type AccessType = "All" | "Controlled" | "Open";
