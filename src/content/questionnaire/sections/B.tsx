import React, { FC, useEffect, useRef, useState } from "react";
import { AutocompleteChangeReason } from "@mui/material";
import { parseForm } from "@jalik/form-parser";
import { cloneDeep } from "lodash";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import dayjs from "dayjs";
import programOptions, { BlankProgram, BlankStudy, OptionalStudy } from "../../../config/ProgramConfig";
import { Status as FormStatus, useFormContext } from "../../../components/Contexts/FormContext";
import FormContainer from "../../../components/Questionnaire/FormContainer";
import SectionGroup from "../../../components/Questionnaire/SectionGroup";
import TextInput from "../../../components/Questionnaire/TextInput";
import Autocomplete from "../../../components/Questionnaire/AutocompleteInput";
import Publication from "../../../components/Questionnaire/Publication";
import Repository from "../../../components/Questionnaire/Repository";
import { findProgram, findStudy, mapObjectWithKey } from "../../../utils";
import AddRemoveButton from "../../../components/Questionnaire/AddRemoveButton";
import PlannedPublication from "../../../components/Questionnaire/PlannedPublication";
import { InitialQuestionnaire } from "../../../config/InitialValues";
import TransitionGroupWrapper from "../../../components/Questionnaire/TransitionGroupWrapper";
import SwitchInput from "../../../components/Questionnaire/SwitchInput";
import useFormMode from "./hooks/useFormMode";
import FundingAgency from "../../../components/Questionnaire/FundingAgency";

export type KeyedPublication = {
  key: string;
} & Publication;

export type KeyedPlannedPublication = {
  key: string;
} & PlannedPublication;

export type KeyedRepository = {
  key: string;
} & Repository;

export type KeyedFunding = {
  key: string;
} & Funding;

/**
 * Form Section B View
 *
 * @param {FormSectionProps} props
 * @returns {JSX.Element}
 */
const FormSectionB: FC<FormSectionProps> = ({ SectionOption, refs }: FormSectionProps) => {
  const { status, data: { questionnaireData: data } } = useFormContext();
  const { readOnlyInputs } = useFormMode();

  const [program, setProgram] = useState<Program>(data.program);
  const [programOption, setProgramOption] = useState<ProgramOption>(findProgram(program.name, program.abbreviation));
  const [study, setStudy] = useState<Study>(data.study);
  const [studyOption, setStudyOption] = useState<StudyOption>(findStudy(study.name, study.abbreviation, programOption));
  const [publications, setPublications] = useState<KeyedPublication[]>(data.study?.publications?.map(mapObjectWithKey) || []);
  const [plannedPublications, setPlannedPublications] = useState<KeyedPlannedPublication[]>(data.study?.plannedPublications?.map(mapObjectWithKey) || []);
  const [repositories, setRepositories] = useState<KeyedRepository[]>(data.study?.repositories?.map(mapObjectWithKey) || []);
  const [fundings, setFundings] = useState<KeyedFunding[]>(data.study?.funding?.map(mapObjectWithKey) || []);
  const [isDbGapRegistered, setIsdbGaPRegistered] = useState<boolean>(data.study?.isDbGapRegistered);

  const formRef = useRef<HTMLFormElement>();
  const {
    nextButtonRef, saveFormRef, submitFormRef, approveFormRef, rejectFormRef, getFormObjectRef,
  } = refs;

  useEffect(() => {
    if (!saveFormRef.current || !submitFormRef.current) { return; }

    nextButtonRef.current.style.display = "flex";
    saveFormRef.current.style.display = "initial";
    submitFormRef.current.style.display = "none";
    approveFormRef.current.style.display = "none";
    rejectFormRef.current.style.display = "none";

    getFormObjectRef.current = getFormObject;
  }, [refs]);

  const getFormObject = (): FormObject | null => {
    if (!formRef.current) { return null; }

    const formObject = parseForm(formRef.current, { nullify: false });
    const combinedData = { ...cloneDeep(data), ...formObject };

    // Reset study if the data failed to load
    if (!formObject.study) {
      combinedData.study = InitialQuestionnaire.study;
    }
    if (!formObject?.study?.dbGaPPPHSNumber) {
      combinedData.study.dbGaPPPHSNumber = "";
    }

    // Reset publications if the user has not entered any publications
    if (!formObject.study.publications || formObject.study.publications.length === 0) {
      combinedData.study.publications = [];
    }
    // Reset planned publications if the user has not entered any planned publications
    if (!formObject.study.plannedPublications || formObject.study.plannedPublications.length === 0) {
      combinedData.study.plannedPublications = [];
    }
    // Reset repositories if the user has not entered any repositories
    if (!formObject.study.repositories || formObject.study.repositories.length === 0) {
      combinedData.study.repositories = [];
    }

    return { ref: formRef, data: combinedData };
  };

  /**
   * Will set the study input values to empty strings
   * as well as the study option to a blank study
   *
   * @returns {void}
   */
  const clearStudyAndStudyOption = (): void => {
    setStudy({ ...study, ...BlankStudy, description: "" });
    setStudyOption(BlankStudy);
  };

  /**
   * Handles the program change event and updates program/study states
   *
   * @param e event
   * @param value new program title
   * @param r Reason for the event dispatch
   * @returns {void}
   */
  const handleProgramChange = (e: React.SyntheticEvent, value: ProgramOption, r: AutocompleteChangeReason) => {
    if (r !== "selectOption" && r !== "clear") { return; }
    if (r === "clear") {
      setProgram({ name: "", abbreviation: "", description: "" });
      setProgramOption({ ...BlankProgram, studies: [BlankStudy, OptionalStudy] });
      if (!studyOption?.isCustom) {
        clearStudyAndStudyOption();
      }
      return;
    }

    const newProgram = findProgram(value.name, value.abbreviation);

    if (newProgram?.isCustom) {
      setProgram({ name: "", abbreviation: "", description: "" });
    } else {
      setProgram({ name: newProgram.name, abbreviation: newProgram.abbreviation, description: "" });
    }

    // Only reset study if the study is not currently custom
    // The user may have entered a "Other" study and then changed the program
    // and we don't want to reset the entered information
    if (!studyOption?.isCustom) {
      clearStudyAndStudyOption();
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
  const handleStudyChange = (e: React.SyntheticEvent, value: StudyOption, r: AutocompleteChangeReason) => {
    if (r !== "selectOption" && r !== "clear") { return; }
    if (r === "clear") {
      clearStudyAndStudyOption();
      return;
    }

    const newStudy = findStudy(value.name, value.abbreviation, programOption);
    if (newStudy?.isCustom) {
      setStudy({
        ...InitialQuestionnaire.study,
        name: "",
        abbreviation: "",
        description: ""
      });
    } else {
      setStudy({
        ...InitialQuestionnaire.study,
        ...study,
        name: newStudy.name,
        abbreviation: newStudy.abbreviation,
      });
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
      { key: `${plannedPublications.length}_${new Date().getTime()}`, title: "", expectedDate: dayjs().format("MM/DD/YYYY") },
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
      { key: `${repositories.length}_${new Date().getTime()}`, name: "", studyID: "", submittedDate: "" },
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

  /**
   * Add a empty funding to the fundings state
   *
   * @returns {void}
   */
  const addFunding = () => {
    setFundings([
      ...fundings,
      { key: `${fundings.length}_${new Date().getTime()}`, agency: "", grantNumbers: "", nciProgramOfficer: "", nciGPA: "" },
    ]);
  };

  /**
   * Remove a funding from the fundings state
   *
   * @param key generated key for the funding
   */
  const removeFunding = (key: string) => {
    setFundings(fundings.filter((f) => f.key !== key));
  };

  const readOnlyProgram = readOnlyInputs || !programOption?.isCustom || programOption === BlankProgram;
  const readOnlyStudy = readOnlyInputs || !studyOption?.isCustom || studyOption === BlankStudy;

  return (
    <FormContainer
      description={SectionOption.title}
      formRef={formRef}
    >
      {/* Program Registration Section */}
      <SectionGroup
        title="Program information"
        description="If your study is part of a larger program, enter the program name(s) and/or organization(s) that funded this study."
      >
        <Autocomplete
          key={`program-${programOption.name}`}
          id="section-b-program"
          gridWidth={12}
          label="Program"
          value={programOption?.isCustom ? programOption : program}
          onChange={handleProgramChange}
          options={programOptions}
          renderOption={(props, option: ProgramOption) => {
            if (option === BlankProgram) {
              return null;
            }
            return <li {...props}>{`${option.name}${!option.isCustom && option.abbreviation ? ` (${option.abbreviation})` : ""}`}</li>;
          }}
          getOptionLabel={(option: ProgramOption) => (option.isCustom ? option.name : `${option.name}${option.abbreviation ? ` (${option.abbreviation})` : ""}`)}
          isOptionEqualToValue={(option: ProgramOption, value: ProgramOption) => option.name === value.name && option.abbreviation === value.abbreviation}
          placeholder="– Search and Select Program –"
          validate={(input: ProgramOption) => input?.name?.length > 0}
          tooltipText="The name of the broad administrative group that manages the data collection.  Example - Clinical Proteomic Tumor Analysis Consortium."
          required
          readOnly={readOnlyInputs}
        />
        <TextInput
          id="section-b-program-title"
          label="Program Title"
          name="program[name]"
          value={programOption?.isCustom ? program.name : programOption.name}
          maxLength={programOption?.isCustom ? 50 : undefined}
          placeholder="50 characters allowed"
          readOnly={readOnlyProgram}
          hideValidation={readOnlyProgram}
          required
        />
        <TextInput
          id="section-b-program-abbreviation"
          label="Program Abbreviation"
          name="program[abbreviation]"
          value={programOption?.isCustom ? program.abbreviation : programOption.abbreviation}
          maxLength={programOption?.isCustom ? 20 : undefined}
          placeholder="20 characters allowed"
          readOnly={readOnlyProgram}
          hideValidation={readOnlyProgram}
          required
        />
        <TextInput
          id="section-b-program-description"
          label="Program Description"
          name="program[description]"
          value={programOption?.isCustom ? program.description : " "}
          gridWidth={12}
          maxLength={500}
          placeholder="500 characters allowed"
          minRows={2}
          readOnly={readOnlyProgram}
          hideValidation={readOnlyProgram}
          required={programOption?.isCustom}
          multiline
        />
      </SectionGroup>

      {/* Study Registration Section */}
      <SectionGroup title="Study information">
        <TextInput
          id="section-b-study-title"
          label="Study Title"
          name="study[name]"
          value={studyOption?.isCustom ? study.name : studyOption.name}
          maxLength={studyOption?.isCustom ? 100 : undefined}
          placeholder="100 characters allowed"
          readOnly={readOnlyStudy}
          hideValidation={readOnlyStudy}
          tooltipText="The title should provide a snapshot of the study; it should include a broad goal or conclusion of the project. It must use title case. For example, the manuscript title."
          required
        />
        <TextInput
          id="section-b-study-abbreviation-or-acronym"
          label="Study Abbreviation"
          name="study[abbreviation]"
          value={studyOption?.isCustom ? study.abbreviation : studyOption.abbreviation}
          maxLength={studyOption?.isCustom ? 20 : undefined}
          placeholder="20 characters allowed"
          readOnly={readOnlyStudy}
          hideValidation={readOnlyStudy}
          tooltipText="Provide a short abbreviation or acronym (e.g., NCI-MATCH) for the study."
          required
        />
        <TextInput
          id="section-b-study-description"
          label="Study description"
          name="study[description]"
          value={studyOption?.isCustom ? study.description : " "}
          gridWidth={12}
          maxLength={2500}
          placeholder="2,500 characters allowed"
          minRows={2}
          readOnly={readOnlyStudy}
          hideValidation={readOnlyStudy}
          required={studyOption?.isCustom}
          multiline
          tooltipText={(
            <>
              Describe your study and the data being submitted. Include objectives of the study and convey information about the experimental approach.
              <br />
              <br />
              Provide a brief description of the scientific value of the data for submission. For example, how can other researchers benefit from the value of these data.
              <br />
              <br />
              If the description is taken verbatim from a published or soon to be published article, please submit copyright permission from the Journal. Summaries with copyrighted material must include the following within the description: “Reprinted from [Article Citation], with permission from [Publisher]."
            </>
          )}
        />
      </SectionGroup>

      {/* Funding Agency */}
      <SectionGroup
        title="Funding Agency/Organization"
        description="List the agency(s) and/or organization(s) that funded this study."
        endButton={(
          <AddRemoveButton
            id="section-b-add-funding-button"
            label="Add Funding"
            startIcon={<AddCircleIcon />}
            onClick={addFunding}
            disabled={readOnlyInputs || status === FormStatus.SAVING}
          />
        )}
      >
        <TransitionGroupWrapper
          items={fundings}
          renderItem={(funding: KeyedFunding, idx: number) => (
            <FundingAgency
              idPrefix="section-b-"
              index={idx}
              funding={funding}
              onDelete={() => removeFunding(funding.key)}
              readOnly={readOnlyInputs}
            />
        )}
        />
      </SectionGroup>

      {/* Existing Publications */}
      <SectionGroup
        title="Existing Publications"
        description="List existing publications associated with this study, include PubMed ID (PMID), DOI."
        endButton={(
          <AddRemoveButton
            id="section-b-add-publication-button"
            label="Add Publication"
            startIcon={<AddCircleIcon />}
            onClick={addPublication}
            disabled={readOnlyInputs || status === FormStatus.SAVING}
          />
        )}
      >
        <TransitionGroupWrapper
          items={publications}
          renderItem={(pub: KeyedPublication, idx: number) => (
            <Publication
              idPrefix="section-b-"
              index={idx}
              publication={pub}
              onDelete={() => removePublication(pub.key)}
              readOnly={readOnlyInputs}
            />
          )}
        />
      </SectionGroup>

      {/* Planned Publications */}
      <SectionGroup
        title="Planned Publications"
        description="List planned publications and/or pre-prints associated with this study, if any, and the estimated publication date."
        endButton={(
          <AddRemoveButton
            id="section-b-add-planned-publication-button"
            label="Add Planned Publication"
            startIcon={<AddCircleIcon />}
            onClick={addPlannedPublication}
            disabled={readOnlyInputs || status === FormStatus.SAVING}
          />
        )}
      >
        <TransitionGroupWrapper
          items={plannedPublications}
          renderItem={(pub: KeyedPlannedPublication, idx: number) => (
            <PlannedPublication
              idPrefix="section-b-"
              index={idx}
              plannedPublication={pub}
              onDelete={() => removePlannedPublication(pub.key)}
              readOnly={readOnlyInputs}
            />
          )}
        />

      </SectionGroup>

      {/* dbGaP Registration section */}
      <SectionGroup
        title="Indicate if your study is currently registered with dbGaP"
        description="Indicated if your study is currently registered with dbGaP."
      >
        <SwitchInput
          id="section-b-dbGaP-registration"
          label="dbGaP REGISTRATION"
          name="study[isDbGapRegistered]"
          required
          value={isDbGapRegistered}
          onChange={(e, checked: boolean) => setIsdbGaPRegistered(checked)}
          isBoolean
          readOnly={readOnlyInputs}
        />
        <TextInput
          id="section-b-if-yes-provide-dbgap-phs-number"
          label="If yes, provide dbGaP PHS number"
          name="study[dbGaPPPHSNumber]"
          value={data.study.dbGaPPPHSNumber}
          maxLength={50}
          placeholder="50 characters allowed"
          gridWidth={12}
          readOnly={readOnlyInputs}
          required={isDbGapRegistered}
        />
      </SectionGroup>

      {/* Study Repositories */}
      <SectionGroup
        title="Repository"
        description="Add repository if your study has submitted data to a non-CRDC repository"
        endButton={(
          <AddRemoveButton
            id="section-b-add-repository-button"
            label="Add Repository"
            startIcon={<AddCircleIcon />}
            onClick={addRepository}
            disabled={readOnlyInputs || status === FormStatus.SAVING}
          />
        )}
      >
        <TransitionGroupWrapper
          items={repositories}
          renderItem={(repo: KeyedRepository, idx: number) => (
            <Repository
              idPrefix="section-b-"
              index={idx}
              repository={repo}
              onDelete={() => removeRepository(repo.key)}
              readOnly={readOnlyInputs}
            />
          )}
        />
      </SectionGroup>
    </FormContainer>
  );
};

export default FormSectionB;
