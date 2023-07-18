import { FC, useEffect, useRef, useState } from "react";
import { cloneDeep } from "lodash";
import { parseForm } from "@jalik/form-parser";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { styled } from "@mui/material";
import dayjs from "dayjs";
import { Status as FormStatus, useFormContext } from "../../../components/Contexts/FormContext";
import FormContainer from "../../../components/Questionnaire/FormContainer";
import SectionGroup from "../../../components/Questionnaire/SectionGroup";
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
import SwitchInput from "../../../components/Questionnaire/SwitchInput";
import { isValidInRange } from "../../../utils";

const AccessTypesDescription = styled("span")(() => ({
  fontWeight: 400
}));

export type KeyedTimeConstraint = {
  key: string;
} & TimeConstraint;

/**
 * Form Section C View
 *
 * @param {FormSectionProps} props
 * @returns {JSX.Element}
 */
const FormSectionC: FC<FormSectionProps> = ({ SectionOption, refs }: FormSectionProps) => {
  const { status, data } = useFormContext();
  const formRef = useRef<HTMLFormElement>();
  const { nextButtonRef, saveFormRef, submitFormRef, getFormObjectRef } = refs;

  const [timeConstraints, setTimeConstraints] = useState<KeyedTimeConstraint[]>(data.timeConstraints?.map(mapObjectWithKey));
  const [cellLineModelSystemCheckboxes, setCellLineModelSystemCheckboxes] = useState<string[]>(reshapeCheckboxGroupOptions(cellLineModelSystemOptions, data));

  useEffect(() => {
    if (!saveFormRef.current || !submitFormRef.current) {
      return;
    }

    nextButtonRef.current.style.display = "flex";
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
      { key: `${constraints.length}_${new Date().getTime()}`, description: "", effectiveDate: dayjs().format("MM/DD/YYYY") },
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
      description={SectionOption.title}
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
          idPrefix="section-c-access-types"
          label={(
            <>
              Access Types
              {' '}
              <AccessTypesDescription>(Select all that apply):</AccessTypesDescription>
            </>
          )}
          name="accessTypes"
          options={accessTypesOptions.map((option) => ({ label: option, value: option }))}
          value={data.accessTypes}
          gridWidth={12}
          required
        />
        <DatePickerInput
          inputID="section-c-targeted-data-submission-delivery-date"
          label="Targeted Data Submission Delivery Date"
          name="targetedSubmissionDate"
          tooltipText="Expected date that date submission can begin"
          initialValue={data.targetedSubmissionDate}
          gridWidth={6}
          disablePast
          required
        />
        <DatePickerInput
          inputID="section-c-expected-publication-date"
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
            id="section-c-add-time-constraints-button"
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
              idPrefix="section-c-"
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
          id="section-c-cancer-types"
          label="Cancer types (choose all that apply)"
          name="cancerTypes"
          options={cancerTypeOptions.map((option) => ({ label: option, value: option }))}
          placeholder="Select types"
          value={data.cancerTypes}
          multiple
          required
        />
        <TextInput
          id="section-c-other-cancer-types"
          label="Other cancer type not included (specify)"
          name="otherCancerTypes"
          placeholder="Enter types"
          value={data.otherCancerTypes}
          maxLength={1000}
        />

        <SelectInput
          id="section-c-pre-cancer-types"
          label="Pre-cancer types, of applicable (choose all that apply)"
          name="preCancerTypes"
          options={preCancerTypeOptions.map((option) => ({ label: option, value: option }))}
          placeholder="Select types"
          value={data.preCancerTypes}
          multiple
        />
        <TextInput
          id="section-c-other-pre-cancer-types"
          label="Other pre-cancer type not included (specify)"
          name="otherPreCancerTypes"
          placeholder="Enter types"
          value={data.otherPreCancerTypes}
          maxLength={1000}
        />

        <TextInput
          id="section-c-number-of-participants-included-in-the-submission"
          label="Number of participants included in the submission"
          name="numberOfParticipants"
          placeholder="##"
          type="number"
          value={data.numberOfParticipants}
          validate={(input: string) => isValidInRange(input, 1)} // greater than 0
          errorText="Value must be greater than 0. Please enter a valid number greater than 0."
          inputProps={{
            step: 1,
            min: 1,
          }}
          required
        />
        <SelectInput
          id="section-c-species-of-participants"
          label="Species of participants (choose all that apply)"
          name="species"
          options={speciesOptions.map((option) => ({ label: option, value: option }))}
          placeholder="Select species"
          value={data.species}
          multiple
          required
        />
        <FormGroupCheckbox
          idPrefix="section-c-"
          label="Cell lines, model systems, or neither"
          options={cellLineModelSystemOptions}
          value={cellLineModelSystemCheckboxes}
          onChange={(val: string[]) => setCellLineModelSystemCheckboxes(val)}
          orientation="horizontal"
          gridWidth={12}
          allowMultipleChecked={false}
        />
        <SwitchInput
          id="section-c-data-de-identified"
          label="Confirm the data you plan to submit are de-identified"
          name="dataDeIdentified"
          value={data.dataDeIdentified}
          gridWidth={6}
          isBoolean
          touchRequired
          required
        />
      </SectionGroup>
    </FormContainer>
  );
};

export default FormSectionC;
