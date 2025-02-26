/**
 * This is a loosely defined type for the Data Model Navigator configuration.
 *
 * Only the options that are explicitly used by CRDC Hub are defined here.
 */
type ModelNavigatorConfig = {
  /**
   * The title of the Data Model Navigator page
   *
   * e.g. "CRDC Data Model Navigator"
   */
  pageTitle: string;
  /**
   * Provides a title to the README modal popup
   *
   * @default "Understanding the Data Model"
   */
  readMeTitle?: string;
  pdfConfig?: {
    [key: string]: unknown;
    /**
     * Override ALL download file names with this prefix.
     */
    downloadPrefix?: string;
    /**
     * The default name for a Node file download
     *
     * Falls back to the `downloadPrefix` if not provided.
     */
    fileTransferManifestName?: string;
    /**
     * Override default ICDC URL in PDF footers
     */
    footnote: string;
    /**
     * Whether to render the PDF in landscape mode
     *
     * @note The portrait mode is broken ATM.
     */
    landscape?: boolean;
  };
  facetFilterSearchData: FacetSearchData[];
  facetFilterSectionVariables: {
    [key: string]: unknown;
  };
};

/**
 * This is an object that contains the fully qualified URLs for the Data Model assets.
 *
 * @note This is just an internal concept, it's not used outside of the UI or within dependencies.
 */
type ModelAssetUrls = {
  /**
   * An array of fully-qualified URLs to the Data Model files.
   * Arbitrary length, but must have at least one item.
   */
  model_files: string[];
  /**
   * The URL to the Data Model README file
   * If this is null, the README button will not be displayed
   */
  readme: string;
  /**
   * The URL for the Data Model Loading files zip
   */
  loading_file: string;
  /**
   * The URL for the Data Model Navigator logo
   * If this is empty, Model Navigator will utilize a fallback
   *
   * @see Related to {@link ManifestAssets} "model-navigator-logo"
   * @since 3.1.0
   */
  navigator_icon: string;
  /**
   * the URL to the Data Model Release Notes file
   * If this is null, the Release Notes tab will not be displayed
   */
  changelog?: string;
};

type FacetSearchData = {
  [key: string]: unknown;
  datafield: string;
  checkboxItems: {
    [key: string]: unknown;
    name: string;
  }[];
};
