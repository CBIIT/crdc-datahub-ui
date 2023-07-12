  /**
   * Configuration for Questionnaire Section D FileType List
   *
   */
  export const fileTypeOptions: string[] = [
    "Raw sequencing data",
    "Derived sequencing data",
    "Clinical data",
    "Protein expression data",
    "Imaging data",
    "Other file type (Specify)",
  ];

  export const fileTypeExtensions = {
  "Raw sequencing data": ["BAM", "FASTQ", "Other Extension"],
    "Derived sequencing data": ["VCF", "MAF", "Other Extension"],
    "Clinical data": ["XML", "JSON", "Other Extension"],
    "Protein expression data": ["TSV", "Other Extension"],
    "Imaging data": ["DICOM", "SVS", "Other Extension"],
    "Other file type (Specify)": ["Other Extension"],
  };
