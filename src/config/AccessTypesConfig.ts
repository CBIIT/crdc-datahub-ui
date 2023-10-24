/**
 * Configuration for Questionnaire Section C Access Types
 *
 */
const options: FormGroupCheckboxOption[] = [
  {
    label: "Open Access",
    value: "Open Access",
    tooltipText: "Data made publicly available to everyone without access restrictions"
  },
  {
    label: "Controlled Access",
    value: "Controlled Access",
    tooltipText: "Data made available for secondary research only after investigators have obtained approval from NIH to use the requested data for a particular project"
  },
];

export default options;
