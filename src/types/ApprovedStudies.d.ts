type ApprovedStudy = {
    _id: string;
    originalOrg: Organization["_id"];
    /**
     * Study name
     *
     * @example Genomic Information System
     */
    studyName: string;
    /**
     * Study Abbreviation
     * This is a unique constraint across all studies
     *
     * @example GIS
     */
    studyAbbreviation: string;
    dbGaPID: string;
};
