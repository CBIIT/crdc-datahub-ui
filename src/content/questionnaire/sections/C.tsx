import { FC, useEffect, useRef, useState } from "react";
import { cloneDeep } from "lodash";
import { parseForm } from "@jalik/form-parser";
import { styled } from "@mui/material";
import { useFormContext } from "../../../components/Contexts/FormContext";
import FormContainer from "../../../components/Questionnaire/FormContainer";
import SectionGroup from "../../../components/Questionnaire/SectionGroup";
import TextInput from "../../../components/Questionnaire/TextInput";
import SelectInput from "../../../components/Questionnaire/SelectInput";
import FormGroupCheckbox from "../../../components/Questionnaire/FormGroupCheckbox";
import accessTypesOptions from "../../../config/AccessTypesConfig";
import cancerTypeOptions, { CUSTOM_CANCER_TYPES } from "../../../config/CancerTypesConfig";
import speciesOptions, { CUSTOM_SPECIES } from "../../../config/SpeciesConfig";
import { isValidInRange, filterPositiveIntegerString } from "../../../utils";
import useFormMode from "../../../hooks/useFormMode";
import SectionMetadata from "../../../config/SectionMetadata";

const AccessTypesDescription = styled("span")(() => ({
  fontWeight: 400
}));

/**
 * Form Section C View
 *
 * @param {FormSectionProps} props
 * @returns {JSX.Element}
 */
const FormSectionC: FC<FormSectionProps> = ({ SectionOption, refs }: FormSectionProps) => {
  const { data: { questionnaireData: data } } = useFormContext();
  const { readOnlyInputs } = useFormMode();
  const formContainerRef = useRef<HTMLDivElement>();
  const formRef = useRef<HTMLFormElement>();
  const { nextButtonRef, saveFormRef, submitFormRef, approveFormRef, inquireFormRef, rejectFormRef, getFormObjectRef } = refs;
  const { C: SectionCMetadata } = SectionMetadata;

  const [cancerTypes, setCancerTypes] = useState<string[]>(data.cancerTypes ?? []);
  const [species, setSpecies] = useState<string[]>(data.species ?? []);

  useEffect(() => {
    if (!saveFormRef.current || !submitFormRef.current) {
      return;
    }

    nextButtonRef.current.style.display = "flex";
    saveFormRef.current.style.display = "flex";
    submitFormRef.current.style.display = "none";
    approveFormRef.current.style.display = "none";
    inquireFormRef.current.style.display = "none";
    rejectFormRef.current.style.display = "none";
    getFormObjectRef.current = getFormObject;
  }, [refs]);

  const getFormObject = (): FormObject | null => {
    if (!formRef.current) {
      return null;
    }

    const formObject = parseForm(formRef.current, { nullify: false });
    const combinedData = { ...cloneDeep(data), ...formObject };

    combinedData.numberOfParticipants = parseInt(formObject.numberOfParticipants, 10) || null;

    return { ref: formRef, data: combinedData };
  };

  const filterCancerTypes = (val: string[]) => {
    // if N/A already previously selected, then unselect N/A
    if (cancerTypes.includes(CUSTOM_CANCER_TYPES.NOT_APPLICABLE)) {
      return val.filter((option) => option !== CUSTOM_CANCER_TYPES.NOT_APPLICABLE);
    }

    // if N/A is being selected, then unselect other options
    if (val.includes(CUSTOM_CANCER_TYPES.NOT_APPLICABLE)) {
      return [CUSTOM_CANCER_TYPES.NOT_APPLICABLE];
    }

    return val;
  };

  useEffect(() => {
    formContainerRef.current?.scrollIntoView({ block: "start" });
  }, []);

  return (
    <FormContainer
      ref={formContainerRef}
      formRef={formRef}
      description={SectionOption.title}
    >
      {/* Data Access Section */}
      <SectionGroup
        title={SectionCMetadata.sections.DATA_ACCESS.title}
        description={SectionCMetadata.sections.DATA_ACCESS.description}
      >
        <FormGroupCheckbox
          idPrefix="section-c-access-types"
          label={(
            <>
              Access Types
              {' '}
              <AccessTypesDescription>(Select all that apply):</AccessTypesDescription>
            </>
          )}
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
        <SelectInput
          id="section-c-cancer-types"
          label="Cancer types (select all that apply)"
          name="cancerTypes"
          options={cancerTypeOptions.map((option) => ({ label: option, value: option }))}
          placeholder="Select types"
          value={data.cancerTypes}
          onChange={(val: string[]) => setCancerTypes(val)}
          filter={filterCancerTypes}
          multiple
          readOnly={readOnlyInputs}
        />
        <TextInput
          id="section-c-other-cancer-types"
          label="Other cancer type(s)"
          name="otherCancerTypes"
          placeholder="Specify other cancer type(s)"
          value={data.otherCancerTypes}
          maxLength={1000}
          required={cancerTypes?.includes(CUSTOM_CANCER_TYPES.OTHER)}
          readOnly={!cancerTypes?.includes(CUSTOM_CANCER_TYPES.OTHER) || readOnlyInputs}
        />

        <TextInput
          id="section-c-pre-cancer-types"
          label="Pre-Cancer types (provide all that apply)"
          name="preCancerTypes"
          placeholder="Provide pre-cancer types"
          value={data.preCancerTypes}
          maxLength={500}
          readOnly={readOnlyInputs}
        />
      </SectionGroup>

      {/* Subjects/Species Section */}
      <SectionGroup
        title={SectionCMetadata.sections.SUBJECTS.title}
      >
        <SelectInput
          id="section-c-species-of-subjects"
          label="Species of subjects (choose all that apply)"
          name="species"
          options={speciesOptions.map((option) => ({ label: option, value: option }))}
          placeholder="Select species"
          value={species}
          onChange={(val: string[]) => setSpecies(val)}
          multiple
          required
          readOnly={readOnlyInputs}
        />
        <TextInput
          id="section-c-other-species-of-subjects"
          label="Enter in all species involved"
          name="otherSpeciesOfSubjects"
          placeholder="Enter all species"
          value={data.otherSpeciesOfSubjects}
          maxLength={500}
          required={species?.includes(CUSTOM_SPECIES.OTHER)}
          readOnly={!species?.includes(CUSTOM_SPECIES.OTHER) || readOnlyInputs}
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
          inputProps={{
            "data-type": "number"
          } as unknown}
          required
          readOnly={readOnlyInputs}
        />
      </SectionGroup>
    </FormContainer>
  );
};

export default FormSectionC;
