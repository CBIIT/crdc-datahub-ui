import { FC, useEffect, useRef, useState } from "react";
import { cloneDeep } from "lodash";
import { parseForm } from "@jalik/form-parser";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { styled } from "@mui/material";
import { Status as FormStatus, useFormContext } from "../../../components/Contexts/FormContext";
import FormContainer from "../../../components/Questionnaire/FormContainer";
import SectionGroup from "../../../components/Questionnaire/SectionGroup";
import DatePickerInput from "../../../components/Questionnaire/DatePickerInput";
import TextInput from "../../../components/Questionnaire/TextInput";
import SelectInput from "../../../components/Questionnaire/SelectInput";
import FormGroupCheckbox from "../../../components/Questionnaire/FormGroupCheckbox";
import { mapObjectWithKey, reshapeCheckboxGroupOptions } from "../utils";
import AddRemoveButton from "../../../components/Questionnaire/AddRemoveButton";
import accessTypesOptions from "../../../config/AccessTypesConfig";
import cancerTypeOptions from "../../../config/CancerTypesConfig";
import preCancerTypeOptions from "../../../config/PreCancerTypesConfig";
import speciesOptions from "../../../config/SpeciesConfig";
import cellLineModelSystemOptions from "../../../config/CellLineModelSystemConfig";
import TimeConstraint from "../../../components/Questionnaire/TimeConstraint";
import TransitionGroupWrapper from "../../../components/Questionnaire/TransitionGroupWrapper";
import DatePickerInput from "../../../components/Questionnaire/DatePickerInput";

const AccessTypesDescription = styled("span")(() => ({
  fontWeight: 400
}));

type KeyedTimeConstraint = {
  key: string;
} & TimeConstraint;

/**
 * Form Section C View
 *
 * @param {FormSectionProps} props
 * @returns {JSX.Element}
 */
const FormSectionC: FC<FormSectionProps> = ({ refs }: FormSectionProps) => {
  const { status, data } = useFormContext();
  const formRef = useRef<HTMLFormElement>();
  const { saveFormRef, submitFormRef, getFormObjectRef } = refs;

  const [timeConstraints, setTimeConstraints] = useState<KeyedTimeConstraint[]>(data.timeConstraints?.map(mapObjectWithKey));

  useEffect(() => {
    if (!saveFormRef.current || !submitFormRef.current) {
      return;
    }

    saveFormRef.current.style.display = "initial";
    submitFormRef.current.style.display = "none";

    getFormObjectRef.current = getFormObject;
  }, [refs]);

  const getFormObject = (): FormObject | null => {
    if (!formRef.current) {
      return null;
    }

    const formObject = parseForm(formRef.current, { nullify: false });
    const combinedData = { ...cloneDeep(data), ...formObject };

    return { ref: formRef, data: combinedData };
  };

   /**
   * Add a empty time constraint to the timeConstraints state
   *
   * @returns {void}
   */
   const addTimeConstraint = () => {
    const constraints = !timeConstraints ? [] : timeConstraints;
    setTimeConstraints([
      ...constraints,
      { key: `${constraints.length}_${new Date().getTime()}`, description: "", effectiveDate: "" },
    ]);
  };

   /**
   * Remove a time constraint from the timeConstraints state
   *
   * @param key generated key for the time constraint
   */
   const removeTimeConstraint = (key: string) => {
    setTimeConstraints(timeConstraints.filter((c) => c.key !== key));
  };

  return (
    <FormContainer
      title="Section C"
      description="Program and Study Registration"
      formRef={formRef}
    >
      {/* Program Registration Section */}
      <SectionGroup
        title="Data Access."
        description={(
          <>
            Informed consent is the basis for institutions submitting data to determine the appropriateness of submitting human data to open or controlled-access NIH/NCI data repositories. This refers to how CRDC data repositories distribute scientific data to the public. The controlled-access studies are required to submit an Institutional Certification to NIH. Learn about this at https://sharing.nih.gov/
            <wbr />
            genomic-data-sharing-policy/institutional-certifications
          </>
        )}
      >
        <FormGroupCheckbox
          label={(
            <>
              Access Types
              {' '}
              <AccessTypesDescription>(Select all that apply):</AccessTypesDescription>
            </>
          )}
          name="accessTypes[]"
          options={accessTypesOptions.map((option) => ({ label: option, value: option }))}
          value={data.accessTypes}
          gridWidth={12}
          required
        />
        <DatePickerInput
          label="Targeted Data Submission Delivery Date"
          name="targetedSubmissionDate"
          tooltipText="Expected date that date submission can begin"
          initialValue={data.targetedSubmissionDate}
          gridWidth={6}
          disablePast
          required
        />
        <DatePickerInput
          label="Expected Publication Date"
          name="targetedReleaseDate"
          tooltipText="Expected date that the submission is released to the community"
          initialValue={data.targetedReleaseDate}
          gridWidth={6}
          disablePast
          required
        />
      </SectionGroup>

      <SectionGroup
        title="Time Constraints related to your submission"
        endButton={(
          <AddRemoveButton
            label="Add Time Constraints"
            startIcon={<AddCircleIcon />}
            onClick={addTimeConstraint}
            disabled={status === FormStatus.SAVING}
          />
        )}
      >
        <TransitionGroupWrapper
          items={timeConstraints}
          renderItem={(constraint: KeyedTimeConstraint, idx: number) => (
            <TimeConstraint
              index={idx}
              timeConstraint={constraint}
              onDelete={() => removeTimeConstraint(constraint.key)}
            />
          )}
        />
      </SectionGroup>

      <SectionGroup title={(
        <>
          Type of Cancer(s) and, if applicable, pre-cancer(s) being studied.
          <br />
          Multiple cancer types may be selected. Use additional rows to specify each cancer type.
        </>
      )}
      >
        <SelectInput
          label="Cancer types (choose all that apply)"
          name="cancerTypes[]"
          options={cancerTypeOptions.map((option) => ({ label: option, value: option }))}
          placeholder="Select types"
          value={data.cancerTypes}
          multiple
          required
        />
        <TextInput
          label="Other cancer type not included (specify)"
          name="otherCancerTypes"
          placeholder="Enter types"
          value={data.otherCancerTypes}
          maxLength={1000}
        />

        <SelectInput
          label="Pre-cancer types, of applicable (choose all that apply)"
          name="preCancerTypes[]"
          options={preCancerTypeOptions.map((option) => ({ label: option, value: option }))}
          placeholder="Select types"
          value={data.preCancerTypes}
          multiple
        />
        <TextInput
          label="Other pre-cancer type not included (specify)"
          name="otherPreCancerTypes"
          placeholder="Enter types"
          value={data.otherPreCancerTypes}
          maxLength={1000}
        />

        <TextInput
          label="Number of participants included in the submission"
          name="numberOfParticipants"
          placeholder="##"
          value={data.numberOfParticipants}
          maxLength={1000}
          validate={(input: string) => parseInt(input, 10) > 0}
          type="number"
          required
        />
        <SelectInput
          label="Species of participants (choose all that apply)"
          name="species"
          options={speciesOptions.map((option) => ({ label: option, value: option }))}
          placeholder="Select species"
          value={data.species}
          multiple
          required
        />
        <FormGroupCheckbox
          label="Cell lines, model systems, or both"
          options={cellLineModelSystemOptions}
          value={reshapeCheckboxGroupOptions(cellLineModelSystemOptions, data)}
          orientation="horizontal"
          gridWidth={12}
        />
      </SectionGroup>
    </FormContainer>
  );
};

export default FormSectionC;
