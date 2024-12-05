import { FC, SyntheticEvent, useEffect, useRef, useState } from "react";
import { cloneDeep } from "lodash";
import { parseForm } from "@jalik/form-parser";
import { AutocompleteChangeReason, styled } from "@mui/material";
import { useFormContext } from "../../../components/Contexts/FormContext";
import FormContainer from "../../../components/Questionnaire/FormContainer";
import SectionGroup from "../../../components/Questionnaire/SectionGroup";
import TextInput from "../../../components/Questionnaire/TextInput";
import SelectInput from "../../../components/Questionnaire/SelectInput";
import FormGroupCheckbox from "../../../components/Questionnaire/FormGroupCheckbox";
import accessTypesOptions from "../../../config/AccessTypesConfig";
import cancerTypeOptions, { CUSTOM_CANCER_TYPES } from "../../../config/CancerTypesConfig";
import speciesOptions from "../../../config/SpeciesConfig";
import { isValidInRange, filterPositiveIntegerString } from "../../../utils";
import useFormMode from "../../../hooks/useFormMode";
import SectionMetadata from "../../../config/SectionMetadata";
import LabelCheckbox from "../../../components/Questionnaire/LabelCheckbox";
import CustomAutocomplete from "../../../components/Questionnaire/CustomAutocomplete";

const AccessTypesDescription = styled("span")(() => ({
  fontWeight: 400,
}));

/**
 * Form Section C View
 *
 * @param {FormSectionProps} props
 * @returns {JSX.Element}
 */
const FormSectionC: FC<FormSectionProps> = ({ SectionOption, refs }: FormSectionProps) => {
  const {
    data: { questionnaireData: data },
  } = useFormContext();
  const { readOnlyInputs } = useFormMode();
  const formContainerRef = useRef<HTMLDivElement>();
  const formRef = useRef<HTMLFormElement>();
  const { getFormObjectRef } = refs;
  const { C: SectionCMetadata } = SectionMetadata;

  const [cancerTypes, setCancerTypes] = useState<string[]>(data.cancerTypes || []);
  const [otherCancerTypes, setOtherCancerTypes] = useState<string>(data.otherCancerTypes);
  const [otherCancerTypesEnabled, setOtherCancerTypesEnabled] = useState<boolean>(
    data.otherCancerTypesEnabled
  );
  const [otherSpecies, setOtherSpecies] = useState<string>(data.otherSpeciesOfSubjects);
  const [otherSpeciesEnabled, setOtherSpeciesEnabled] = useState<boolean>(data.otherSpeciesEnabled);

  const getFormObject = (): FormObject | null => {
    if (!formRef.current) {
      return null;
    }

    const formObject = parseForm(formRef.current, { nullify: false });
    const combinedData = { ...cloneDeep(data), ...formObject };

    combinedData.numberOfParticipants = parseInt(formObject.numberOfParticipants, 10) || null;

    return { ref: formRef, data: combinedData };
  };

  const handleCancerTypesChange = (
    e: SyntheticEvent,
    newValue: string[],
    reason: AutocompleteChangeReason
  ) => {
    // If N/A was previously selected, then remove N/A
    if (cancerTypes.includes(CUSTOM_CANCER_TYPES.NOT_APPLICABLE)) {
      newValue = newValue.filter((option) => option !== CUSTOM_CANCER_TYPES.NOT_APPLICABLE);
      // If N/A is newly selected, then unselect all other options
    } else if (newValue.includes(CUSTOM_CANCER_TYPES.NOT_APPLICABLE)) {
      newValue = [CUSTOM_CANCER_TYPES.NOT_APPLICABLE];
    }

    if (newValue?.includes(CUSTOM_CANCER_TYPES.NOT_APPLICABLE)) {
      setOtherCancerTypes("");
      setOtherCancerTypesEnabled(false);
    }

    setCancerTypes(newValue);
  };

  const handleOtherCancerTypesCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    if (!checked) {
      setOtherCancerTypes("");
    }

    setOtherCancerTypesEnabled(checked);
  };

  const handleOtherSpeciesCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    if (!checked) {
      setOtherSpecies("");
    }

    setOtherSpeciesEnabled(checked);
  };

  useEffect(() => {
    getFormObjectRef.current = getFormObject;
  }, [refs]);

  useEffect(() => {
    formContainerRef.current?.scrollIntoView({ block: "start" });
  }, []);

  return (
    <FormContainer ref={formContainerRef} formRef={formRef} description={SectionOption.title}>
      {/* Data Access Section */}
      <SectionGroup
        title={SectionCMetadata.sections.DATA_ACCESS.title}
        description={SectionCMetadata.sections.DATA_ACCESS.description}
      >
        <FormGroupCheckbox
          idPrefix="section-c-access-types"
          label={
            <>
              Access Types <AccessTypesDescription>(Select all that apply):</AccessTypesDescription>
            </>
          }
          name="accessTypes"
          options={accessTypesOptions}
          value={data.accessTypes}
          gridWidth={12}
          required
          readOnly={readOnlyInputs}
        />
      </SectionGroup>

      {/* Cancer Types Section */}
      <SectionGroup
        title={SectionCMetadata.sections.CANCER_TYPES.title}
        description={SectionCMetadata.sections.CANCER_TYPES.description}
      >
        <CustomAutocomplete
          multiple
          options={cancerTypeOptions}
          disableClearable
          id="section-c-cancer-types"
          label="Cancer types (select all that apply)"
          name="cancerTypes"
          placeholder="Select cancer types"
          value={Array.isArray(cancerTypes) ? cancerTypes : []}
          onChange={handleCancerTypesChange}
          tagText={(value) => `${value.length} Cancer Types selected`}
          readOnly={readOnlyInputs}
          disableCloseOnSelect
        />
        <TextInput
          id="section-c-other-cancer-types"
          key={`other_cancer_types_${cancerTypes?.toString()}`}
          label="Other cancer type(s)"
          tooltipText='Enter additional Cancer Types, separated by pipes ("|").'
          labelStartAddornment={
            <LabelCheckbox
              idPrefix="section-c-other-cancer-types-enabled"
              name="otherCancerTypesEnabled"
              checked={otherCancerTypesEnabled}
              onChange={handleOtherCancerTypesCheckboxChange}
              readOnly={cancerTypes.includes(CUSTOM_CANCER_TYPES.NOT_APPLICABLE) || readOnlyInputs}
            />
          }
          name="otherCancerTypes"
          placeholder="Specify other cancer type(s)"
          value={otherCancerTypes}
          onChange={(e) => setOtherCancerTypes(e.target.value || "")}
          maxLength={1000}
          required={otherCancerTypesEnabled}
          readOnly={!otherCancerTypesEnabled || readOnlyInputs}
        />

        <TextInput
          id="section-c-pre-cancer-types"
          label="Pre-Cancer types (provide all that apply)"
          tooltipText='Enter additional Pre-Cancer Types, separated by pipes ("|").'
          name="preCancerTypes"
          placeholder="Provide pre-cancer types"
          value={data.preCancerTypes}
          maxLength={500}
          readOnly={readOnlyInputs}
        />
      </SectionGroup>

      {/* Subjects/Species Section */}
      <SectionGroup title={SectionCMetadata.sections.SUBJECTS.title}>
        <SelectInput
          id="section-c-species-of-subjects"
          label="Species of subjects (choose all that apply)"
          name="species"
          options={speciesOptions.map((option) => ({
            label: option,
            value: option,
          }))}
          placeholder="Select species"
          value={data.species}
          multiple
          required
          readOnly={readOnlyInputs}
        />
        <TextInput
          id="section-c-other-species-of-subjects"
          label="Other Specie(s) involved"
          tooltipText='Enter additional Species, separated by pipes ("|").'
          labelStartAddornment={
            <LabelCheckbox
              idPrefix="section-c-other-cancer-types-enabled"
              name="otherSpeciesEnabled"
              checked={otherSpeciesEnabled}
              onChange={handleOtherSpeciesCheckboxChange}
              readOnly={readOnlyInputs}
            />
          }
          name="otherSpeciesOfSubjects"
          placeholder="Specify all other species (max of 500 characters)"
          value={otherSpecies}
          onChange={(e) => setOtherSpecies(e.target.value || "")}
          maxLength={500}
          required={otherSpeciesEnabled}
          readOnly={!otherSpeciesEnabled || readOnlyInputs}
        />
        <TextInput
          id="section-c-number-of-subjects-included-in-the-submission"
          label="Number of subjects included in the submission"
          name="numberOfParticipants"
          placeholder="##"
          type="text"
          value={data.numberOfParticipants}
          filter={filterPositiveIntegerString}
          validate={(input: string) => isValidInRange(input, 1)} // greater than 0
          errorText="Value must be greater than 0."
          inputProps={
            {
              "data-type": "number",
            } as unknown
          }
          required
          readOnly={readOnlyInputs}
        />
      </SectionGroup>
    </FormContainer>
  );
};

export default FormSectionC;
