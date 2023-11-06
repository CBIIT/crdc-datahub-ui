/**
 * This is a loosely defined type for the Data Model Navigator configuration.
 *
 * Only the options that are explicitly used by CRDC Hub are defined here.
 */
type ModelNavigatorConfig = {
  /**
   * Provides a title to the README modal popup
   *
   * @default "Understanding the Data Model"
   */
  readMeTitle?: string,
  pdfConfig?: {
    [key: string]: unknown;
    /**
     * Override ALL download file names with this prefix.
     */
    downloadPrefix: string;
    /**
     * Override default ICDC URL in PDF footers
     */
    footnote: string;
  },
  facetFilterSearchData: FacetSearchData[],
  facetFilterSectionVariables: {
    [key: string]: unknown;
  },
};

/**
 * This is an object that contains the fully qualified URLs for the Data Model assets.
 */
type ModelAssetUrls = {
  /**
   * The URL to the Data Model file
   */
  model: string;
  /**
   * The URL to the Data Model properties file
   */
  props: string;
  /**
   * The URL to the Data Model README file
   * If this is null, the README button will not be displayed
   */
  readme: string;
  /**
   * The URL for the Data Model Loading files zip
   */
  loading: string;
};

type FacetSearchData = {
  [key: string]: unknown;
  datafield: string;
  checkboxItems: {
    [key: string]: unknown;
    name: string;
  }[];
};
