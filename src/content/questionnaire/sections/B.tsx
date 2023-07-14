import React, { FC, useEffect, useRef, useState } from "react";
import { AutocompleteChangeReason } from "@mui/material";
import { parseForm } from "@jalik/form-parser";
import { cloneDeep } from "lodash";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import programOptions, { BlankProgram, BlankStudy, OptionalStudy } from "../../../config/ProgramConfig";
import fundingAgencyOptions from "../../../config/FundingConfig";
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
import initialValues from "../../../config/InitialValues";
import TransitionGroupWrapper from "../../../components/Questionnaire/TransitionGroupWrapper";
import SwitchInput from "../../../components/Questionnaire/SwitchInput";

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
const FormSectionB: FC<FormSectionProps> = ({ SectionOption, refs }: FormSectionProps) => {
  const { status, data } = useFormContext();

  const [program, setProgram] = useState<Program>(data.program);
  const [programOption, setProgramOption] = useState<ProgramOption>(findProgram(program.name, program.abbreviation));
  const [study, setStudy] = useState<Study>(data.study);
  const [studyOption, setStudyOption] = useState<StudyOption>(findStudy(study.name, study.abbreviation, programOption));
  const [publications, setPublications] = useState<KeyedPublication[]>(data.study?.publications?.map(mapObjectWithKey) || []);
  const [plannedPublications, setPlannedPublications] = useState<KeyedPlannedPublication[]>(data.study?.plannedPublications?.map(mapObjectWithKey) || []);
  const [repositories, setRepositories] = useState<KeyedRepository[]>(data.study?.repositories?.map(mapObjectWithKey) || []);
  const [funding] = useState<Funding>(data.study?.funding);
  const [isdbGaPRegistered, setIsdbGaPRegistered] = useState<boolean>(data.study?.isdbGaPRegistered);

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

  const getFormObject = (): FormObject | null => {
    if (!formRef.current) { return null; }

    const formObject = parseForm(formRef.current, { nullify: false });
    const combinedData = { ...cloneDeep(data), ...formObject };

    // Reset study if the data failed to load
    if (!formObject.study) {
      combinedData.study = initialValues.study;
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
        ...initialValues.study,
        name: "",
        abbreviation: "",
        description: ""
      });
    } else {
      setStudy({
        ...initialValues.study,
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

  const readOnlyProgram = !programOption?.isCustom || programOption === BlankProgram;
  const readOnlyStudy = !studyOption?.isCustom || studyOption === BlankStudy;

  return (
    <FormContainer
      description={SectionOption.title}
      formRef={formRef}
    >
      {/* Program Registration Section */}
      <SectionGroup title="Program information">
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
          required
        />
        <TextInput
          id="section-b-program-name"
          label="Program name"
          name="program[name]"
          value={programOption?.isCustom ? program.name : programOption.name}
          maxLength={programOption?.isCustom ? 50 : undefined}
          placeholder="50 characters allowed"
          readOnly={readOnlyProgram}
          hideValidation={readOnlyProgram}
          required
        />
        <TextInput
          id="section-b-program-abbreviation-or-acronym"
          label="Program abbreviation or acronym"
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
          label="Program description"
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
        <Autocomplete
          key={`study-${studyOption.name}`}
          id="section-b-study"
          gridWidth={12}
          label="Study"
          value={studyOption?.isCustom ? studyOption : study}
          onChange={handleStudyChange}
          options={programOption.studies}
          renderOption={(props, option: StudyOption) => {
            if (option === BlankStudy) {
              return null;
            }
            return <li {...props}>{`${option.name}${!option.isCustom && option.abbreviation ? ` (${option.abbreviation})` : ""}`}</li>;
          }}
          getOptionLabel={(option: StudyOption) => (option.isCustom ? option.name : `${option.name}${option.abbreviation ? ` (${option.abbreviation})` : ""}`)}
          isOptionEqualToValue={(option: StudyOption, value: StudyOption) => option.name === value.name && option.abbreviation === value.abbreviation}
          placeholder="– Search and Select Study –"
          validate={(input: ProgramOption) => input?.name?.length > 0}
          required
        />
        <TextInput
          id="section-b-study-name"
          label="Study name"
          name="study[name]"
          value={studyOption?.isCustom ? study.name : studyOption.name}
          maxLength={studyOption?.isCustom ? 50 : undefined}
          placeholder="50 characters allowed"
          readOnly={readOnlyStudy}
          hideValidation={readOnlyStudy}
          required
        />
        <TextInput
          id="section-b-study-abbreviation-or-acronym"
          label="Study abbreviation or acronym"
          name="study[abbreviation]"
          value={studyOption?.isCustom ? study.abbreviation : studyOption.abbreviation}
          maxLength={studyOption?.isCustom ? 20 : undefined}
          placeholder="20 characters allowed"
          readOnly={readOnlyStudy}
          hideValidation={readOnlyStudy}
          required
        />
        <TextInput
          id="section-b-study-description"
          label="Study description"
          name="study[description]"
          value={studyOption?.isCustom ? study.description : " "}
          gridWidth={12}
          maxLength={500}
          placeholder="500 characters allowed"
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

      {/* dbGaP Registration section */}
      <SectionGroup title="Indicate if your study is currently registered with dbGaP">
        <SwitchInput
          id="section-b-is-dbgap-registered"
          label="dbGaP Registered?"
          name="study[isdbGaPRegistered]"
          required
          value={isdbGaPRegistered}
          onChange={(e, checked: boolean) => setIsdbGaPRegistered(checked)}
          isBoolean
          toggleContent={(
            <TextInput
              id="section-b-dbgap-phs-number"
              label="Please provide the associated dbGaP PHS Number"
              name="study[dbGaPPHSNumber]"
              value={data.study.dbGaPPHSNumber}
              maxLength={50}
              placeholder="50 characters allowed"
              gridWidth={12}
              required={isdbGaPRegistered}
            />
          )}
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
            id="section-b-add-publication-button"
            label="Add Publication"
            startIcon={<AddCircleIcon />}
            onClick={addPublication}
            disabled={status === FormStatus.SAVING}
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
            />
          )}
        />
      </SectionGroup>

      {/* Planned Publications */}
      <SectionGroup
        title="Planned Publications and estimated publication date"
        endButton={(
          <AddRemoveButton
            id="section-b-add-planned-publication-button"
            label="Add Planned Publication"
            startIcon={<AddCircleIcon />}
            onClick={addPlannedPublication}
            disabled={status === FormStatus.SAVING}
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
            />
          )}
        />

      </SectionGroup>

      {/* Study Repositories */}
      <SectionGroup
        title={(
          <>
            Repository where study currently registered (e.g. dbGaP, ORCID),
            <br />
            and associated repository study identifier
          </>
        )}
        endButton={(
          <AddRemoveButton
            id="section-b-add-repository-button"
            label="Add Repository"
            startIcon={<AddCircleIcon />}
            onClick={addRepository}
            disabled={status === FormStatus.SAVING}
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
            />
          )}
        />
      </SectionGroup>

      {/* Funding Agency */}
      <SectionGroup title="Agency(s) and/or organization(s) that funded this study">
        <Autocomplete
          id="section-b-funding-agency"
          label="Funding Agency"
          value={funding.agency}
          name="study[funding][agency]"
          options={fundingAgencyOptions}
          placeholder="– Search and Select Agency –"
          freeSolo
          disableClearable
          required
          validate={(value: string) => value?.length > 0}
        />
        <TextInput
          id="section-b-grant-or-contract-numbers"
          label="Grant or Contract Number(s)"
          name="study[funding][grantNumber]"
          value={funding?.grantNumber}
          maxLength={50}
          placeholder="Enter Grant or Contract Number(s)"
          required
        />
        <TextInput
          id="section-b-nci-program-officer-name"
          label="NCI Program Officer name, if applicable"
          name="study[funding][nciProgramOfficer]"
          value={funding?.nciProgramOfficer}
          placeholder="Enter NCI Program Officer name, if applicable"
          maxLength={50}
        />
        <TextInput
          id="section-b-nci-gpa-name"
          label="NCI Genomic Program Administrator (GPA) name, if applicable"
          name="study[funding][nciGPA]"
          value={funding?.nciGPA}
          placeholder="Enter GPA name, if applicable"
        />
      </SectionGroup>
    </FormContainer>
  );
};

export default FormSectionB;
