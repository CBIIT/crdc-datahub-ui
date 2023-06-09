/**
 * This is a special program option that is used
 * when the user selects "Other" from the program dropdown.
 *
 * NOTE: You probably don't need to modify this.
 *
 * @see ProgramOption
 */
export const OptionalProgram : ProgramOption = {
  title: "Other",
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
  title: "Other",
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
    title: "TCGA",
    abbreviation: "TCGA",
    studies: [
      { title: "TCGA-BRCA", abbreviation: "TCGA-BRCA" },
      { title: "TCGA-GMB", abbreviation: "TCGA-GMB" },
      { title: "TCGA-OV", abbreviation: "TCGA-OV" },
      { title: "TCGA-LUAD", abbreviation: "TCGA-LUAD" },
      { title: "TCGA-UCEC", abbreviation: "TCGA-UCEC" },
      { title: "TCGA-KIRC", abbreviation: "TCGA-KIRC" },
      { title: "TCGA-HNSC", abbreviation: "TCGA-HNSC" },
      { title: "TCGALGG", abbreviation: "TCGALGG" },
      { title: "TCGA-THCA", abbreviation: "TCGA-THCA" },
      { title: "TCGA-LUSC", abbreviation: "TCGA-LUSC" },
      { title: "TCGA-PRAD", abbreviation: "TCGA-PRAD" },
      { title: "TCGA-SKCM", abbreviation: "TCGA-SKCM" },
      { title: "TCGA-COAD", abbreviation: "TCGA-COAD" },
      { title: "TCGA-STAD", abbreviation: "TCGA-STAD" },
      { title: "TCGA BLCA", abbreviation: "TCGA BLCA" },
      { title: "TCGA-LIHC", abbreviation: "TCGA-LIHC" },
      { title: "TCGA-CESC", abbreviation: "TCGA-CESC" },
      { title: "TCGA-LAML", abbreviation: "TCGA-LAML" },
    ],
  },
  {
    title: "CCDI",
    abbreviation: "CCDI",
    studies: [
      { title: "PIVOT", abbreviation: "PIVOT" },
      { title: "MCI", abbreviation: "MCI" },
      { title: "P30 Grant Supplement", abbreviation: "P30 Grant Supplement" },
      { title: "GMKF", abbreviation: "GMKF" },
    ],
  },
  {
    title: "HTAN",
    abbreviation: "HTAN",
    studies: [
      { title: "The Lung Pre-Cancer Atlas", abbreviation: "The Lung Pre-Cancer Atlas" },
      { title: "Human Tumor Atlas Pilot Project", abbreviation: "Human Tumor Atlas Pilot Project" },
      { title: "Center for Pediatric Tumor Cell Atlas", abbreviation: "Center for Pediatric Tumor Cell Atlas" },
      { title: "Breast Pre-Cancer Atlas", abbreviation: "Breast Pre-Cancer Atlas" },
      { title: "Pre-Cancer Atlases of Cutaneous and Hematologic Origin", abbreviation: "Pre-Cancer Atlases of Cutaneous and Hematologic Origin" },
      { title: "Transition to Metastatic State: Lung Cancer, Pancreatic Cancer and Brain Metastasis", abbreviation: "Transition to Metastatic State: Lung Cancer, Pancreatic Cancer and Brain Metastasis" },
      { title: "Omic and Multidimensional Spatial Atlas fo Metasistic Breast Cancers", abbreviation: "Omic and Multidimensional Spatial Atlas fo Metasistic Breast Cancers" },
      { title: "Multi-Omic Characterization of Transformation of Familial Adenomatous Polyposis", abbreviation: "Multi-Omic Characterization of Transformation of Familial Adenomatous Polyposis" },
      { title: "Comparing image methosds across centers", abbreviation: "Comparing image methosds across centers" },
      { title: "Colon Molecular Atlas Project", abbreviation: "Colon Molecular Atlas Project" },
      { title: "Washington University Human Tumor Atlas Research Center", abbreviation: "Washington University Human Tumor Atlas Research Center" },
    ],
  },
  {
    title: "CPTAC",
    abbreviation: "CPTAC",
    studies: [
      { title: "CPTAC-2", abbreviation: "CPTAC-2" },
      { title: "CPTAC-3", abbreviation: "CPTAC-3" },
      { title: "CPTAC CCRCC Confirmatory Study", abbreviation: "CPTAC CCRCC Confirmatory Study" },
      { title: "CPTAC CCRCC Confirmatory Study DIA Phosphoproteome", abbreviation: "CPTAC CCRCC Confirmatory Study DIA Phosphoproteome" },
      { title: "CPTACT CCRCC Confirmatory Study DIA Proteome", abbreviation: "CPTACT CCRCC Confirmatory Study DIA Proteome" },
    ],
  },
  // NOTE: This is a special program option that is used
  // ADD NEW PROGRAMS ABOVE THIS LINE
  OptionalProgram,
];

export default options;
