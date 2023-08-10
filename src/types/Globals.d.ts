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
  data: QuestionnaireData;
};

type SectionKey = 'A' | 'B' | 'C' | 'D' | 'REVIEW';

type SectionConfig = {
  [key in SectionKey]: SectionOption;
};

type SectionOption = {
  title: string;
  id: string;
  component: React.ComponentType<FormSectionProps>;
};

type FormGroupCheckboxOption = {
  label: string;
  value: string;
  name?: string; // overrides parent name in checkboxes
  tooltipText?: string;
  errorText?: string;
  required?: boolean;
};

type SelectOption = { label: string; value: string | number };
