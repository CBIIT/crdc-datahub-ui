import React, { FC, useEffect, useRef, useState } from "react";
import { AutocompleteChangeReason } from '@mui/material';
import { parseForm } from '@jalik/form-parser';
import { cloneDeep, isEqual } from 'lodash';
import programOptions from '../../../config/ProgramConfig';
import { useFormContext } from "../../../components/Contexts/FormContext";
import FormContainer from "../../../components/Questionnaire/FormContainer";
import SectionGroup from "../../../components/Questionnaire/SectionGroup";
import TextInput from "../../../components/Questionnaire/TextInput";
import Autocomplete from '../../../components/Questionnaire/AutocompleteInput';
import { findProgram, findStudy } from '../utils';

const sectionName = "B";

/**
 * Form Section B View
 *
 * @param {FormSectionProps} props
 * @returns {JSX.Element}
 */
const FormSectionB: FC<FormSectionProps> = ({ refs }: FormSectionProps) => {
  const { data, setData } = useFormContext();

  const [program, setProgram] = useState<Program>(data.program);
  const [programOption, setProgramOption] = useState<ProgramOption>(findProgram(program.title));
  const [study, setStudy] = useState<Study>(data.study);
  const [studyOption, setStudyOption] = useState<StudyOption>(findStudy(study.title, programOption));

  const formRef = useRef<HTMLFormElement>();
  const {
    saveFormRef, submitFormRef, saveHandlerRef, isDirtyHandlerRef
  } = refs;

  useEffect(() => {
    if (!saveFormRef.current || !submitFormRef.current) { return; }

    saveFormRef.current.style.display = "initial";
    submitFormRef.current.style.display = "none";

    saveHandlerRef.current = saveForm;
    isDirtyHandlerRef.current = () => !isEqual(getFormObject(), data);
  }, [refs]);

  /**
   * Saves the current form data to the API
   *
   * @returns {void}
   */
  const saveForm = async () => {
    const combinedData = getFormObject();

    // Update section status
    const newStatus = formRef.current.reportValidity() ? "Completed" : "In Progress";
    const currentSection : Section = combinedData.sections.find((s) => s.name === sectionName);
    if (currentSection) {
      currentSection.status = newStatus;
    } else {
      combinedData.sections.push({ name: sectionName, status: newStatus });
    }

    // Skip state update if there are no changes
    if (!isEqual(combinedData, data)) {
      const r = await setData(combinedData);
      return r;
    }

    return true;
  };

  const getFormObject = () => {
    if (!formRef.current) { return false; }

    const formObject = parseForm(formRef.current, { nullify: false });
    return { ...cloneDeep(data), ...formObject };
  };

  /**
   * Handles the program change event and updates program/study states
   *
   * @param e event
   * @param value new program title
   * @param r Reason for the event dispatch
   * @returns {void}
   */
  const handleProgramChange = (e: React.SyntheticEvent, value: string, r: AutocompleteChangeReason) => {
    if (r !== "selectOption") { return; }

    const newProgram = findProgram(value);
    if (newProgram?.isCustom) {
      setProgram({ title: "", abbreviation: "", description: "" });
    } else {
      setProgram({ title: newProgram.title, abbreviation: newProgram.abbreviation, description: "" });
    }

    // Only reset study if the study is not currently custom
    // The user may have entered a "Other" study and then changed the program
    if (!studyOption?.isCustom) {
      const newStudy = newProgram.studies[0];
      if (newStudy?.isCustom) {
        setStudy({ ...study, title: "", abbreviation: "", description: "" });
      } else {
        setStudy({ ...study, ...newProgram.studies[0] });
      }

      setStudyOption(newProgram.studies[0]);
    }

    setProgramOption(newProgram);
  };

  /**
   * Handles the study change event and updates the state
   *
   * @param e event
   * @param value new study title
   * @param r Reason for the event dispatch
   * @returns {void}
   */
  const handleStudyChange = (e: React.SyntheticEvent, value: string, r: AutocompleteChangeReason) => {
    if (r !== "selectOption") { return; }

    const newStudy = findStudy(value, programOption);
    if (newStudy?.isCustom) {
      setStudy({ ...study, title: "", abbreviation: "", description: "" });
    } else {
      setStudy({ ...study, title: newStudy.title, abbreviation: newStudy.abbreviation, description: "" });
    }

    setStudyOption(newStudy);
  };

  return (
    <FormContainer
      title="Section B"
      description="Program and Study Registration"
      formRef={formRef}
    >
      {/* Program Registration Section */}
      <SectionGroup title="Provide information about the program" divider={false}>
        <Autocomplete
          gridWidth={12}
          label="Program"
          value={programOption?.isCustom ? programOption.title : program.title}
          onChange={handleProgramChange}
          options={programOptions.map((option: ProgramOption) => option.title)}
          placeholder="– Search and Select Program –"
          required
          disableClearable
        />
        <TextInput
          label="Program name"
          name="program[title]"
          value={programOption?.isCustom ? program.title : programOption.title}
          maxLength={50}
          readOnly={!programOption?.isCustom}
          required
        />
        <TextInput
          label="Program abbreviation or acronym"
          name="program[abbreviation]"
          value={programOption?.isCustom ? program.abbreviation : programOption.abbreviation}
          maxLength={20}
          readOnly={!programOption?.isCustom}
          required
        />
        <TextInput
          label="Program description"
          name="program[description]"
          value={programOption?.isCustom ? program.description : " "}
          gridWidth={12}
          maxLength={1000}
          placeholder="1000 characters allowed"
          minRows={4}
          readOnly={!programOption?.isCustom}
          required={programOption?.isCustom}
          multiline
        />
      </SectionGroup>

      {/* Study Registration Section */}
      <SectionGroup title="Provide information about the study" divider>
        <Autocomplete
          gridWidth={12}
          label="Study"
          value={studyOption?.isCustom ? studyOption.title : study.title}
          onChange={handleStudyChange}
          options={programOption.studies.map((option: StudyOption) => option.title)}
          placeholder="– Search and Select Study –"
          required
          disableClearable
        />
        <TextInput
          label="Study name"
          name="study[title]"
          value={studyOption?.isCustom ? study.title : studyOption.title}
          maxLength={50}
          readOnly={!studyOption?.isCustom}
          required
        />
        <TextInput
          label="Study abbreviation or acronym"
          name="study[abbreviation]"
          value={studyOption?.isCustom ? study.abbreviation : studyOption.abbreviation}
          maxLength={20}
          readOnly={!studyOption?.isCustom}
          required
        />
        <TextInput
          label="Study description"
          name="study[description]"
          value={studyOption?.isCustom ? study.description : " "}
          gridWidth={12}
          maxLength={1000}
          placeholder="1000 characters allowed"
          minRows={4}
          readOnly={!studyOption?.isCustom}
          required={studyOption?.isCustom}
          multiline
        />
      </SectionGroup>

      {/* Associated Pubications */}
      <SectionGroup
        title={`List publications associated with this study, if any.
          <br/>Include PubMed ID (PMID). Indicate one pulication per row.`}
        divider
      >
        TODO
      </SectionGroup>

      {/* Study Repositories */}
      <SectionGroup
        title={`Enter name of the repository where the study is currently registered (e.g. dbGaP, ORCID)
          <br/>and associated repository study identifier.`}
        divider
      >
        TODO
      </SectionGroup>

      {/* Funding Agency */}
      <SectionGroup
        title="List the agency(s) and/or organization(s) that funded this study."
        divider
      >
        TODO
      </SectionGroup>
    </FormContainer>
  );
};

export default FormSectionB;
