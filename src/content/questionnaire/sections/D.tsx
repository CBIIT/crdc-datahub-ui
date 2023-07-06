import React, { FC, useEffect, useRef, useState } from "react";
import { parseForm } from "@jalik/form-parser";
import { cloneDeep } from "lodash";
import styled from 'styled-components';
import { Grid, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { Status as FormStatus, useFormContext } from "../../../components/Contexts/FormContext";
import FormContainer from "../../../components/Questionnaire/FormContainer";
import SectionGroup from "../../../components/Questionnaire/SectionGroup";
import SwitchInput from "../../../components/Questionnaire/SwitchInput";
import TextInput from "../../../components/Questionnaire/TextInput";
import { mapObjectWithKey } from "../utils";
import AddRemoveButton from "../../../components/Questionnaire/AddRemoveButton";
import TableAutocompleteInput from "../../../components/Questionnaire/TableAutocompleteInput";
import fileTypeOptions from "../../../config/FileTypeConfig";
import TableTextInput from "../../../components/Questionnaire/TableTextInput";
/**
 * Form Section D View
 *
 * @param {FormSectionProps} props
 * @returns {JSX.Element}
 */

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
      padding: 10px 12px 10px 15px;
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
  const { nextButtonRef, saveFormRef, submitFormRef, getFormObjectRef } = refs;
  const [fileTypeData, setFileTypeData] = useState<KeyedFileTypeData[]>(data.files?.map(mapObjectWithKey) || []);
  const fileTypeDataRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!saveFormRef.current || !submitFormRef.current) {
      return;
    }

    nextButtonRef.current.style.display = "flex";
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
      { key: `${fileTypeData.length}_${new Date().getTime()}`, type: ``, count: 0, amount: "" },
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
          value={dataTypes.includes("Clinical Trial")}
        />
        <SwitchInput
          id="section-d-imaging"
          label="Imaging"
          name="dataTypes[]"
          required
          value={dataTypes.includes("Imaging")}
          toggleContent={(
            <SwitchInput
              id="section-d-de-identified"
              label="Confirm the data you plan to submit are de-identified"
              name="dataTypes[]"
              required
              value={dataTypes.includes("Confirm the data you plan to submit are de-identified")}
              gridWidth={12}
            />
          )}
        />
        <SwitchInput
          id="section-d-genomics"
          label="Genomics"
          name="dataTypes[]"
          required
          value={dataTypes.includes("Genomics")}
        />
        <SwitchInput
          id="section-d-immunology"
          label="Immunology"
          name="dataTypes[]"
          required
          value={dataTypes.includes("Immunology")}
        />
        <Grid item md={6} />
        <SwitchInput
          id="section-d-proteomics"
          label="Proteomics"
          name="dataTypes[]"
          required
          value={dataTypes.includes("Proteomics")}
        />
        <TextInput
          id="section-d-other-data-types"
          label="Other data types (specify)"
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
          value={data.clinicalData.dataTypes.includes("Demographic Data")}
          tooltipText="Data made available for secondy research only after investigators have obtained approval from NIH to use the requested data for a particular project"
        />
        <SwitchInput
          id="section-d-relapse-recurrence-data"
          label="Relapse/Recurrence Data"
          name="clinicalData[dataTypes][]"
          value={data.clinicalData.dataTypes.includes("Relapse/Recurrence Data")}
          tooltipText="Data made available for secondy research only after investigators have obtained approval from NIH to use the requested data for a particular project"
        />
        <SwitchInput
          id="section-d-diagnosis-data"
          label="Diagnosis Data"
          name="clinicalData[dataTypes][]"
          value={data.clinicalData.dataTypes.includes("Diagnosis Data")}
          tooltipText="Data made available for secondy research only after investigators have obtained approval from NIH to use the requested data for a particular project"
        />
        <SwitchInput
          id="section-d-outcome-data"
          label="Outcome Data"
          name="clinicalData[dataTypes][]"
          value={data.clinicalData.dataTypes.includes("Outcome Data")}
          tooltipText="Data made available for secondy research only after investigators have obtained approval from NIH to use the requested data for a particular project"
        />
        <SwitchInput
          id="section-d-treatment-data"
          label="Treatment Data"
          name="clinicalData[dataTypes][]"
          value={data.clinicalData.dataTypes.includes("Treatment Data")}
          tooltipText="Data made available for secondy research only after investigators have obtained approval from NIH to use the requested data for a particular project"
        />
        <SwitchInput
          id="section-d-biospecimen-data"
          label="Biospecimen Data"
          name="clinicalData[dataTypes][]"
          value={data.clinicalData.dataTypes.includes("Biospecimen Data")}
          tooltipText="Data made available for secondy research only after investigators have obtained approval from NIH to use the requested data for a particular project"
        />
        <TextInput
          id="section-d-clinical-data-other-data-types"
          label="Other data types (specify)"
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
                <TableCell width="42%" className="fileTypeTableCell">
                  File Type
                  <span className="asterisk">*</span>
                  <input tabIndex={-1} style={{ height: "0", border: "none", width: "0" }} ref={fileTypeDataRef} />
                </TableCell>
                <TableCell width="17%" style={{ textAlign: 'center' }} className="tableTopRowMiddle">
                  Number of Files
                  <span className="asterisk">*</span>
                </TableCell>
                <TableCell width="42%" style={{ textAlign: 'center' }} className="tableTopRowMiddle">
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
                  <TableCell className="autoComplete">
                    <TableAutocompleteInput
                      inputID={`section-d-file-type-${idx}-file-type`}
                      value={fileData.type}
                      name={`files[${idx}][type]`}
                      options={fileTypeOptions.map((fileType) => fileType)}
                      placeholder="Select Type"
                      freeSolo
                    />
                    {/* {data.fileType} */}
                  </TableCell>
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
