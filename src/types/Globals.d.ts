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
  [key: string]: SectionOption;
};

type SectionOption = {
  title: string;
  component: React.ComponentType<FormSectionProps>;
};

/// //// test

/* type TextWithLineBreak = {
  type: "wbr" | "br"; // element used to break between text elements
  text: string[];
};

type SectionItemContentOption = {
  label: string;
  value: string;
  name?: string; // override parent name in checkboxes
  tooltipText?: string;
  errorText?: string;
  required?: boolean;
};

type CheckboxGroupContent = Omit<SectionItemContent, "name"> & {
  type: "checkboxGroup";
  name?: string;
};

type SectionItemContent = {
  type:
    | "text"
    | "autocomplete"
    | "select"
    | "checkbox"
    | "checkboxGroup"
    | "switch"
    | "switchGroup";
  label: string;
  name: string;
  placeholder?: string;
  tooltipText?: string;
  required?: boolean = false;
  options?: string[] | SectionItemContentOption[];
};

type SectionItemContentTypes = SectionItemContent | CheckboxGroupContent;

type FormSectionConfig = {
  title: string;
  static: {
    [key in SectionItemKeyTypes]: SectionItem;
  };
};

type SectionItem = {
  sectionTitle: string | TextWithLineBreak;
  sectionDescription?: string | TextWithLineBreak;
  content: {
    [key in SectionItemContentDataAccessKeyTypes]: SectionItemContentTypes;
  } | {
    [key in SectionItemContentCancerTypesKeyTypes]: SectionItemContentTypes;
  };
};

type SectionItemKeyTypes = "dataAccess" | "cancerTypes";
type SectionItemContentKeyTypes =
  | SectionItemContentDataAccessKeyTypes
  | SectionItemContentCancerTypesKeyTypes;

type SectionItemContentDataAccessKeyTypes =
  | "accessTypes"
  | "targetedSubmissionDate"
  | "targetedReleaseDate";

type SectionItemContentCancerTypesKeyTypes =
  | "cancerTypes"
  | "otherCancerTypes"
  | "preCancerTypes"
  | "otherPreCancerTypes"
  | "numberOfParticipants"
  | "cellLinesModelSystems";

  type SectionItemContentCancerTypesTypes = {
    [key in SectionItemContentCancerTypesKeyTypes]: SectionItemContent;
  };

  type SectionItemContentDataAccessTypes = {
    [key in SectionItemContentDataAccessKeyTypes]: SectionItemContent;
  };
 */

  type FormSectionConfig = {
    title: string;
    static: {
      [key in SectionItemKeyTypes]: SectionItem<key>;
    };
  };

  type TextWithLineBreak = {
    type: "wbr" | "br"; // element used to break between text elements
    text: string[];
  };

  type SectionItemKeyTypes = "dataAccess" | "cancerTypes";

  type SectionItem<T extends SectionItemKeyTypes> = {
    sectionTitle: string | TextWithLineBreak;
    sectionDescription?: string | TextWithLineBreak;
    content: T extends "dataAccess" ? DataAccessContent : CancerTypesContent;
  };

  type DataAccessContent = {
    type: "dataAccess";
    accessTypes: CheckboxGroupContent;
    targetedSubmissionDate: SectionItemContentBase;
    targetedReleaseDate: SectionItemContentBase;
  };

  type CancerTypesContent = {
    type: "cancerTypes";
    cancerTypes: SectionItemContentBase;
    otherCancerTypes: SectionItemContentBase;
    preCancerTypes: SelectGroupContent;
    otherPreCancerTypes: SectionItemContentBase;
    test: SectionItemContentBase;
    numberOfParticipants: SectionItemContentBase;
    species: SectionItemContentBase;
    cellLinesModelSystems: CheckboxGroupContent;
  };

  type SectionItemContentTypes = SectionItemContentBase | CheckboxGroupContent;

  type SelectGroupContent = Omit<SectionItemContentBase, "options"> & {
    type: "select";
    options?: string[];
  };

  type CheckboxGroupContent = Omit<SectionItemContentBase, "name" | "options"> & {
    type: "checkboxGroup";
    name?: string;
    options?: SectionItemContentOption[];
  };

  type SectionItemContentBase = {
    type: "text" | "autocomplete" | "select" | "checkbox" | "checkboxGroup" | "switch" | "switchGroup";
    label: string;
    name: string;
    placeholder?: string;
    tooltipText?: string;
    required?: boolean;
    options?: string[] | SectionItemContentOption[];
  };

  type SectionItemContentOption = {
    label: string;
    value: string;
    name?: string; // overrides parent name in checkboxes
    tooltipText?: string;
    errorText?: string;
    required?: boolean;
  };
