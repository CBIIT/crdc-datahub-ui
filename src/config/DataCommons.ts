import logo from "../assets/header/Logo.jpg";
import { getFilteredDataCommons } from "../utils/envUtils";

/**
 * The URL of the Data Commons Model Repo
 *
 * Model Data:
 * - `[dev_tier]/cache/[model_name]/[model_version]/`
 *
 * Content Manifest:
 * - `[dev_tier]/cache/content.json`
 */
export const MODEL_FILE_REPO = "https://raw.githubusercontent.com/CBIIT/crdc-datahub-models/";

/**
 * A collection of site-wide supported Data Commons.
 */
const DataCommons: DataCommon[] = [
  {
    name: "CDS",
    displayName: "GC",
    assets: null,
    configuration: {
      pageTitle: "GC Data Model",
      pdfConfig: {
        fileType: "pdf",
        prefix: "GC_",
        downloadPrefix: "GC_",
        fileTransferManifestName: "GC_",
        iconSrc: logo,
        footnote: "https://hub.datacommons.cancer.gov/model-navigator/GC",
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
  {
    name: "CCDI",
    displayName: "CCDI",
    assets: null,
    configuration: {
      pageTitle: "CCDI Data Model",
      pdfConfig: {
        fileType: "pdf",
        prefix: "CCDI_",
        downloadPrefix: "CCDI_",
        fileTransferManifestName: "CCDI_",
        iconSrc: logo,
        footnote: "https://hub.datacommons.cancer.gov/model-navigator/CCDI",
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
  {
    name: "CTDC",
    displayName: "CTDC",
    assets: null,
    configuration: {
      pageTitle: "CTDC Data Model",
      pdfConfig: {
        fileType: "pdf",
        prefix: "CTDC_",
        downloadPrefix: "CTDC_",
        fileTransferManifestName: "CTDC_",
        iconSrc: logo,
        footnote: "https://hub.datacommons.cancer.gov/model-navigator/CTDC",
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
  {
    name: "ICDC",
    displayName: "ICDC",
    assets: null,
    configuration: {
      pageTitle: "ICDC Data Model",
      pdfConfig: {
        fileType: "pdf",
        prefix: "ICDC_",
        downloadPrefix: "ICDC_",
        fileTransferManifestName: "ICDC_",
        iconSrc: logo,
        footnote: "https://hub.datacommons.cancer.gov/model-navigator/ICDC",
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
          color: "#94C0EC",
          checkBoxColorsOne: "#E3F4FD",
          checkBoxColorsTwo: "#f0f8ff",
          checkBoxBorderColor: "#0D71A3",
          height: "7px",
          isExpanded: true,
        },
      },
    },
  },
  {
    name: "Test MDF",
    displayName: "Test MDF",
    assets: null,
    configuration: {
      pageTitle: "Test MDF Data Model",
      pdfConfig: {
        fileType: "pdf",
        prefix: "Test MDF_",
        downloadPrefix: "Test MDF_",
        fileTransferManifestName: "Test MDF_",
        iconSrc: logo,
        footnote: "https://hub.datacommons.cancer.gov/model-navigator/Test MDF",
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
  {
    name: "Hidden Model",
    displayName: "Hidden Model",
    assets: null,
    configuration: {
      pageTitle: "Hidden Data Model",
      pdfConfig: {
        fileType: "pdf",
        prefix: "Hidden Model_",
        downloadPrefix: "Hidden Model_",
        fileTransferManifestName: "Hidden Model_",
        iconSrc: logo,
        footnote: "https://hub.datacommons.cancer.gov/model-navigator/Hidden Model",
        landscape: true,
      },
      facetFilterSearchData: [
        {
          groupName: "Category",
          datafield: "category",
          section: "Filter By Nodes",
          tooltip: "category",
          show: true,
          checkboxItems: [{ name: "Administrative", isChecked: false, group: "category" }],
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
      },
    },
  },
];

// TODO: This is a TEMPORARY implementation to hide Data Commons from the UI
// for 3.1.0 only. This will be refactored in 3.2.0
const HiddenModels = getFilteredDataCommons();
const FilteredDataCommons = DataCommons.filter((dc) => !HiddenModels.includes(dc.name));
export { FilteredDataCommons as DataCommons };
