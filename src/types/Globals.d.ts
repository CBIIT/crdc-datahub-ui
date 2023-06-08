type FormSectionProps = {
  classes?: any;
  refs: {
    saveFormRef: React.RefObject<HTMLButtonElement>;
    submitFormRef: React.RefObject<HTMLButtonElement>;
    saveHandlerRef: React.MutableRefObject<(() => Promise<boolean>) | null>;
    isDirtyHandlerRef: React.MutableRefObject<(() => boolean) | null>;
  };
};
