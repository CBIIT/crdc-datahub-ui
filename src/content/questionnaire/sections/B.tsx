import React, { FC, useEffect, useRef, useState } from "react";
import { Grid } from '@mui/material';
import { withStyles } from "@mui/styles";
import { parseForm } from '@jalik/form-parser';
import { useFormContext } from "../../../components/Contexts/FormContext";
import FormContainer from "../../../components/Questionnaire/FormContainer";
import SectionGroup from "../../../components/Questionnaire/SectionGroup";
import TextInput from "../../../components/Questionnaire/TextInput";
import SelectInput from '../../../components/Questionnaire/SelectInput';

type ProgramOption = {
  name: string;
  abbreviation: string;
};

// TODO: Either load dynamically or fill in manually
const programOptions: ProgramOption[] = [
  { name: "ABC Long Name ABC", abbreviation: "ABC" },
  { name: "DEF Long Name DEF", abbreviation: "DEF" },
  { name: "GHI Long Name GHI", abbreviation: "GHI" },
  { name: "JKL Long Name JKL", abbreviation: "JKL" },
  { name: "Example Pg", abbreviation: "EPG" },
  { name: "Other", abbreviation: "Other" },
];

/**
 * Form Section B View
 *
 * @param {FormSectionProps} props
 * @returns {JSX.Element}
 */
const FormSectionB: FC<FormSectionProps> = ({ refs }: FormSectionProps) => {
  const [form, setFormData] = useFormContext();
  const { data } = form;

  const [program, setProgram] = useState<Program>(data.program);
  const [study] = useState<Study>(data.study);

  // Compare API program title to the list of options to determine if it's a custom program
  const [isCustomProgram, setIsCustomProgram] = useState<boolean>(
    program.title.toLowerCase() === "other"
    || programOptions.find((option: ProgramOption) => option.name === program.title) === undefined
  );

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

  const handleProgramChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    const isCustom = value.toLowerCase() === "other";
    let title = value;

    if (isCustom !== isCustomProgram) {
      setIsCustomProgram(isCustom);
      title = isCustom ? "" : value;
    }

    setProgram({
      ...program,
      title,
      abbreviation: isCustom ? "" : programOptions.find((option: ProgramOption) => option.name === value)?.abbreviation || "",
    });
  };

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
        <SelectInput
          label="Program Title"
          name="program[title]"
          value={isCustomProgram ? "Other" : program.title}
          onChange={handleProgramChange}
          options={programOptions.map((option: ProgramOption) => ({ label: option.name, value: option.name }))}
          required
        />
        <TextInput
          label="Program Abbreviation"
          name="program[abbreviation]"
          value={program.abbreviation}
          maxLength={20}
          readOnly={!isCustomProgram}
          required
        />
        {isCustomProgram && (
          <>
            <TextInput
              label="Custom Program Title"
              name="program[title]"
              value={program.title}
              gridWidth={6}
              maxLength={50}
              required
            />
            <Grid item xs={6} />
          </>
        )}
        <TextInput
          label="Program Description"
          name="program[description]"
          value={program.description}
          gridWidth={12}
          maxLength={50}
          minRows={4}
          required
          multiline
        />
      </SectionGroup>
    </FormContainer>
  );
};

const styles = () => ({});

export default withStyles(styles, { withTheme: true })(FormSectionB);
