type FormSectionProps = {
  classes?: any;
  refs: {
    saveFormRef: React.RefObject<HTMLButtonElement>;
    submitFormRef: React.RefObject<HTMLButtonElement>;
    getFormObjectRef: React.MutableRefObject<(() => FormObject | null) | null>;
  };
  SectionOption: SectionOption;
};

type FormObject = {
  ref: React.RefObject<HTMLFormElement>;
  data: Application;
};

type SectionConfig = {
  [key: string]: SectionOption
};

type SectionOption = {
  title: string;
  component: React.ComponentType<FormSectionProps>;
};
