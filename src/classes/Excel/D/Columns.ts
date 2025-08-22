import z from "zod";

import { questionnaireDataSchema } from "@/schemas/Application";

import { ColumnDef } from "../SectionBase";

export const SCHEMA = z
  .object({
    targetedSubmissionDate: questionnaireDataSchema.shape.targetedSubmissionDate,
    targetedReleaseDate: questionnaireDataSchema.shape.targetedReleaseDate,
    dataTypes: questionnaireDataSchema.shape.dataTypes,
    imagingDataDeIdentified: questionnaireDataSchema.shape.imagingDataDeIdentified,
    otherDataTypes: questionnaireDataSchema.shape.otherDataTypes,
    clinicalData: questionnaireDataSchema.shape.clinicalData,
    files: questionnaireDataSchema.shape.files,
    dataDeIdentified: questionnaireDataSchema.shape.dataDeIdentified,
    cellLines: questionnaireDataSchema.shape.cellLines,
    modelSystems: questionnaireDataSchema.shape.modelSystems,
    submitterComment: questionnaireDataSchema.shape.submitterComment,
  })
  .strict();

export type DKeys =
  | "targetedSubmissionDate"
  | "targetedReleaseDate"
  | "dataTypes.clinicalTrial"
  | "dataTypes.genomics"
  | "dataTypes.imaging"
  | "dataTypes.proteomics"
  | "imagingDataDeIdentified"
  | "otherDataTypes"
  | "clinicalData.dataTypes.demographicData"
  | "clinicalData.dataTypes.relapseRecurrenceData"
  | "clinicalData.dataTypes.diagnosisData"
  | "clinicalData.dataTypes.outcomeData"
  | "clinicalData.dataTypes.treatmentData"
  | "clinicalData.dataTypes.biospecimenData"
  | "clinicalData.otherDataTypes"
  | "clinicalData.futureDataTypes"
  | "files.type"
  | "files.extension"
  | "files.count"
  | "files.amount"
  | "dataDeIdentified"
  | "cellLines"
  | "modelSystems"
  | "submitterComment";

const protection = { locked: true };

export const COLUMNS: ColumnDef<DKeys>[] = [
  {
    header: "Targeted Data Submission Delivery Date",
    annotation:
      "The date that transfer of data from the submitter to CRDC Submission Portal is expected to begin.",
    key: "targetedSubmissionDate",
    width: 40,
    protection,
  },
  {
    header: "Expected Publication Date",
    annotation: "The date that submitters expect any paper using this data will be published.",
    key: "targetedReleaseDate",
    width: 30,
    protection,
  },
  {
    header: "Clinical",
    annotation:
      "A research study in which one or more subjects are prospectively assigned to one or more interventions (which may include placebo or other control) to evaluate the effects of those interventions on health-related biomedical outcomes.",
    key: "dataTypes.clinicalTrial",
    width: 15,
    protection,
  },
  {
    header: "Genomics",
    annotation:
      "The branch of molecular biology concerned with the structure, function, evolution, and mapping of genomes.  Includes data from DNA sequencing, RNA sequencing, mutational analysis, and other experiments focused on genomes.",
    key: "dataTypes.genomics",
    width: 15,
    protection,
  },
  {
    header: "Imaging",
    annotation:
      "Medical and experimental images from disciplines such as radiology, pathology, and microscopy.",
    key: "dataTypes.imaging",
    width: 15,
    protection,
  },
  {
    header: "Confirm the imaging data you plan to submit are de-identified",
    key: "imagingDataDeIdentified",
    width: 50,
    protection,
  },
  {
    header: "Proteomics",
    annotation: "Data from the study of the large scale expression and use of proteins.",
    key: "dataTypes.proteomics",
    width: 15,
    protection,
  },
  {
    header: "Other Data Type(s)",
    annotation:
      'Data that do not fit in any of the other categories. Enter additional Data Types, separated by pipes ("|").',
    key: "otherDataTypes",
    width: 50,
    protection,
  },
  {
    header: "Demographic Data",
    annotation:
      "Indicate whether demographics information is available for the study (such as age or gender).",
    key: "clinicalData.dataTypes.demographicData",
    width: 20,
    protection,
  },
  {
    header: "Relapse/Recurrence Data",
    annotation:
      "Relapse/recurrence data refers to information associated with the return of a disease after a period of remission. Indicate whether relapse/recurrence data is available for the study.",
    key: "clinicalData.dataTypes.relapseRecurrenceData",
    width: 20,
    protection,
  },
  {
    header: "Diagnosis Data",
    annotation: "Indicate whether diagnosis information is available for the study.",
    key: "clinicalData.dataTypes.diagnosisData",
    width: 15,
    protection,
  },
  {
    header: "Outcome Data",
    annotation:
      "Outcome data refers to information on a specific result or effect that can be measured. Examples of outcomes include decreased pain, reduced tumor size, and improvement of disease. Indicate whether outcome data is available for the study.",
    key: "clinicalData.dataTypes.outcomeData",
    width: 15,
    protection,
  },
  {
    header: "Treatment Data",
    annotation:
      "Treatment data refers to information on the action or administration of therapeutic agents to produce an effect that is intended to alter the course of a pathological process. Indicate whether treatment data is available for the study.",
    key: "clinicalData.dataTypes.treatmentData",
    width: 15,
    protection,
  },
  {
    header: "Biospecimen Data",
    annotation:
      "Biospecimen data refers to information associated with the biological sample, portion, analyte, or aliquot. Indicate whether biospecimen data is available for the study.",
    key: "clinicalData.dataTypes.biospecimenData",
    width: 15,
    protection,
  },
  {
    header: "Other Clinical Data Types",
    annotation:
      'If there are any additional types of data included with the study not already specified above, describe here. Enter additional Clinical Data Types, separated by pipes ("|").',
    key: "clinicalData.otherDataTypes",
    width: 50,
    protection,
  },
  {
    header: "Additional Data Types with a future submission?",
    annotation:
      "Indicate if there will be additional types of data included with a future submission.",
    key: "clinicalData.futureDataTypes",
    width: 40,
    protection,
  },
  {
    header: "File Type",
    key: "files.type",
    width: 30,
    annotation:
      "If there is more than one entry, you may use additional rows for the details of each entry.",
    protection,
  },
  {
    header: "File Extension",
    key: "files.extension",
    width: 15,
    protection,
  },
  {
    header: "Number of files",
    key: "files.count",
    width: 15,
    protection,
  },
  {
    header: "Estimated data size",
    key: "files.amount",
    width: 20,
    protection,
  },
  {
    header: "Confirm the data you plan to submit are de-identified",
    key: "dataDeIdentified",
    width: 50,
    protection,
  },
  {
    header: "Cell lines",
    annotation: "An established cell culture that can be propagated.",
    key: "cellLines",
    width: 10,
    protection,
  },
  {
    header: "Model systems",
    key: "modelSystems",
    width: 15,
    protection,
  },
  {
    header: "Additional Comments or Information about this submission.",
    annotation: "An experimental system that shows similarity to human tumors.",
    key: "submitterComment",
    width: 80,
    protection,
  },
];
