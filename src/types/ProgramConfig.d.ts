type ProgramOption = Omit<Program, "description"> & {
  studies: StudyOption[];
  isCustom?: true;
};

type StudyOption = Omit<Study, "description"> & {
  isCustom?: true;
};
