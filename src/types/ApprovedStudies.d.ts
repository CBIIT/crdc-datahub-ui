type ApprovedStudy = {
    _id: string;
    originalOrg: string; // # organization at the time of approval, can be absent if a submission request doesn't have an organization associated
    studyName: string;
    studyAbbreviation: string; // # must be unique
    dbGapID: string; /// # aka. phs number
};
