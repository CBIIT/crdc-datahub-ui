import React, { FC, useEffect, useRef, useState } from "react";
import { parseForm } from "@jalik/form-parser";
import { cloneDeep } from "lodash";
import styled from 'styled-components';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { Status as FormStatus, useFormContext } from "../../../components/Contexts/FormContext";
import FormContainer from "../../../components/Questionnaire/FormContainer";
import SectionGroup from "../../../components/Questionnaire/SectionGroup";
import SwitchInput from "../../../components/Questionnaire/SwitchInput";
import TextInput from "../../../components/Questionnaire/TextInput";
import { mapObjectWithKey } from "../utils";
import AddRemoveButton from "../../../components/Questionnaire/AddRemoveButton";
import TableFileTypeAndExtensionInput from "../../../components/Questionnaire/TableFileTypeAndExtensionInput";
import { fileTypeOptions } from "../../../config/FileTypeConfig";
import TableTextInput from "../../../components/Questionnaire/TableTextInput";
/**
 * Form Section D View
 *
 * @param {FormSectionProps} props
 * @returns {JSX.Element}
 */

type KeyedFileTypeData = {
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
    display: flex;
    width: 100%;
    border: 1px solid #6B7294;
    border-radius: 10px;
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
    }
    .fileTypeTableCell{
      border-top: none;
      border-right: 1px solid #6B7294;
      border-bottom: none;
      border-left: none;
      padding: 10px 20px 10px 20px;
    }
    .tableTopRowMiddle {
      border-top: none;
      border-right: 1px solid #6B7294;
      border-bottom: none;
      border-left: none;
      padding: 10px 10px 10px 10px;
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
`;

const FormSectionD: FC<FormSectionProps> = ({ SectionOption, refs }: FormSectionProps) => {
  const { status, data } = useFormContext();
  const [dataTypes] = useState<string[]>(data.dataTypes);
  const formRef = useRef<HTMLFormElement>();
  const { saveFormRef, submitFormRef, getFormObjectRef } = refs;
  const [fileTypeData, setFileTypeData] = useState<KeyedFileTypeData[]>(data.files?.map(mapObjectWithKey) || []);
  const fileTypeDataRef = useRef<HTMLInputElement>(null);
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
    // Remove empty strings from dataType arrays
    combinedData.dataTypes = combinedData.dataTypes.filter((str) => str !== "");
    combinedData.clinicalData.dataTypes = combinedData.clinicalData.dataTypes.filter((str) => str !== "");

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
  return (
    <FormContainer
      description={SectionOption.title}
      formRef={formRef}
    >
      {/* Data Types Section */}
      <SectionGroup
        title="Data Types."
        description="Indicate the major types of data included in this submission. For each type listed, select Yes or No. Describe any additional major types of data in Other (specify)"
        divider={false}
      >
        <SwitchInput
          id="section-d-clinical-trial"
          label="Clinical Trial"
          name="dataTypes[]"
          required
          graphQLValue="clinicalTrial"
          value={dataTypes.includes("clinicalTrial")}
        />
        <SwitchInput
          id="section-d-imaging"
          label="Imaging"
          name="dataTypes[]"
          graphQLValue="imaging"
          required
          value={dataTypes.includes("imaging")}
          toggleContent={(
            <SwitchInput
              id="section-d-de-identified"
              label="Confirm the imaging data you plan to submit are de-identified"
              name="dataTypes[]"
              graphQLValue="imagingDeidentified"
              required
              value={dataTypes.includes("imagingDeidentified")}
              gridWidth={12}
            />
          )}
        />
        <SwitchInput
          id="section-d-genomics"
          label="Genomics"
          name="dataTypes[]"
          graphQLValue="genomics"
          required
          value={dataTypes.includes("genomics")}
        />
        <SwitchInput
          id="section-d-immunology"
          label="Immunology"
          name="dataTypes[]"
          graphQLValue="immunology"
          required
          value={dataTypes.includes("immunology")}
        />
        <SwitchInput
          id="section-d-epidemiologic-or-cohort"
          label="Epidemiologic or Cohort"
          graphQLValue="epidemiologicOrCohort"
          name="dataTypes[]"
          required
          value={dataTypes.includes("epidemiologicOrCohort")}
        />
        <SwitchInput
          id="section-d-proteomics"
          label="Proteomics"
          graphQLValue="proteomics"
          name="dataTypes[]"
          required
          value={dataTypes.includes("proteomics")}
        />
        <TextInput
          id="section-d-other-data-types"
          label="Other data types (Specify)"
          name="otherDataTypes"
          value={data.otherDataTypes}
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
          id="section-d-demographic-data"
          label="Demographic Data"
          name="clinicalData[dataTypes][]"
          graphQLValue="demographicData"
          value={data.clinicalData.dataTypes.includes("demographicData")}
          tooltipText="Data made available for secondy research only after investigators have obtained approval from NIH to use the requested data for a particular project"
        />
        <SwitchInput
          id="section-d-relapse-recurrence-data"
          label="Relapse/Recurrence Data"
          name="clinicalData[dataTypes][]"
          graphQLValue="relapseRecurrenceData"
          value={data.clinicalData.dataTypes.includes("relapseRecurrenceData")}
          tooltipText="Data made available for secondy research only after investigators have obtained approval from NIH to use the requested data for a particular project"
        />
        <SwitchInput
          id="section-d-diagnosis-data"
          label="Diagnosis Data"
          name="clinicalData[dataTypes][]"
          graphQLValue="diagnosisData"
          value={data.clinicalData.dataTypes.includes("diagnosisData")}
          tooltipText="Data made available for secondy research only after investigators have obtained approval from NIH to use the requested data for a particular project"
        />
        <SwitchInput
          id="section-d-outcome-data"
          label="Outcome Data"
          name="clinicalData[dataTypes][]"
          graphQLValue="outcomeData"
          value={data.clinicalData.dataTypes.includes("outcomeData")}
          tooltipText="Data made available for secondy research only after investigators have obtained approval from NIH to use the requested data for a particular project"
        />
        <SwitchInput
          id="section-d-treatment-data"
          label="Treatment Data"
          name="clinicalData[dataTypes][]"
          graphQLValue="treatmentData"
          value={data.clinicalData.dataTypes.includes("treatmentData")}
          tooltipText="Data made available for secondy research only after investigators have obtained approval from NIH to use the requested data for a particular project"
        />
        <SwitchInput
          id="section-d-biospecimen-data"
          label="Biospecimen Data"
          name="clinicalData[dataTypes][]"
          graphQLValue="biospecimenData"
          value={data.clinicalData.dataTypes.includes("biospecimenData")}
          tooltipText="Data made available for secondy research only after investigators have obtained approval from NIH to use the requested data for a particular project"
        />
        <TextInput
          id="section-d-clinical-data-other-data-types"
          label="Other clinical data types (Specify)"
          name="clinicalData[otherDataTypes]"
          value={data.clinicalData.otherDataTypes}
          placeholder="Enter Types"
          gridWidth={12}
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
          />
        </AdditionalDataInFutureSection>
      </SectionGroup>
      <SectionGroup
        title="File Type."
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
            disabled={status === FormStatus.SAVING}
          />
        )}
      >
        <TableContainer>
          <Table className="noBorder">
            <TableHead className="noBorder">
              <TableRow className="noBorder">
                <TableCell width="30%" className="fileTypeTableCell">
                  File Type
                  <span className="asterisk">*</span>
                  <input tabIndex={-1} style={{ height: "0", border: "none", width: "0" }} ref={fileTypeDataRef} />
                </TableCell>
                <TableCell width="20%" style={{ textAlign: 'center' }} className="fileTypeTableCell">
                  File Extension
                  <span className="asterisk">*</span>
                </TableCell>
                <TableCell width="13%" style={{ textAlign: 'center' }} className="tableTopRowMiddle">
                  File Count
                  <span className="asterisk">*</span>
                </TableCell>
                <TableCell width="20%" style={{ textAlign: 'center' }} className="tableTopRowMiddle">
                  Estimated amount of data (KB, MB, GB, TB)
                  <span className="asterisk">*</span>
                </TableCell>
                <TableCell width="5%" style={{ textAlign: 'center' }} className="topRowLast">Remove</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fileTypeData.map((fileData: KeyedFileTypeData, idx: number) => (
                <TableRow
                  key={fileData.key}
                >
                  <TableFileTypeAndExtensionInput
                    inputID={`section-d-file-type-${idx}-file`}
                    typeValue={fileData.type}
                    extensionValue={fileData.extension}
                    name={`files[${idx}]`}
                    options={fileTypeOptions.map((fileType) => fileType)}
                    placeholder="Select Type"
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
                        disabled={status === FormStatus.SAVING}
                        sx={{ minWidth: "0px !important" }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </SectionGroup>
      <SectionGroup
        title="Additional comments or information about the submission"
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
        />
      </SectionGroup>
    </FormContainer>
  );
};

export default FormSectionD;
