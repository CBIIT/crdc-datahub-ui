import React, { FC, useEffect, useRef, useState } from "react";
import { withStyles } from "@mui/styles";
import { parseForm } from '@jalik/form-parser';
import { useFormContext } from "../../../components/Contexts/FormContext";
import FormContainer from "../../../components/Questionnaire/FormContainer";
import SectionGroup from "../../../components/Questionnaire/SectionGroup";
import TextInput from "../../../components/Questionnaire/TextInput";

/**
 * Form Section B View
 *
 * @param {FormSectionProps} props
 * @returns {JSX.Element}
 */
const FormSectionB: FC<FormSectionProps> = ({ refs }: FormSectionProps) => {
  const [form, setFormData] = useFormContext();
  const { data } = form;

  const [program] = useState<Program>(data.program);
  const [study] = useState<Study>(data.study);
  const formRef = useRef<HTMLFormElement>();
  const { saveForm, submitForm } = refs;

  useEffect(() => {
    if (!saveForm.current || !submitForm.current) { return; }

    // Save the form data on click
    saveForm.current.onclick = () => {
      if (!formRef.current) { return; }

      // Show validation errors but save the data anyway
      formRef.current.reportValidity();

      setFormData({
        ...data,
        ...parseForm(formRef.current, { nullify: false }),
      });
    };

    // Hide the submit button from this section
    submitForm.current.style.visibility = "hidden";
  }, [refs]);

  return (
    <FormContainer
      title="Section B"
      description="Program and Study Registration"
      formRef={formRef}
    >
      <SectionGroup
        title="Program Registration"
        divider={false}
      >
        <TextInput label="Program Title" name="program[title]" value={program.title} maxLength={50} required />
        <TextInput label="Program Abbreviation" name="program[abbreviation]" value={program.abbreviation} maxLength={50} required />
        <TextInput label="Program Description" name="program[description]" value={program.description} gridWidth={12} maxLength={50} required />
      </SectionGroup>
    </FormContainer>
  );
};

const styles = () => ({});

export default withStyles(styles, { withTheme: true })(FormSectionB);
