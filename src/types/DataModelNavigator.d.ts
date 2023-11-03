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
  model: string;
  props: string;
  readme: string;
};

type FacetSearchData = {
  [key: string]: unknown;
  datafield: string;
  checkboxItems: {
    [key: string]: unknown;
    name: string;
  }[];
};
