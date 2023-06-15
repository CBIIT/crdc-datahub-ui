import React, { FC, useEffect, useRef, useState } from "react";
import { AutocompleteChangeReason, Button, Grid, Stack } from '@mui/material';
import { parseForm } from '@jalik/form-parser';
import { withStyles } from '@mui/styles';
import { cloneDeep } from 'lodash';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import LabelIcon from '@mui/icons-material/Label';
import programOptions from '../../../config/ProgramConfig';
import { Status as FormStatus, useFormContext } from "../../../components/Contexts/FormContext";
import FormContainer from "../../../components/Questionnaire/FormContainer";
import SectionGroup from "../../../components/Questionnaire/SectionGroup";
import TextInput from "../../../components/Questionnaire/TextInput";
import Autocomplete from '../../../components/Questionnaire/AutocompleteInput';
import Publication from '../../../components/Questionnaire/Publication';
import Repository from '../../../components/Questionnaire/Repository';
import { findProgram, findStudy, mapObjectWithKey } from '../utils';

type KeyedPublication = {
  key: string;
} & Publication;

type KeyedRepository = {
  key: string;
} & Repository;

/**
 * Form Section D View
 *
 * @param {FormSectionProps} props
 * @returns {JSX.Element}
 */
const FormSectionD: FC<FormSectionProps> = ({ refs, classes }: FormSectionProps) => {
  const { status, data } = useFormContext();

  const [program, setProgram] = useState<Program>(data.program);
  const [programOption, setProgramOption] = useState<ProgramOption>(findProgram(program.title));
  const [study, setStudy] = useState<Study>(data.study);
  const [studyOption, setStudyOption] = useState<StudyOption>(findStudy(study.title, programOption));
  const [publications, setPublications] = useState<KeyedPublication[]>(data.publications?.map(mapObjectWithKey) || []);
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
      title="Section D"
      description="Submission Data Types"
      formRef={formRef}
    >
      {/* Data Types Section */}
      <SectionGroup title="Data Types. Indicate the major types of data included in this submission. For each type listed, select Yes or No. Describe any additional major types of data in Other (specify) " divider={false}>
        Test
      </SectionGroup>
    </FormContainer>
  );
};

const styles = () => ({
  button: {
    marginTop: "25px",
    color: "#346798",
    padding: "6px 20px",
    minWidth: "115px",
    borderRadius: "25px",
    border: "2px solid #AFC2D8 !important",
    background: "transparent",
    "text-transform": "none",
    "& .MuiButton-startIcon": {
      marginRight: "14px",
    },
  },
  noContentButton: {
    marginTop: "-93px",
  },
});

export default withStyles(styles, { withTheme: true })(FormSectionD);
