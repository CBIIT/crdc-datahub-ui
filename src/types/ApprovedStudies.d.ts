type ApprovedStudy = {
  _id: string;
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
};
