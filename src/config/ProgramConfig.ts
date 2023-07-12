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
      { name: "The Cancer Genome Atlas Breast Invasive Carcinoma ", abbreviation: "TCGA-BRCA" },
      { name: "The Cancer Genome Atlas Glioblastoma Multiforme", abbreviation: "TCGA-GMB" },
      { name: "The Cancer Genome Atlas Ovarian Cancer", abbreviation: "TCGA-OV" },
      { name: "The Cancer Genome Atlas Lung Adenocarcinoma", abbreviation: "TCGA-LUAD" },
      { name: "The Cancer Genome Atlas Uterine Corpus Endometrial Carcinoma Collection", abbreviation: "TCGA-UCEC" },
      { name: "The Cancer Genome Atlas Kidney Renal Clear Cell Carcinoma Collection", abbreviation: "TCGA-KIRC" },
      { name: "The Cancer Genome Atlas Head-Neck Squamous Cell Carcinoma Collection", abbreviation: "TCGA-HNSC" },
      { name: "The Cancer Genome Atlas Low Grade Glioma Collection", abbreviation: "TCGA-LGG" },
      { name: "The Cancer Genome Atlas Thyroid Cancer Collection", abbreviation: "TCGA-THCA" },
      { name: "The Cancer Genome Atlas Lung Squamous Cell Carcinoma Collection", abbreviation: "TCGA-LUSC" },
      { name: "The Cancer Genome Atlas Prostate Adenocarcinoma Collection", abbreviation: "TCGA-PRAD" },
      { name: "NA", abbreviation: "TCGA-SKCM" },
      { name: "The Cancer Genome Atlas Colon Adenocarcinoma Collection", abbreviation: "TCGA-COAD" },
      { name: "The Cancer Genome Atlas Stomach Adenocarcinoma Collection", abbreviation: "TCGA-STAD" },
      { name: "The Cancer Genome Atlas Urothelial Bladder Carcinoma Collection", abbreviation: "TCGA BLCA" },
      { name: "The Cancer Genome Atlas Liver Hepatocellular Carcinoma Collection", abbreviation: "TCGA-LIHC" },
      { name: "The Cancer Genome Atlas Cervical Squamous Cell Carcinoma and Endocervical Adenocarcinoma Collection", abbreviation: "TCGA-CESC" },
      { name: "NA", abbreviation: "TCGA-LAML" },
    ],
  },
  {
    name: "Childhood Cancer Data Initiative",
    abbreviation: "CCDI",
    studies: [
      { name: "CCDI PIVOT Project", abbreviation: "PIVOT" },
      { name: "Molecular Characterization Initiative", abbreviation: "MCI" },
      { name: "P30 Grant Supplement", abbreviation: "P30" },
      { name: "Gabriella Miller Kids First", abbreviation: "GMKF" },
    ],
  },
  {
    name: "Human Tumor Atlas Network",
    abbreviation: "HTAN",
    studies: [
      { name: "The Lung Pre-Cancer Atlas", abbreviation: "LPCA" },
      { name: "Human Tumor Atlas Pilot Project", abbreviation: "HTAPP" },
      { name: "Center for Pediatric Tumor Cell Atlas", abbreviation: "CPTCA" },
      { name: "Breast Pre-Cancer Atlas", abbreviation: "BPCA" },
      { name: "Pre-Cancer Atlases of Cutaneous and Hematologic Origin", abbreviation: "PATCH" },
      { name: "Transition to Metastatic State: Lung Cancer, Pancreatic Cancer and Brain Metastasis", abbreviation: "NA" },
      { name: "Omic and Multidimensional Spatial Atlas fo Metasistic Breast Cancers", abbreviation: "OMS-MBC" },
      { name: "Multi-Omic Characterization of Transformation of Familial Adenomatous Polyposis", abbreviation: "NA" },
      { name: "Comparing image methosds across centers", abbreviation: "NA" },
      { name: "Colon Molecular Atlas Porject", abbreviation: "CMAP" },
      { name: "Washington University Human Tumor Atlas Research Center", abbreviation: "NA" },
    ],
  },
  {
    name: "Clinical Proteomic Tumor Analysis Consortium",
    abbreviation: "CPTAC",
    studies: [
      { name: "CPTAC-2", abbreviation: "NA" },
      { name: "CPTAC-3", abbreviation: "NA" },
      { name: "CPTAC CCRCC Confirmatory Study", abbreviation: "NA" },
      { name: "CPTAC CCRCC Confirmatory Study DIA Phosphoproteome", abbreviation: "NA" },
      { name: "CPTACT CCRCC Confirmatory Study DIA Proteome", abbreviation: "NA" },
    ],
  },
  // NOTE: This is a special program option that is used
  // ADD NEW PROGRAMS ABOVE THIS LINE
  OptionalProgram,
];

export default options;
