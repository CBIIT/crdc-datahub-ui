type ProgramOption = Omit<Program, "description"> & {
  studies: StudyOption[];
  isCustom?: true;
};

type StudyOption = Omit<Study, "description" | "publications" | "plannedPublications" | "repositories" | "funding" | "isDbGapRegistered" | "dbGaPPPHSNumber"> & {
  isCustom?: true;
};
