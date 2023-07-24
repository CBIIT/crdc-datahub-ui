/**
 * Configuration for Questionnaire Section D Data Types
 *
 */
const DataTypes = {
  clinicalTrial: "clinicalTrial",
  immunology: "immunology",
  genomics: "genomics",
  proteomics: "proteomics",
  imaging: "imaging",
  epidemiologicOrCohort: "epidemiologicOrCohort",
  demographicData: "demographicData",
  relapseRecurrenceData: "relapseRecurrenceData",
  diagnosisData: "diagnosisData",
  outcomeData: "outcomeData",
  treatmentData: "treatmentData",
  biospecimenData: "biospecimenData",
} as const;

export default DataTypes;
