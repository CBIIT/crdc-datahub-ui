import { ColumnDef } from "../SectionBase";

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

const columns: ColumnDef<DKeys>[] = [
  {
    header: "Targeted Data Submission Delivery Date",
    key: "targetedSubmissionDate",
    width: 30,
    protection,
  },
  {
    header: "Expected Publication Date",
    key: "targetedReleaseDate",
    width: 30,
    protection,
  },
  {
    header: "Clinical",
    key: "dataTypes.clinicalTrial",
    width: 30,
    protection,
  },
  {
    header: "Genomics",
    key: "dataTypes.genomics",
    width: 30,
    protection,
  },
  {
    header: "Imaging",
    key: "dataTypes.imaging",
    width: 30,
    protection,
  },
  {
    header: "Confirm the imaging data you plan to submit are de-identified",
    key: "imagingDataDeIdentified",
    width: 30,
    protection,
  },
  {
    header: "Proteomics",
    key: "dataTypes.proteomics",
    width: 30,
    protection,
  },
  {
    header: "Other Data Type(s)",
    key: "otherDataTypes",
    width: 30,
    protection,
  },
  {
    header: "Demographic Data",
    key: "clinicalData.dataTypes.demographicData",
    width: 30,
    protection,
  },
  {
    header: "Demographic Data",
    key: "clinicalData.dataTypes.relapseRecurrenceData",
    width: 30,
    protection,
  },
  {
    header: "Demographic Data",
    key: "clinicalData.dataTypes.diagnosisData",
    width: 30,
    protection,
  },
  {
    header: "Demographic Data",
    key: "clinicalData.dataTypes.outcomeData",
    width: 30,
    protection,
  },
  {
    header: "Demographic Data",
    key: "clinicalData.dataTypes.treatmentData",
    width: 30,
    protection,
  },
  {
    header: "Demographic Data",
    key: "clinicalData.dataTypes.biospecimenData",
    width: 30,
    protection,
  },
  {
    header: "Other Clinical Data Types",
    key: "clinicalData.otherDataTypes",
    width: 30,
    protection,
  },
  {
    header: "Additional Data Types with a future submission?",
    key: "clinicalData.futureDataTypes",
    width: 30,
    protection,
  },
  {
    header: "File Type",
    key: "files.type",
    width: 30,
    protection,
  },
  {
    header: "File Extension",
    key: "files.extension",
    width: 30,
    protection,
  },
  {
    header: "Number of files",
    key: "files.count",
    width: 30,
    protection,
  },
  {
    header: "Estimated data size",
    key: "files.amount",
    width: 30,
    protection,
  },
  {
    header: "Confirm the data you plan to submit are de-identified",
    key: "dataDeIdentified",
    width: 30,
    protection,
  },
  {
    header: "Cell lines",
    key: "cellLines",
    width: 30,
    protection,
  },
  {
    header: "Model systems",
    key: "modelSystems",
    width: 30,
    protection,
  },
];

export default columns;
