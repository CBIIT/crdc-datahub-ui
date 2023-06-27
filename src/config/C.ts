import cancerTypeOptions from "./CancerTypesConfig";
import preCancerTypeOptions from "./PreCancerTypesConfig";
import speciesOptions from "./SpeciesConfig";

const formSection: FormSectionConfig = {
  title: "Data Access and Disease Information",
  static: {
    dataAccess: {
      sectionTitle: "Data Access.",
      sectionDescription: {
        type: "wbr",
        text: [
          "Informed consent is the basis for institutions submitting data to determine the appropriateness of submitting human data to open or controlled-access NIH/NCI data repositories. This refers to how CRDC data repositories distribute scientific data to the public. The controlled-access studies are required to submit an Institutional Certification to NIH. Learn about this at https://sharing.nih.gov/",
          "genomic-data-sharing-policy/institutional-certifications",
        ],
      },
      content: {
        type: "dataAccess",
        accessTypes: {
          type: "checkboxGroup",
          label: "Access Types (Select all that apply):",
          name: "accessTypes[]",
          required: true,
          options: [
            {
              label: "Open Access",
              value: "Open Access",
              tooltipText: "Data made publicly available to everyone without access restrictions",
            },
            {
              label: "Controlled Access",
              value: "Controlled Access",
              tooltipText: "Data made available for secondary research only after investigators have obtained approval from NIH to use the requested data for a particular project",
            },
            {
              label: "Registered Access",
              value: "Registered Access",
              tooltipText: "Data is open to all, but users need to be signed in or registered with the resource to access",
            },
          ],
        },
        targetedSubmissionDate: {
          type: "text",
          label: "Targeted Data Submission Delivery Date",
          name: "targetedSubmissionDate",
          required: true,
          tooltipText: "Expected date that date submission can begin",
        },
        targetedReleaseDate: {
          type: "text",
          label: "Expected Publication Date",
          name: "targetedReleaseDate",
          required: true,
          tooltipText: "Expected date that the submission is released to the community",
        },
      },
    },
    cancerTypes: {
      sectionTitle: {
        type: "br",
        text: [
          "Type of Cancer(s) and, if applicable, pre-cancer(s) being studied.",
          "Multiple cancer types may be selected. Use additional rows to specify each cancer type.",
        ],
      },
      sectionDescription: null,
      content: {
        type: "cancerTypes",
        cancerTypes: {
          type: "select",
          label: "Cancer types (choose all that apply)",
          name: "cancerTypes[]",
          placeholder: "Select types",
          options: cancerTypeOptions,
          required: true,
        },
        otherCancerTypes: {
          type: "text",
          label: "Other cancer type not included (specify)",
          name: "otherCancerTypes",
          placeholder: "Enter types",
        },
        test: {
          type: "text",
          label: "Other cancer type not included (specify)",
          name: "otherCancerTypes",
          placeholder: "Enter types",
        },
        preCancerTypes: {
          type: "select",
          label: "Pre-cancer types, of applicable (choose all that apply)",
          name: "preCancerTypes[]",
          placeholder: "Select types",
          options: preCancerTypeOptions,
        },
        otherPreCancerTypes: {
          type: "text",
          label: "Other pre-cancer type not included (specify)",
          name: "otherPreCancerTypes",
          placeholder: "Enter types",
        },
        numberOfParticipants: {
          type: "text",
          label: "Number of participants included in the submission",
          name: "numberOfParticipants",
          placeholder: "##",
          required: true,
        },
        species: {
          type: "select",
          label: "Species of participants (choose all that apply)",
          name: "species",
          placeholder: "Select species",
          required: true,
          options: speciesOptions,
        },
        cellLinesModelSystems: {
          type: "checkboxGroup",
          label: "Cell lines, model systems, or both",
          required: true,
          options: [
            {
              label: "Cell lines",
              value: "Cell lines",
              name: "cellLines",
            },
            {
              label: "Model systems",
              value: "Model systems",
              name: "modelSystems",
            },
          ],
        },
      },
    },
  },
};

export default formSection;
