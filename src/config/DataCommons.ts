import logo from "../assets/modelNavigator/Logo.jpg";
import CDSLogo from "../assets/modelNavigator/CDS_Logo.png";

/**
 * The URL of the Data Commons Model Repo
 *
 * Model Data:
 * - `[dev_tier]/[model_name]/[model_version]/`
 *
 * Content Manifest:
 * - `[dev_tier]/content.json`
 */
export const MODEL_FILE_REPO =
  "https://raw.githubusercontent.com/CBIIT/crdc-datahub-models/";

/**
 * A collection of site-wide supported Data Commons.
 */
export const DataCommons: DataCommon[] = [
  {
    name: "CDS",
    assets: null,
    configuration: {
      pageTitle: "CDS Data Model",
      titleIconSrc: CDSLogo,
      pdfConfig: {
        fileType: "pdf",
        prefix: "CDS_",
        downloadPrefix: "CDS_",
        iconSrc: logo,
        footnote: "https://hub.datacommons.cancer.gov/model-navigator/CDS",
        landscape: true,
      },
      facetFilterSearchData: [
        {
          groupName: "Category",
          datafield: "category",
          section: "Filter By Nodes",
          tooltip: "category",
          show: true,
          checkboxItems: [
            { name: "Administrative", isChecked: false, group: "category" },
            { name: "Analysis", isChecked: false, group: "category" },
            { name: "Biospecimen", isChecked: false, group: "category" },
            { name: "Case", isChecked: false, group: "category" },
            { name: "Clinical", isChecked: false, group: "category" },
            { name: "Clinical_Trial", isChecked: false, group: "category" },
            { name: "Data_File", isChecked: false, group: "category" },
            { name: "Study", isChecked: false, group: "category" },
          ],
        },
        {
          groupName: "Assignment",
          datafield: "assignment",
          section: "Filter By Nodes",
          tooltip: "assignment",
          show: true,
          checkboxItems: [
            { name: "Core", isChecked: false, group: "assignment" },
            { name: "Extended", isChecked: false, group: "assignment" },
          ],
        },
        {
          groupName: "Class",
          datafield: "class",
          section: "Filter By Nodes",
          tooltip: "class",
          show: true,
          checkboxItems: [
            { name: "Primary", isChecked: false, group: "class" },
            { name: "Secondary", isChecked: false, group: "class" },
          ],
        },
        {
          groupName: "Inclusion",
          datafield: "inclusion",
          section: "Filter By Property",
          tooltip: "inclusion",
          show: true,
          checkboxItems: [
            { name: "Optional", isChecked: false, group: "optional" },
            { name: "Preferred", isChecked: false, group: "preferred" },
            { name: "Required", isChecked: false, group: "required" },
          ],
        },
        {
          groupName: "UI Display",
          datafield: "uiDisplay",
          section: "Filter By Property",
          tooltip: "inclusion",
          show: true,
          checkboxItems: [
            { name: "no", isChecked: false, group: "no" },
            { name: "yes", isChecked: false, group: "yes" },
          ],
        },
      ],
      facetFilterSectionVariables: {
        "Filter By Nodes": {
          color: "#0D71A3",
          checkBoxColorsOne: "#E3F4FD",
          checkBoxColorsTwo: "#f0f8ff",
          checkBoxBorderColor: "#0D71A3",
          height: "7px",
          isExpanded: true,
        },
        "Filter By Relationship": {
          color: "#FF9742",
          checkBoxColorsOne: "#FF9742",
          checkBoxColorsTwo: "#FF9742",
          height: "7px",
          isExpanded: true,
        },
        "Filter By Property": {
          color: "#0D71A3",
          checkBoxColorsOne: "#E3F4FD",
          checkBoxColorsTwo: "#f0f8ff",
          checkBoxBorderColor: "#0D71A3",
          height: "7px",
          isExpanded: true,
        },
      },
    },
  },
  // {
  //   name: "ICDC",
  //   assets: null,
  //   configuration: {
  //     pageTitle: "ICDC Data Model",
  //     pdfConfig: {
  //       fileType: 'pdf',
  //       prefix: 'ICDC_',
  //       downloadPrefix: 'ICDC_',
  //       iconSrc: logo,
  //       footnote: "https://hub.datacommons.cancer.gov/model-navigator/ICDC",
  //       landscape: true,
  //     },
  //     facetFilterSearchData: [
  //       {
  //         groupName: 'Category',
  //         datafield: 'category',
  //         section: 'Filter By Nodes',
  //         tooltip: 'category',
  //         show: true,
  //         checkboxItems: [
  //           { name: 'Administrative', isChecked: false, group: 'category' },
  //           { name: 'Analysis', isChecked: false, group: 'category' },
  //           { name: 'Biospecimen', isChecked: false, group: 'category' },
  //           { name: 'Case', isChecked: false, group: 'category' },
  //           { name: 'Clinical', isChecked: false, group: 'category' },
  //           { name: 'Clinical_Trial', isChecked: false, group: 'category' },
  //           { name: 'Data_File', isChecked: false, group: 'category' },
  //           { name: 'Study', isChecked: false, group: 'category' },
  //         ],
  //       },
  //       {
  //         groupName: 'Assignment',
  //         datafield: 'assignment',
  //         section: 'Filter By Nodes',
  //         tooltip: 'assignment',
  //         show: true,
  //         checkboxItems: [
  //           { name: 'Core', isChecked: false, group: 'assignment' },
  //           { name: 'Extended', isChecked: false, group: 'assignment' },
  //         ],
  //       },
  //       {
  //         groupName: 'Class',
  //         datafield: 'class',
  //         section: 'Filter By Nodes',
  //         tooltip: 'class',
  //         show: true,
  //         checkboxItems: [
  //           { name: 'Primary', isChecked: false, group: 'class' },
  //           { name: 'Secondary', isChecked: false, group: 'class' },
  //         ],
  //       },
  //       {
  //         groupName: 'Inclusion',
  //         datafield: 'inclusion',
  //         section: 'Filter By Property',
  //         tooltip: 'inclusion',
  //         show: true,
  //         checkboxItems: [
  //           { name: 'Optional', isChecked: false, group: 'optional' },
  //           { name: 'Preferred', isChecked: false, group: 'preferred' },
  //           { name: 'Required', isChecked: false, group: 'required' },
  //         ],
  //       },
  //       {
  //         groupName: 'UI Display',
  //         datafield: 'uiDisplay',
  //         section: 'Filter By Property',
  //         tooltip: 'inclusion',
  //         show: true,
  //         checkboxItems: [
  //           { name: 'no', isChecked: false, group: 'no' },
  //           { name: 'yes', isChecked: false, group: 'yes' },
  //         ],
  //       },
  //     ],
  //     facetFilterSectionVariables: {
  //       'Filter By Nodes': {
  //         color: '#0D71A3',
  //         checkBoxColorsOne: '#E3F4FD',
  //         checkBoxColorsTwo: '#f0f8ff',
  //         checkBoxBorderColor: '#0D71A3',
  //         height: '7px',
  //         isExpanded: true,
  //       },
  //       'Filter By Relationship': {
  //         color: '#FF9742',
  //         checkBoxColorsOne: '#FF9742',
  //         checkBoxColorsTwo: '#FF9742',
  //         height: '7px',
  //         isExpanded: true,
  //       },
  //       'Filter By Property': {
  //         color: '#94C0EC',
  //         checkBoxColorsOne: '#E3F4FD',
  //         checkBoxColorsTwo: '#f0f8ff',
  //         checkBoxBorderColor: '#0D71A3',
  //         height: '7px',
  //         isExpanded: true,
  //       },
  //     },
  //   },
  // },
];
