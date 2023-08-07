import React, { FC, useEffect, useRef, useState } from "react";
import { parseForm } from "@jalik/form-parser";
import { cloneDeep } from "lodash";
import styled from 'styled-components';
import { FormHelperText, Table, TableBody, TableCell, TableHead, TableRow, styled as MuiStyled } from '@mui/material';
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { Status as FormStatus, useFormContext } from "../../../components/Contexts/FormContext";
import FormContainer from "../../../components/Questionnaire/FormContainer";
import SectionGroup from "../../../components/Questionnaire/SectionGroup";
import SwitchInput from "../../../components/Questionnaire/SwitchInput";
import TextInput from "../../../components/Questionnaire/TextInput";
import { mapObjectWithKey } from "../../../utils";
import AddRemoveButton from "../../../components/Questionnaire/AddRemoveButton";
import TableFileTypeAndExtensionInput from "../../../components/Questionnaire/TableFileTypeAndExtensionInput";
import { fileTypeOptions } from "../../../config/FileTypeConfig";
import TableTextInput from "../../../components/Questionnaire/TableTextInput";
import DatePickerInput from "../../../components/Questionnaire/DatePickerInput";
import RadioYesNoInput from "../../../components/Questionnaire/RadioYesNoInput";
import useFormMode from "./hooks/useFormMode";

export type KeyedFileTypeData = {
  key: string;
} & FileInfo;

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
const TableContainer = styled.div`
    margin-left: 12px;
    margin-bottom: 24px;
    display: flex;
    width: 100%;
    border: 1px solid #6B7294;
    border-radius: 10px;
    overflow: hidden;
    .readOnly {
      background-color: #D9DEE4;
      cursor: not-allowed;
    }
    .MuiTableContainer-root {
      width: 100%;
      margin-left: 12px;
      overflow-y: visible;
      height: 200px;
    }
    th {
      color: #083A50;
      font-size: 16px;
      font-family: Nunito;
      font-weight: 700;
      line-height: 19.6px;
    }
    table {
      overflow-y: visible;
    }

    .noBorder {
      border: none;
    }
    .topRowLast {
      border: none;
      padding: 10px 8px 10px 8px;
      text-align: center;
    }
    .fileTypeTableCell{
      border-top: none;
      border-right: 1px solid #6B7294;
      border-bottom: none;
      border-left: none;
      padding: 10px 20px 10px 20px;
      text-align:center;
    }
    .tableTopRowMiddle {
      border-top: none;
      border-right: 1px solid #6B7294;
      border-bottom: none;
      border-left: none;
      padding: 10px 10px 10px 10px;
      text-align: center;
    }
    .bottomRowMiddle {
      border-top: 1px solid #6B7294;
      border-right: 1px solid #6B7294;
      border-bottom: none;
      border-left: none;
      padding: 10px 10px 10px 10px;
    }
    .bottomRowLast {
      border-top: 1px solid #6B7294;
      border-right: none;
      border-bottom: none;
      border-left: none;
      text-align: center;
      padding: 10px;
      width: 20px;
      min-width: 0;
    }
    .autoComplete {
      border-top: 1px solid #6B7294 !important;
      border-right: 1px solid #6B7294 !important;
      border-bottom: none !important;
      border-left: none !important;
      padding: 10px 12px 10px 15px;
      .MuiStack-root {
        width: auto;
      }
    }
    .removeButtonContainer {
      margin: auto;
      width: 23px;
      .MuiStack-root {
        width: auto;
      }
    }
    .asterisk {
      color: #D54309;
      margin-left: 6px;
    }
    #invisibleTableInput {
       height: 0;
       border: none;
       width: 0;
    }
`;

const TableHelperText = MuiStyled(FormHelperText)({
  color: "#D54309",
  marginLeft: "22px",
  marginTop: "-15px",
});

const FormSectionD: FC<FormSectionProps> = ({ SectionOption, refs }: FormSectionProps) => {
  const { status, data: { questionnaireData: data } } = useFormContext();
  const { readOnlyInputs } = useFormMode();

  const [dataTypes, setDataTypes] = useState<string[]>(data.dataTypes);
  const formRef = useRef<HTMLFormElement>();
  const { nextButtonRef, saveFormRef, submitFormRef, approveFormRef, rejectFormRef, getFormObjectRef } = refs;
  const [fileTypeData, setFileTypeData] = useState<KeyedFileTypeData[]>(data.files?.map(mapObjectWithKey) || []);
  const fileTypeDataRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!saveFormRef.current || !submitFormRef.current) {
      return;
    }

    nextButtonRef.current.style.display = "flex";
    saveFormRef.current.style.display = "initial";
    submitFormRef.current.style.display = "none";
    approveFormRef.current.style.display = "none";
    rejectFormRef.current.style.display = "none";

    getFormObjectRef.current = getFormObject;
  }, [refs]);

  const getFormObject = (): FormObject | null => {
    if (!formRef.current) {
      return null;
    }

    const formObject = parseForm(formRef.current, { nullify: false });
    const combinedData = { ...cloneDeep(data), ...formObject };
    // Remove empty strings from dataType arrays
    combinedData.dataTypes = combinedData.dataTypes.filter((str) => str !== "");
    combinedData.clinicalData.dataTypes = combinedData.clinicalData.dataTypes.filter((str) => str !== "");

    combinedData.targetedReleaseDate = formObject.targetedReleaseDate === "MM/DD/YYYY" ? "" : formObject.targetedReleaseDate;
    combinedData.targetedSubmissionDate = formObject.targetedSubmissionDate === "MM/DD/YYYY" ? "" : formObject.targetedSubmissionDate;
    if (formObject.imagingDataDeIdentified === "true") {
      combinedData.imagingDataDeIdentified = true;
    } else if (formObject.imagingDataDeIdentified === "false") {
      combinedData.imagingDataDeIdentified = false;
    }
    // Override empty file array
    combinedData.files = formObject.files;

    if (fileTypeData.length === 0) {
      fileTypeDataRef.current.setCustomValidity("At least one file type is required");
    } else {
      fileTypeDataRef.current.setCustomValidity("");
    }

    return { ref: formRef, data: combinedData };
  };

  const addFileDataType = () => {
    setFileTypeData([
      ...fileTypeData,
      { key: `${fileTypeData.length}_${new Date().getTime()}`, type: ``, count: 0, amount: "", extension: "" },
    ]);
    fileTypeDataRef.current.setCustomValidity("");
  };

  const removeFileDataType = (key: string) => {
    if (fileTypeData.length === 1) {
      fileTypeDataRef.current.setCustomValidity("At least one file type is required");
    } else {
      fileTypeDataRef.current.setCustomValidity("");
    }
    setFileTypeData(fileTypeData.filter((c) => c.key !== key));
  };

  const handleDataTypesChange = (checked: boolean, value: string) => {
    const updatedDataTypes = checked
      ? [...dataTypes, value]
      : dataTypes.filter((dt) => dt !== value);

    setDataTypes(updatedDataTypes);
  };

  return (
    <FormContainer
      description={SectionOption.title}
      formRef={formRef}
    >
      {/* Targeted Data Submission Delivery Date Section */}
      <SectionGroup
        title="Data Delivery and Release Dates"
      >
        <DatePickerInput
          inputID="section-d-targeted-data-submission-delivery-date"
          label="Targeted Data Submission Delivery Date"
          name="targetedSubmissionDate"
          tooltipText="The date that transfer of data from the submitter to DataHub is expected to begin."
          errorText="Please enter a valid date"
          initialValue={data.targetedSubmissionDate}
          gridWidth={6}
          disablePast
        />
        <DatePickerInput
          inputID="section-d-expected-publication-date"
          label="Expected Publication Date"
          name="targetedReleaseDate"
          tooltipText="The date that submitters would like their data to be released to the public."
          errorText="Please enter a valid date"
          initialValue={data.targetedReleaseDate}
          gridWidth={6}
          disablePast
        />
      </SectionGroup>
      {/* Data Types Section */}
      <SectionGroup
        title="Data Types"
        description="Indicate the major types of data included in this submission. For each type listed, select Yes or No. Describe any additional major types of data in Other (specify)"
      >
        <SwitchInput
          id="section-d-clinical-trial"
          label="Clinical Trial"
          name="dataTypes[]"
          required
          graphQLValue="clinicalTrial"
          value={dataTypes.includes("clinicalTrial")}
          tooltipText="A research study in which one or more subjects are prospectively assigned to one or more interventions (which may include placebo or other control) to evaluate the effects of those interventions on health-related biomedical outcomes."
          readOnly={readOnlyInputs}
        />
        <SwitchInput
          id="section-d-immunology"
          label="Immunology"
          name="dataTypes[]"
          graphQLValue="immunology"
          required
          value={dataTypes.includes("immunology")}
          tooltipText="Data from experiments studying the function of a body's immune system.  Experiments that focus primarily on genomic or imaging approaches should be classified in those areas as well."
          readOnly={readOnlyInputs}
        />
        <SwitchInput
          id="section-d-genomics"
          label="Genomics"
          name="dataTypes[]"
          graphQLValue="genomics"
          required
          value={dataTypes.includes("genomics")}
          tooltipText="The branch of molecular biology concerned with the structure, function, evolution, and mapping of genomes.  Includes data from DNA sequencing, RNA sequencing, mutational analysis, and other experiments focused on genomes."
          readOnly={readOnlyInputs}
        />
        <SwitchInput
          id="section-d-proteomics"
          label="Proteomics"
          graphQLValue="proteomics"
          name="dataTypes[]"
          required
          value={dataTypes.includes("proteomics")}
          tooltipText="Data from the study of the large scale expression and use of proteins."
          readOnly={readOnlyInputs}
        />
        <SwitchInput
          id="section-d-imaging"
          label="Imaging"
          name="dataTypes[]"
          graphQLValue="imaging"
          required
          value={dataTypes.includes("imaging")}
          onChange={(e, checked) => handleDataTypesChange(checked, "imaging")}
          toggleContent={(
            <RadioYesNoInput
              id="section-d-imaging-de-identified"
              value={data.imagingDataDeIdentified}
              containerWidth="1100px"
              gridWidth={12}
              label="Confirm the imaging data you plan to submit are de-identified"
              name="imagingDataDeIdentified"
              row
              required
              readOnly={readOnlyInputs}
            />
          )}
          tooltipText="Medical and experimental images from disciplines such as radiology, pathology, and microscopy."
          readOnly={readOnlyInputs}
        />
        <SwitchInput
          id="section-d-epidemiologic-or-cohort"
          label="Epidemiologic or Cohort"
          graphQLValue="epidemiologicOrCohort"
          name="dataTypes[]"
          required
          value={dataTypes.includes("epidemiologicOrCohort")}
          tooltipText="Data related to the incidence and distribution of disease across populations."
          readOnly={readOnlyInputs}
        />
        <TextInput
          id="section-d-other-data-types"
          label="Other data types (Specify)"
          name="otherDataTypes"
          value={data.otherDataTypes}
          placeholder="Other Data Types (Specify)"
          gridWidth={12}
          tooltipText="Data that do not fit in any of the other categories."
          readOnly={readOnlyInputs}
        />
      </SectionGroup>

      {/* Clinical Data */}
      <SectionGroup
        title="Clinical Data Types"
        description="If 'Clinical' data will be submitted, please provide more details about what types of clinical data will be included. Indicate Yes or No for each type listed below. Describe any additional data types in Other(specify)."
      >
        <SwitchInput
          id="section-d-demographic-data"
          label="Demographic Data"
          name="clinicalData[dataTypes][]"
          graphQLValue="demographicData"
          value={data.clinicalData.dataTypes.includes("demographicData")}
          tooltipText="Indicate whether demographics information is available for the study (such as age or gender)."
          readOnly={readOnlyInputs}
        />
        <SwitchInput
          id="section-d-relapse-recurrence-data"
          label="Relapse/Recurrence Data"
          name="clinicalData[dataTypes][]"
          graphQLValue="relapseRecurrenceData"
          value={data.clinicalData.dataTypes.includes("relapseRecurrenceData")}
          tooltipText="Relapse/recurrence data refers to information associated with the return of a disease after a period of remission. Indicate whether relapse/recurrence data is available for the study."
          readOnly={readOnlyInputs}
        />
        <SwitchInput
          id="section-d-diagnosis-data"
          label="Diagnosis Data"
          name="clinicalData[dataTypes][]"
          graphQLValue="diagnosisData"
          value={data.clinicalData.dataTypes.includes("diagnosisData")}
          tooltipText="Indicate whether diagnosis information is available for the study."
          readOnly={readOnlyInputs}
        />
        <SwitchInput
          id="section-d-outcome-data"
          label="Outcome Data"
          name="clinicalData[dataTypes][]"
          graphQLValue="outcomeData"
          value={data.clinicalData.dataTypes.includes("outcomeData")}
          tooltipText="Outcome data refers to information on a specific result or effect that can be measured. Examples of outcomes include decreased pain, reduced tumor size, and improvement of disease. Indicate whether outcome data is available for the study."
          readOnly={readOnlyInputs}
        />
        <SwitchInput
          id="section-d-treatment-data"
          label="Treatment Data"
          name="clinicalData[dataTypes][]"
          graphQLValue="treatmentData"
          value={data.clinicalData.dataTypes.includes("treatmentData")}
          tooltipText="Treatment data refers to information on the action or administration of therapeutic agents to produce an effect that is intended to alter the course of a pathological process. Indicate whether treatment data is available for the study."
          readOnly={readOnlyInputs}
        />
        <SwitchInput
          id="section-d-biospecimen-data"
          label="Biospecimen Data"
          name="clinicalData[dataTypes][]"
          graphQLValue="biospecimenData"
          value={data.clinicalData.dataTypes.includes("biospecimenData")}
          tooltipText="Biospecimen data refers to information associated with the biological sample, portion, analyte, or aliquot. Indicate whether biospecimen data is available for the study."
          readOnly={readOnlyInputs}
        />
        <TextInput
          id="section-d-clinical-data-other-data-types"
          label="Other Clinical Data Types (Specify)"
          name="clinicalData[otherDataTypes]"
          value={data.clinicalData.otherDataTypes}
          placeholder="Other clinical data types (Specify)"
          gridWidth={12}
          tooltipText="If there are any additional types of data included with the study not already specified above, describe here."
          readOnly={readOnlyInputs}
        />
        <AdditionalDataInFutureSection>
          <div id="AdditionalDataInFutureSectionText">
            Inidcate if there will be additional types of data included with a future submission
          </div>
          <SwitchInput
            id="section-d-additional-data-in-future"
            label="Additional Data in future"
            name="clinicalData[futureDataTypes]"
            value={data.clinicalData.futureDataTypes}
            gridWidth={10}
            isBoolean
            readOnly={readOnlyInputs}
          />
        </AdditionalDataInFutureSection>
      </SectionGroup>
      <SectionGroup
        title="File Types"
        description={(
          <>
            List the number, size, and formats of files in the submission in the table below.
            <br />
            Indicate one file type per row. At least one file type is required.
          </>
        )}
        endButton={(
          <AddRemoveButton
            id="section-d-add-file-type-button"
            label="Add File Type"
            startIcon={<AddCircleIcon />}
            onClick={addFileDataType}
            disabled={readOnlyInputs || status === FormStatus.SAVING}
          />
        )}
      >
        <TableContainer>
          <Table className="noBorder">
            <TableHead className="noBorder">
              <TableRow className="noBorder">
                <TableCell width="25%" className="fileTypeTableCell">
                  File Type
                  <span className="asterisk">*</span>
                  <input tabIndex={-1} id="invisibleTableInput" ref={fileTypeDataRef} />
                </TableCell>
                <TableCell width="20%" className="fileTypeTableCell">
                  File Extension
                  <span className="asterisk">*</span>
                </TableCell>
                <TableCell width="13%" className="tableTopRowMiddle">
                  File Count
                  <span className="asterisk">*</span>
                </TableCell>
                <TableCell width="20%" className="tableTopRowMiddle">
                  Estimated amount of data (KB, MB, GB, TB)
                  <span className="asterisk">*</span>
                </TableCell>
                <TableCell width="5%" className="topRowLast">Remove</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fileTypeData.map((fileData: KeyedFileTypeData, idx: number) => (
                <TableRow
                  key={fileData.key}
                  className={`${readOnlyInputs ? "readOnly" : ""}`}
                >
                  <TableFileTypeAndExtensionInput
                    inputID={`section-d-file-type-${idx}-file`}
                    typeValue={fileData.type}
                    extensionValue={fileData.extension}
                    name={`files[${idx}]`}
                    options={fileTypeOptions.map((fileType) => fileType)}
                  />
                  <TableCell className="bottomRowMiddle">
                    <TableTextInput
                      id={`section-d-file-type-${idx}-number-of-files`}
                      name={`files[${idx}][count]`}
                      type="number"
                      value={fileData.count}
                      placeholder="12345"
                      pattern="^[1-9]\d*$"
                      patternValidityMessage="Please enter a whole number greater than 0"
                    />
                  </TableCell>
                  <TableCell className="bottomRowMiddle">
                    <TableTextInput
                      id={`section-d-file-type-${idx}-amount-of-data`}
                      name={`files[${idx}][amount]`}
                      value={fileData.amount}
                      placeholder="E.g. 200GB (50 Char Limit)"
                      maxLength={50}
                    />
                  </TableCell>
                  <TableCell className="bottomRowLast">
                    <div className="removeButtonContainer">
                      <AddRemoveButton
                        id={`section-d-file-type-${idx}-remove-file-type-button`}
                        placement="start"
                        onClick={() => removeFileDataType(fileData.key)}
                        startIcon={<RemoveCircleIcon />}
                        iconColor="#F18E8E"
                        disabled={readOnlyInputs || status === FormStatus.SAVING}
                        sx={{ minWidth: "0px !important" }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {!fileTypeDataRef?.current?.checkValidity() && (
          <TableHelperText>
            At least one file type is required
          </TableHelperText>
        )}
      </SectionGroup>
      <SectionGroup
        title="Additional Comments"
        description="Additional Comments or Information about this submission."
      >
        <TextInput
          label=""
          name="submitterComment"
          value={data.submitterComment}
          gridWidth={12}
          maxLength={500}
          placeholder="500 characters allowed"
          minRows={5}
          multiline
          sx={{ marginTop: "-20px" }}
          readOnly={readOnlyInputs}
        />
      </SectionGroup>
    </FormContainer>
  );
};

export default FormSectionD;
