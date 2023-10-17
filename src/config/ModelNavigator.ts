export const DATA_MODEL = "models/icdc-model.yml";
export const DATA_MODEL_PROPS = "models/icdc-model-props.yml";
export const DATA_MODEL_README = "models/icdc-model-readme.md";

const facetFilterSearchData = [
  {
    groupName: 'Category',
    datafield: 'category',
    section: 'Filter By Nodes',
    tooltip: 'category',
    show: true,
    checkboxItems: [
      { name: 'Administrative', isChecked: false, group: 'category' },
      { name: 'Analysis', isChecked: false, group: 'category' },
      { name: 'Biospecimen', isChecked: false, group: 'category' },
      { name: 'Case', isChecked: false, group: 'category' },
      { name: 'Clinical', isChecked: false, group: 'category' },
      { name: 'Clinical_Trial', isChecked: false, group: 'category' },
      { name: 'Data_File', isChecked: false, group: 'category' },
      { name: 'Study', isChecked: false, group: 'category' },
    ],
  },
  {
    groupName: 'Assignment',
    datafield: 'assignment',
    section: 'Filter By Nodes',
    tooltip: 'assignment',
    show: true,
    checkboxItems: [
      { name: 'Core', isChecked: false, group: 'assignment' },
      { name: 'Extended', isChecked: false, group: 'assignment' },
    ],
  },
  {
    groupName: 'Class',
    datafield: 'class',
    section: 'Filter By Nodes',
    tooltip: 'class',
    show: true,
    checkboxItems: [
      { name: 'Primary', isChecked: false, group: 'class' },
      { name: 'Secondary', isChecked: false, group: 'class' },
    ],
  },
  {
    groupName: 'Inclusion',
    datafield: 'inclusion',
    section: 'Filter By Property',
    tooltip: 'inclusion',
    show: true,
    checkboxItems: [
      { name: 'Optional', isChecked: false, group: 'optional' },
      { name: 'Preferred', isChecked: false, group: 'preferred' },
      { name: 'Required', isChecked: false, group: 'required' },
    ],
  },
  {
    groupName: 'UI Display',
    datafield: 'uiDisplay',
    section: 'Filter By Property',
    tooltip: 'inclusion',
    show: true,
    checkboxItems: [
      { name: 'no', isChecked: false, group: 'no' },
      { name: 'yes', isChecked: false, group: 'yes' },
    ],
  },
];

const facetFilterSectionVariables = {
  'Filter By Nodes': {
    color: '#0D71A3',
    checkBoxColorsOne: '#E3F4FD',
    checkBoxColorsTwo: '#f0f8ff',
    checkBoxBorderColor: '#0D71A3',
    height: '7px',
    isExpanded: true,
  },
  'Filter By Relationship': {
    color: '#FF9742',
    checkBoxColorsOne: '#FF9742',
    checkBoxColorsTwo: '#FF9742',
    height: '7px',
    isExpanded: true,
  },
  'Filter By Property': {
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
  assignment: [],
  class: [],
  multiplicity: [],
  inclusion: [],
  uiDisplay: [],
};

const facetFilterSections = [
  'category',
  'assignment',
  'class',
  'inclusion',
  'uiDisplay',
];

const facetFilterOptions = [
  // category
  'administrative',
  'case',
  'study',
  'clinical',
  'clinical_trial',
  'biospecimen',
  'analysis',
  'data_file',
  // Assignment
  'core',
  'extended',
  // Class
  'primary',
  'secondary',
  // Inclusion
  'required',
  'preferred',
  'optional',
  'yes',
  'no',
];

// export const controlVocabConfig = {
//   maxNoOfItems: 10,
//   maxNoOfItemDlgBox: 30,
// };

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
