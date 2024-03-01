/**
 * Custom Species options for Questionnaire Section C Pre-Cancer Types dropdown
 *
 */
export const CUSTOM_SPECIES = {
  OTHER: "Other",
};

/**
 * Configuration for Questionnaire Section C Pre-Cancer Types
 *
 */
const options: string[] = [
  ...Object.values(CUSTOM_SPECIES),
  "Homo sapiens",
  "Mus musculus",
  "Canis lupus familiaris",
  "Rattus norvegicus",
];

export default options;
