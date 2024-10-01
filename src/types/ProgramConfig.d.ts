type ProgramOption = Program & {
  editable?: boolean;
};

type StudyOption = Omit<
  Study,
  | "description"
  | "publications"
  | "plannedPublications"
  | "repositories"
  | "funding"
  | "isDbGapRegistered"
  | "dbGaPPPHSNumber"
> & {
  isCustom?: true;
};
