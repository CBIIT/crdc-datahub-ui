import React, { FC, useEffect, useRef, useState } from "react";
import { parseForm } from "@jalik/form-parser";
import { withStyles } from "@mui/styles";
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

type KeyedFileTypeData = {
  key: string;
} & FileTypeData;

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
  const { status, data } = useFormContext();
  const [dataTypes] = useState<DataTypes>(data.dataTypes);
  const formRef = useRef<HTMLFormElement>();
  const { saveFormRef, submitFormRef, getFormObjectRef } = refs;
  const [fileTypeData, setFileTypeData] = useState<KeyedFileTypeData[]>(data.dataTypes?.fileTypes?.map(mapObjectWithKey) || []);
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

    // Reset additional contacts if none are provided
    if (
      !formObject.additionalContacts
      || formObject.additionalContacts.length === 0
    ) {
      combinedData.additionalContacts = [];
    }

    return { ref: formRef, data: combinedData };
  };

  const addFileDataType = () => {
    setFileTypeData([
      ...fileTypeData,
      { key: `${fileTypeData.length}_${new Date().getTime()}`, fileType: ``, numberOfFiles: "", amountOfData: "" },
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
          toggleContent={(
            <SwitchInput
              label="Confirm the data you plan to submit are de-identified"
              name="dataTypes[deIdentified]"
              required
              value={dataTypes.deIdentified}
              gridWidth={12}
            />
          )}
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
        description={(
          <>
            List the number, size, and formats of files in the submission in the table below.
            <br />
            Indicate one file type per row. At least one file type is required.
          </>
        )}
        endButton={(
          <AddRemoveButton
            label="Add File Type"
            startIcon={<AddCircleIcon />}
            onClick={addFileDataType}
            disabled={status === FormStatus.SAVING}
          />
        )}
      >
        <div className={classes.tableContainer}>
          <Table className={classes.noBorder}>
            <TableHead className={classes.noBorder}>
              <TableRow className={classes.noBorder}>
                <TableCell width="42%" className={classes.fileTypeTableCell}>
                  File Type
                  <span className={classes.asterisk}>*</span>
                  <input tabIndex={-1} style={{ height: "0", border: "none", width: "0" }} ref={fileTypeDataRef} />
                </TableCell>
                <TableCell width="17%" style={{ textAlign: 'center' }} className={classes.tableTopRowMiddle}>
                  Number of Files
                  <span className={classes.asterisk}>*</span>
                </TableCell>
                <TableCell width="42%" style={{ textAlign: 'center' }} className={classes.tableTopRowMiddle}>
                  Estimated amount of data (KB, MB, GB, TB)
                  <span className={classes.asterisk}>*</span>
                </TableCell>
                <TableCell width="5%" style={{ textAlign: 'center' }} className={classes.topRowLast}>Remove</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fileTypeData.map((fileData: KeyedFileTypeData, idx: number) => (
                <TableRow
                  key={fileData.key}
                >
                  <TableCell className={classes.autoComplete}>
                    <TableAutocompleteInput
                      value={fileData.fileType}
                      name={`dataTypes[fileTypes][${idx}][fileType]`}
                      options={fileTypeOptions.map((fileType) => fileType)}
                      placeholder="Select Type"
                      freeSolo
                    />
                    {/* {data.fileType} */}
                  </TableCell>
                  <TableCell className={classes.bottomRowMiddle}>
                    <TableTextInput
                      name={`dataTypes[fileTypes][${idx}][numberOfFiles]`}
                      value={fileData.numberOfFiles}
                      placeholder="12345"
                      pattern="^[1-9]\d*$"
                      patternValidityMessage="Please enter a whole number greater than 0"
                    />
                  </TableCell>
                  <TableCell className={classes.bottomRowMiddle}>
                    <TableTextInput
                      name={`dataTypes[fileTypes][${idx}][amountOfData]`}
                      value={fileData.amountOfData}
                      placeholder="E.g. 200GB (50 Char Limit)"
                      maxLength={50}
                    />
                  </TableCell>
                  <TableCell className={classes.bottomRowLast}>
                    <div className={classes.removeButtonContainer}>
                      <AddRemoveButton
                        className={classes.addRemoveButtonInTable}
                        placement="start"
                        onClick={() => removeFileDataType(fileData.key)}
                        startIcon={<RemoveCircleIcon />}
                        iconColor="#F18E8E"
                        disabled={status === FormStatus.SAVING}
                      />
                    </div>
                  </TableCell>
                </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
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
  fileTypeSectionGroup: {
    marginTop: "-16px"
  },
  tableContainer: {
    marginLeft: "12px",
    display: "flex",
    width: "100%",
    "&.MuiTableContainer-root": {
      width: "100%",
      marginLeft: "12px",
      overflowY: 'visible',
      height: "200px",
    },
    "& th": {
      color: "#083A50",
      fontSize: "16px",
      fontFamily: "Nunito",
      fontWeight: "700",
      lineHeight: "19.6px",
    },
    "& table": {
      overflowY: 'visible',
    },

    border: '1px solid #6B7294',
    borderRadius: '10px',
  },
  noBorder: {
    border: "none"
  },
  topRowLast: {
    border: "none",
    padding: "10px 8px 10px 8px",
  },
  fileTypeTableCell: {
    borderTop: 'none',
    borderRight: '1px solid #6B7294',
    borderBottom: 'none',
    borderLeft: 'none',
    padding: "10px 12px 10px 15px",
  },
  tableTopRowMiddle: {
    borderTop: 'none',
    borderRight: '1px solid #6B7294',
    borderBottom: 'none',
    borderLeft: 'none',
    padding: "10px 10px 10px 10px",
  },
  bottomRowMiddle: {
    borderTop: '1px solid #6B7294',
    borderRight: '1px solid #6B7294',
    borderBottom: 'none',
    borderLeft: 'none',
    padding: "10px 10px 10px 10px",
  },
  bottomRowLast: {
    borderTop: '1px solid #6B7294',
    borderRight: 'none',
    borderBottom: 'none',
    borderLeft: 'none',
    textAlign: "center" as const,
    padding: "10px",
    width: "20px",
    minWidth: "0",
  },
  autoComplete: {
    borderTop: '1px solid #6B7294',
    borderRight: '1px solid #6B7294',
    borderBottom: 'none',
    borderLeft: 'none',
    padding: "10px 12px 10px 15px",
    "&.MuiStack-root": {
      width: "auto",
    },
  },
  addRemoveButtonInTable: {
    "&.MuiButtonBase-root": {
      minWidth: "0px !important",
    },
    "&.MuiTouchRipple-root": {
      display: "none",
    },
    "&.MuiStack-root": {
      display: "none",
    },
  },
  removeButtonContainer: {
    margin: "auto",
    width: "23px",
    "&.MuiStack-root": {
      width: "auto"
    }
  },
    asterisk: {
    color: "#D54309",
    marginLeft: "6px",
  },
});

export default withStyles(styles, { withTheme: true })(FormSectionD);
