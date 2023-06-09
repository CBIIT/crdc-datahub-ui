import React, { FC, useEffect, useRef, useState } from "react";
import { AutocompleteChangeReason } from "@mui/material";
import { parseForm } from "@jalik/form-parser";
import { withStyles } from "@mui/styles";
import { cloneDeep } from "lodash";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import programOptions from "../../../config/ProgramConfig";
import fundingOptions from "../../../config/FundingConfig";
import { Status as FormStatus, useFormContext } from "../../../components/Contexts/FormContext";
import FormContainer from "../../../components/Questionnaire/FormContainer";
import SectionGroup from "../../../components/Questionnaire/SectionGroup";
import TextInput from "../../../components/Questionnaire/TextInput";
import Autocomplete from "../../../components/Questionnaire/AutocompleteInput";
import Publication from "../../../components/Questionnaire/Publication";
import Repository from "../../../components/Questionnaire/Repository";
import { findProgram, findStudy, mapObjectWithKey } from "../utils";
import AddRemoveButton from "../../../components/Questionnaire/AddRemoveButton";
import PlannedPublication from "../../../components/Questionnaire/PlannedPublication";
import SelectInput from "../../../components/Questionnaire/SelectInput";

type KeyedPublication = {
  key: string;
} & Publication;

type KeyedPlannedPublication = {
  key: string;
} & PlannedPublication;

type KeyedRepository = {
  key: string;
} & Repository;

/**
 * Form Section B View
 *
 * @param {FormSectionProps} props
 * @returns {JSX.Element}
 */
const FormSectionB: FC<FormSectionProps> = ({ refs }: FormSectionProps) => {
  const { status, data } = useFormContext();

  const [program, setProgram] = useState<Program>(data.program);
  const [programOption, setProgramOption] = useState<ProgramOption>(findProgram(program.title));
  const [study, setStudy] = useState<Study>(data.study);
  const [studyOption, setStudyOption] = useState<StudyOption>(findStudy(study.title, programOption));
  const [publications, setPublications] = useState<KeyedPublication[]>(data.publications?.map(mapObjectWithKey) || []);
  const [plannedPublications, setPlannedPublications] = useState<KeyedPlannedPublication[]>(data.plannedPublications?.map(mapObjectWithKey) || []);
  const [repositories, setRepositories] = useState<KeyedRepository[]>(data.study?.repositories?.map(mapObjectWithKey) || []);
  const [funding] = useState<Funding>(data.funding);

  const formRef = useRef<HTMLFormElement>();
  const {
    saveFormRef, submitFormRef, getFormObjectRef,
  } = refs;

  useEffect(() => {
    if (!saveFormRef.current || !submitFormRef.current) { return; }

    saveFormRef.current.style.display = "initial";
    submitFormRef.current.style.display = "none";

    getFormObjectRef.current = getFormObject;
  }, [refs]);

  const getFormObject = () : FormObject | null => {
    if (!formRef.current) { return null; }

    const formObject = parseForm(formRef.current, { nullify: false });
    const combinedData = { ...cloneDeep(data), ...formObject };

    // Reset publications if the user has not entered any publications
    if (!formObject.publications || formObject.publications.length === 0) {
      combinedData.publications = [];
    }
    // Reset planned publications if the user has not entered any planned publications
    if (!formObject.plannedPublications || formObject.plannedPublications.length === 0) {
      combinedData.plannedPublications = [];
    }
    // Reset repositories if the user has not entered any repositories
    if (!formObject.repositories || formObject.repositories.length === 0) {
      combinedData.repositories = [];
    }

    return { ref: formRef, data: combinedData };
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
    // and we don't want to reset the entered information
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

  /**
   * Add a empty publication to the publications state
   *
   * @returns {void}
   */
  const addPublication = () => {
    setPublications([
      ...publications,
      { key: `${publications.length}_${new Date().getTime()}`, title: "", pubmedID: "", DOI: "" },
    ]);
  };

  /**
   * Remove a publication from the publications state
   *
   * @param key generated key for the publication
   */
  const removePublication = (key: string) => {
    setPublications(publications.filter((c) => c.key !== key));
  };

  /**
   * Add a empty planned publication to the planned publications state
   *
   * @returns {void}
   */
  const addPlannedPublication = () => {
    setPlannedPublications([
      ...plannedPublications,
      { key: `${plannedPublications.length}_${new Date().getTime()}`, title: "", expectedDate: "" },
    ]);
  };

  /**
   * Remove a planned publication from the planned publications state
   *
   * @param key generated key for the planned publication
   */
  const removePlannedPublication = (key: string) => {
    setPlannedPublications(plannedPublications.filter((c) => c.key !== key));
  };

  /**
   * Add a empty repository to the repositories state
   *
   * @returns {void}
   */
  const addRepository = () => {
    setRepositories([
      ...repositories,
      { key: `${repositories.length}_${new Date().getTime()}`, name: "", studyID: "" },
    ]);
  };

  /**
   * Remove a repository from the repositories state
   *
   * @param key generated key for the repository
   */
  const removeRepository = (key: string) => {
    setRepositories(repositories.filter((c) => c.key !== key));
  };

  return (
    <FormContainer
      title="Section B"
      description="Program and Study Registration"
      formRef={formRef}
    >
      {/* Program Registration Section */}
      <SectionGroup title="Provide information">
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
          maxLength={programOption?.isCustom ? 50 : undefined}
          placeholder="50 characters allowed"
          readOnly={!programOption?.isCustom}
          required
        />
        <TextInput
          label="Program abbreviation or acronym"
          name="program[abbreviation]"
          value={programOption?.isCustom ? program.abbreviation : programOption.abbreviation}
          maxLength={programOption?.isCustom ? 20 : undefined}
          placeholder="20 characters allowed"
          readOnly={!programOption?.isCustom}
          required
        />
        <TextInput
          label="Program description"
          name="program[description]"
          value={programOption?.isCustom ? program.description : " "}
          gridWidth={12}
          maxLength={500}
          placeholder="500 characters allowed"
          minRows={2}
          readOnly={!programOption?.isCustom}
          required={programOption?.isCustom}
          multiline
        />
      </SectionGroup>

      {/* Study Registration Section */}
      <SectionGroup title="Study information">
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
          maxLength={studyOption?.isCustom ? 50 : undefined}
          placeholder="50 characters allowed"
          readOnly={!studyOption?.isCustom}
          required
        />
        <TextInput
          label="Study abbreviation or acronym"
          name="study[abbreviation]"
          value={studyOption?.isCustom ? study.abbreviation : studyOption.abbreviation}
          maxLength={studyOption?.isCustom ? 20 : undefined}
          placeholder="20 characters allowed"
          readOnly={!studyOption?.isCustom}
          required
        />
        <TextInput
          label="Study description"
          name="study[description]"
          value={studyOption?.isCustom ? study.description : " "}
          gridWidth={12}
          maxLength={500}
          placeholder="500 characters allowed"
          minRows={2}
          readOnly={!studyOption?.isCustom}
          required={studyOption?.isCustom}
          multiline
        />
      </SectionGroup>

      {/* Associated Publications */}
      <SectionGroup
        title="Publications associated with this study, if any."
        description={(
          <>
            Include the PubMed ID (PMOID, DOI)
            <br />
            Indicate one Publication per row.
          </>
        )}
        endButton={(
          <AddRemoveButton
            label="Add Publication"
            startIcon={<AddCircleIcon />}
            onClick={addPublication}
            disabled={status === FormStatus.SAVING}
          />
        )}
      >
        {publications.map((pub: KeyedPublication, idx: number) => (
          <Publication
            key={pub.key}
            index={idx}
            publication={pub}
            onDelete={() => removePublication(pub.key)}
          />
        ))}
      </SectionGroup>

      {/* Planned Publications */}
      <SectionGroup
        title="Planned Publications and estimated publication date"
        endButton={(
          <AddRemoveButton
            label="Add Planned Publication"
            startIcon={<AddCircleIcon />}
            onClick={addPlannedPublication}
            disabled={status === FormStatus.SAVING}
          />
        )}
      >
        {plannedPublications.map((pub: KeyedPlannedPublication, idx: number) => (
          <PlannedPublication
            key={pub.key}
            index={idx}
            plannedPublication={pub}
            onDelete={() => removePlannedPublication(pub.key)}
          />
        ))}
      </SectionGroup>

      {/* Study Repositories */}
      <SectionGroup
        title={(
          <>
            Repository where study currently registered (e.g. dbGaP, ORCID)
            <br />
            and associated repository study identifier
          </>
        )}
        endButton={(
          <AddRemoveButton
            label="Add Repository"
            startIcon={<AddCircleIcon />}
            onClick={addRepository}
            disabled={status === FormStatus.SAVING}
          />
        )}
      >
        {repositories.map((repo: KeyedRepository, idx: number) => (
          <Repository
            key={repo.key}
            index={idx}
            repository={repo}
            onDelete={() => removeRepository(repo.key)}
          />
        ))}
      </SectionGroup>

      {/* Funding Agency */}
      <SectionGroup title="Agency(s) and/or organization(s) that funded this study">
        <SelectInput
          label="Funding Agency"
          name="funding[agencies][0][name]"
          value={funding?.agencies[0]?.name}
          onChange={() => {}}
          options={fundingOptions.map((option: string) => ({ label: option, value: option }))}
          placeholder="– Search and Select Program –"
          required
        />
        <TextInput
          label="Grant or Contract Number(s)"
          name="funding[agencies][0][grantNumbers][0]"
          value={funding?.agencies[0]?.grantNumbers[0]}
          maxLength={50}
          required
        />
        <TextInput
          label="NCI Program Officer name, if applicable"
          name="funding[nciProgramOfficer]"
          value={funding?.nciProgramOfficer}
          maxLength={50}
        />
        <TextInput
          label="NCI Genomic Program Administrator (GPA) name, if applicable"
          name="funding[nciGPA]"
          value={funding?.nciGPA}
        />
      </SectionGroup>
    </FormContainer>
  );
};

export default FormSectionB;
