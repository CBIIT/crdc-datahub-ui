import React, { FC, useEffect, useRef, useState } from "react";
import { parseForm } from "@jalik/form-parser";
import { withStyles } from "@mui/styles";
import { cloneDeep } from "lodash";
import styled from 'styled-components';
import { Grid } from '@mui/material';
import {
  useFormContext,
} from "../../../components/Contexts/FormContext";
import FormContainer from "../../../components/Questionnaire/FormContainer";
import SectionGroup from "../../../components/Questionnaire/SectionGroup";
import SwitchInput from "../../../components/Questionnaire/SwitchInput";
import TextInput from "../../../components/Questionnaire/TextInput";
import FileTypeTable from "../../../components/Questionnaire/FileTypeTable";
/**
 * Form Section D View
 *
 * @param {FormSectionProps} props
 * @returns {JSX.Element}
 */

const AdditionalDataInFutureSection = styled.div`
    display: flex;
    flex-direction: column;
    width: fit-content;
    margin-left: 12px;
    color: #083A50;
    font-size: 16px;
    font-family: Nunito;
    font-weight: 700;
    line-height: 19.6px;

    #AdditionalDataInFutureSectionText {
      margin-bottom: 16px;
    }
`;
const FormSectionD: FC<FormSectionProps> = ({ refs, classes }: FormSectionProps) => {
  const { data } = useFormContext();
  const [dataTypes] = useState<DataTypes>(data.dataTypes);
  const formRef = useRef<HTMLFormElement>();
  const { saveFormRef, submitFormRef, getFormObjectRef } = refs;

  useEffect(() => {
    if (!saveFormRef.current || !submitFormRef.current) {
      return;
    }

    saveFormRef.current.style.display = "initial";
    submitFormRef.current.style.display = "none";

    getFormObjectRef.current = getFormObject;
  }, [refs]);

  const getFormObject = (): FormObject | null => {
    if (!formRef.current) {
      return null;
    }

    const formObject = parseForm(formRef.current, { nullify: false });
    const combinedData = { ...cloneDeep(data), ...formObject };

    // Reset additional contacts if none are provided
    if (
      !formObject.additionalContacts
      || formObject.additionalContacts.length === 0
    ) {
      combinedData.additionalContacts = [];
    }

    return { ref: formRef, data: combinedData };
  };

  return (
    <FormContainer
      title="Section D"
      description="Submission Data Types"
      formRef={formRef}
    >
      {/* Data Types Section */}
      <SectionGroup
        title="Data Types."
        description="Indicate the major types of data included in this submission. For each type listed, select Yes or No. Describe any additional major types of data in Other (specify)"
        divider={false}
      >
        <SwitchInput
          label="Clinical Trial"
          name="dataTypes[clinicalTrial]"
          required
          value={dataTypes.clinicalTrial}
        />
        <SwitchInput
          label="Imaging"
          name="dataTypes[imaging]"
          required
          value={dataTypes.imaging}
        />
        <SwitchInput
          label="Genomics"
          name="dataTypes[genomics]"
          required
          value={dataTypes.genomics}
        />
        <SwitchInput
          label="Immunology"
          name="dataTypes[immunology]"
          required
          value={dataTypes.immunology}
        />
        <Grid item md={6} />
        <SwitchInput
          label="Proteomics"
          name="dataTypes[proteomics]"
          required
          value={dataTypes.proteomics}
        />
        <TextInput
          label="Other data types (specify)"
          name="dataTypes[otherDataTypes]"
          value={dataTypes.otherDataTypes}
          placeholder="Enter Types"
          gridWidth={12}
        />
      </SectionGroup>

      {/* Clinical Data */}
      <SectionGroup
        title="Clinical Data."
        description="If 'Clinical' data will be submitted, please provide more details about what types of clinical data will be included. Indicate Yes or No for each type listed below. Describe any additional data types in Other(specify)."
      >
        <SwitchInput
          label="Demographic Data"
          name="dataTypes[demographic]"
          value={dataTypes.demographic}
          tooltipText="Data made available for secondy research only after investigators have obtained approval from NIH to use the requested data for a particular project"
        />
        <SwitchInput
          label="Relapse/Recurrence Data"
          name="dataTypes[relapseRecurrence]"
          value={dataTypes.relapseRecurrence}
          tooltipText="Data made available for secondy research only after investigators have obtained approval from NIH to use the requested data for a particular project"
        />
        <SwitchInput
          label="Diagnosis Data"
          name="dataTypes[diagnosis]"
          value={dataTypes.diagnosis}
          tooltipText="Data made available for secondy research only after investigators have obtained approval from NIH to use the requested data for a particular project"
        />
        <SwitchInput
          label="Outcome Data"
          name="dataTypes[outcome]"
          value={dataTypes.outcome}
          tooltipText="Data made available for secondy research only after investigators have obtained approval from NIH to use the requested data for a particular project"
        />
        <SwitchInput
          label="Treatment Data"
          name="dataTypes[treatment]"
          value={dataTypes.treatment}
          tooltipText="Data made available for secondy research only after investigators have obtained approval from NIH to use the requested data for a particular project"
        />
        <SwitchInput
          label="Biospecimen Data"
          name="dataTypes[biospecimen]"
          value={dataTypes.biospecimen}
          tooltipText="Data made available for secondy research only after investigators have obtained approval from NIH to use the requested data for a particular project"
        />
        <TextInput
          label="Other data types (specify)"
          name="dataTypes[otherDataTypes]"
          value={dataTypes.otherDataTypes}
          placeholder="Enter Types"
          gridWidth={12}
        />
        <AdditionalDataInFutureSection>
          <div id="AdditionalDataInFutureSectionText">
            Inidcate if there will be additional types of data included with a future submission
          </div>
          <SwitchInput
            label="Additional Data in future"
            name="dataTypes[additionDataInFuture]"
            value={dataTypes.additionDataInFuture}
            gridWidth={10}
          />
        </AdditionalDataInFutureSection>
      </SectionGroup>
      <SectionGroup
        title="File Type."
        description="List the number, size, and formats of files in the submission in the table below. Indicate one file type per row. At least one file type is required."
      >
        <FileTypeTable />
      </SectionGroup>
      <SectionGroup
        title="Additional comments or information about the submission"
      >
        <TextInput
          className={classes.additionalCommentsNoLabel}
          label=""
          name="dataTypes[additionalComments]"
          value={dataTypes.additionalComments}
          gridWidth={12}
          maxLength={500}
          placeholder="500 characters allowed"
          minRows={5}
          multiline
        />
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
  fileTypeSectionGroup: {
    marginTop: "-16px"
  },
});

export default withStyles(styles, { withTheme: true })(FormSectionD);
