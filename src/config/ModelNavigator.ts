const filterResetIcon = {
  src: "https://raw.githubusercontent.com/CBIIT/datacommons-assets/main/bento/images/icons/svgs/Clear-icon.svg",
  alt: "Reset icon",
  size: "12 px",
};

/**
 * Configuration for the facet filter (i.e. the entire DMN)
 */
export const baseConfiguration = {
  // Populated by the useBuildReduxStore hook
  facetSearchData: null,
  facetSectionVariables: null,
  baseFilters: {},
  filterOptions: [],
  filterSections: [],
  // Base configuration that does not change by model
  resetIcon: filterResetIcon,
  showCheckboxCount: 6,
};

/**
 * Base configuration for the graph view
 */
export const graphViewConfig = {
  legend: {},
  canvas: {
    fit: {
      x: 0,
      y: 20,
      zoom: 0.7,
      minZoom: 0.7,
      maxZoom: 2,
    },
  },
};

/**
 * Fall-back title for the Data Model README popup
 */
export const defaultReadMeTitle = "Understanding the Data Model";
