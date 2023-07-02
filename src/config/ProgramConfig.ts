/**
 * This is a special program option that is used
 * when the user selects "Other" from the program dropdown.
 *
 * NOTE: You probably don't need to modify this.
 *
 * @see ProgramOption
 */
export const OptionalProgram : ProgramOption = {
  name: "Other",
  abbreviation: "Other",
  studies: [],
  isCustom: true,
};

/**
 * This is a special study option that is used
 * when the user selects "Other" from the study dropdown.
 *
 * NOTE: You probably don't need to modify this.
 *
 * @see StudyOption
 */
export const OptionalStudy : StudyOption = {
  name: "Other",
  abbreviation: "Other",
  isCustom: true,
};

/**
 * Configuration for Questionnaire Section B Program List
 *
 * @see ProgramOption
 */
const options: ProgramOption[] = [
  {
    name: "The Cancer Genome Atlas",
    abbreviation: "TCGA",
    studies: [
      { name: "TCGA-BRCA", abbreviation: "TCGA-BRCA" },
      { name: "TCGA-GMB", abbreviation: "TCGA-GMB" },
      { name: "TCGA-OV", abbreviation: "TCGA-OV" },
      { name: "TCGA-LUAD", abbreviation: "TCGA-LUAD" },
      { name: "TCGA-UCEC", abbreviation: "TCGA-UCEC" },
      { name: "TCGA-KIRC", abbreviation: "TCGA-KIRC" },
      { name: "TCGA-HNSC", abbreviation: "TCGA-HNSC" },
      { name: "TCGALGG", abbreviation: "TCGALGG" },
      { name: "TCGA-THCA", abbreviation: "TCGA-THCA" },
      { name: "TCGA-LUSC", abbreviation: "TCGA-LUSC" },
      { name: "TCGA-PRAD", abbreviation: "TCGA-PRAD" },
      { name: "TCGA-SKCM", abbreviation: "TCGA-SKCM" },
      { name: "TCGA-COAD", abbreviation: "TCGA-COAD" },
      { name: "TCGA-STAD", abbreviation: "TCGA-STAD" },
      { name: "TCGA BLCA", abbreviation: "TCGA BLCA" },
      { name: "TCGA-LIHC", abbreviation: "TCGA-LIHC" },
      { name: "TCGA-CESC", abbreviation: "TCGA-CESC" },
      { name: "TCGA-LAML", abbreviation: "TCGA-LAML" },
    ],
  },
  {
    name: "Childhood Cancer Data Initiative",
    abbreviation: "CCDI",
    studies: [
      { name: "PIVOT", abbreviation: "PIVOT" },
      { name: "MCI", abbreviation: "MCI" },
      { name: "P30 Grant Supplement", abbreviation: "P30 Grant Supplement" },
      { name: "GMKF", abbreviation: "GMKF" },
    ],
  },
  {
    name: "Human Tumor Atlas Network",
    abbreviation: "HTAN",
    studies: [
      { name: "The Lung Pre-Cancer Atlas", abbreviation: "The Lung Pre-Cancer Atlas" },
      { name: "Human Tumor Atlas Pilot Project", abbreviation: "Human Tumor Atlas Pilot Project" },
      { name: "Center for Pediatric Tumor Cell Atlas", abbreviation: "Center for Pediatric Tumor Cell Atlas" },
      { name: "Breast Pre-Cancer Atlas", abbreviation: "Breast Pre-Cancer Atlas" },
      { name: "Pre-Cancer Atlases of Cutaneous and Hematologic Origin", abbreviation: "Pre-Cancer Atlases of Cutaneous and Hematologic Origin" },
      { name: "Transition to Metastatic State: Lung Cancer, Pancreatic Cancer and Brain Metastasis", abbreviation: "Transition to Metastatic State: Lung Cancer, Pancreatic Cancer and Brain Metastasis" },
      { name: "Omic and Multidimensional Spatial Atlas fo Metasistic Breast Cancers", abbreviation: "Omic and Multidimensional Spatial Atlas fo Metasistic Breast Cancers" },
      { name: "Multi-Omic Characterization of Transformation of Familial Adenomatous Polyposis", abbreviation: "Multi-Omic Characterization of Transformation of Familial Adenomatous Polyposis" },
      { name: "Comparing image methosds across centers", abbreviation: "Comparing image methosds across centers" },
      { name: "Colon Molecular Atlas Project", abbreviation: "Colon Molecular Atlas Project" },
      { name: "Washington University Human Tumor Atlas Research Center", abbreviation: "Washington University Human Tumor Atlas Research Center" },
    ],
  },
  {
    name: "Clinical Proteomic Tumor Analysis Consortium",
    abbreviation: "CPTAC",
    studies: [
      { name: "CPTAC-2", abbreviation: "CPTAC-2" },
      { name: "CPTAC-3", abbreviation: "CPTAC-3" },
      { name: "CPTAC CCRCC Confirmatory Study", abbreviation: "CPTAC CCRCC Confirmatory Study" },
      { name: "CPTAC CCRCC Confirmatory Study DIA Phosphoproteome", abbreviation: "CPTAC CCRCC Confirmatory Study DIA Phosphoproteome" },
      { name: "CPTACT CCRCC Confirmatory Study DIA Proteome", abbreviation: "CPTACT CCRCC Confirmatory Study DIA Proteome" },
    ],
  },
  // NOTE: This is a special program option that is used
  // ADD NEW PROGRAMS ABOVE THIS LINE
  OptionalProgram,
];

export default options;
