export const DATA_MODEL = "https://raw.githubusercontent.com/CBIIT/cds-model/main/model-desc/cds-model.yml";
export const DATA_MODEL_PROPS = "https://raw.githubusercontent.com/CBIIT/cds-model/main/model-desc/cds-model-props.yml";
export const DATA_MODEL_README = "https://raw.githubusercontent.com/CBIIT/cds-model/main/README.md";

// TODO: Need facet filter categories
const facetFilterSearchData = [
  {
    groupName: 'Category',
    datafield: 'category',
    section: 'A',
    tooltip: 'category',
    show: true,
    checkboxItems: [
      { name: 'Administrative', isChecked: false, group: 'category' },
    ],
  },
  {
    groupName: 'UI Display',
    datafield: 'uiDisplay',
    section: 'B',
    tooltip: 'inclusion',
    show: true,
    checkboxItems: [
      { name: 'no', isChecked: false, group: 'no' },
      { name: 'yes', isChecked: false, group: 'yes' },
    ],
  },
];

const facetFilterSectionVariables = {
  A: {
    color: '#0D71A3',
    checkBoxColorsOne: '#E3F4FD',
    checkBoxColorsTwo: '#f0f8ff',
    checkBoxBorderColor: '#0D71A3',
    height: '7px',
    isExpanded: true,
  },
  B: {
    color: '#94C0EC',
    checkBoxColorsOne: '#E3F4FD',
    checkBoxColorsTwo: '#f0f8ff',
    checkBoxBorderColor: '#0D71A3',
    height: '7px',
    isExpanded: true,
  },
};

const filterResetIcon = {
  src: 'https://raw.githubusercontent.com/CBIIT/datacommons-assets/main/bento/images/icons/svgs/Clear-icon.svg',
  alt: 'Reset icon',
  size: '12 px',
};

const baseFacetFilters = {
  category: [],
  uiDisplay: [],
};

const facetFilterSections = [
  'category',
  'assignment',
  'class',
  'inclusion',
  'uiDisplay',
];

/**
 * An array of possible `Tags:` values in model definition
 */
const facetFilterOptions = [
  // TODO: list of categories
  'administrative',
  // TODO: list of assignments
  'core',
  // TODO: Class
  'primary',
  // TODO: Inclusion
  'required',
];

const showNoOfCheckbox = 6;

export const pdfDownloadConfig = {
  fileType: 'pdf',
  prefix: 'Data_Model_',
  landscape: 'true',
  catagoryIcon: {
    url: 'https://raw.githubusercontent.com/CBIIT/datacommons-assets/main/icdc/DMN/Pdf/',
    type: '.png',
  },
};

/**
 * Configuration for the "README" button
 */
export const readMeConfig = {
  readMeUrl: DATA_MODEL_README,
  readMeTitle: 'Understanding the Data Model',
};

/**
 * Configuration for the facet filter (i.e. the entire DMN)
 */
export const filterConfig = {
  facetSearchData: facetFilterSearchData,
  facetSectionVariables: facetFilterSectionVariables,
  resetIcon: filterResetIcon,
  baseFilters: baseFacetFilters,
  filterSections: facetFilterSections,
  filterOptions: facetFilterOptions,
  showCheckboxCount: showNoOfCheckbox,
};

/**
 * Configuration for the DMN graph view component
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
