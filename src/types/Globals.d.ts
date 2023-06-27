type FormSectionProps = {
  classes?: any;
  refs: {
    saveFormRef: React.RefObject<HTMLButtonElement>;
    submitFormRef: React.RefObject<HTMLButtonElement>;
    getFormObjectRef: React.MutableRefObject<(() => FormObject | null) | null>;
  };
};

type FormObject = {
  ref: React.RefObject<HTMLFormElement>;
  data: Application;
};
