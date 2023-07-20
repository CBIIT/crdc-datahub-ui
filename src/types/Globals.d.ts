type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

type FormSectionProps = {
  refs: {
    saveFormRef: React.RefObject<HTMLButtonElement>;
    submitFormRef: React.RefObject<HTMLButtonElement>;
    nextButtonRef: React.RefObject<HTMLButtonElement>;
    approveFormRef: React.RefObject<HTMLButtonElement>;
    rejectFormRef: React.RefObject<HTMLButtonElement>;
    getFormObjectRef: React.MutableRefObject<(() => FormObject | null) | null>;
  };
  SectionOption: SectionOption;
};

type FormObject = {
  ref: React.RefObject<HTMLFormElement>;
  data: Application;
};

type SectionConfig = {
  [key: string]: SectionOption;
};

type SectionOption = {
  title: string;
  id: string;
  component: React.ComponentType<FormSectionProps>;
};
