import { FC, useEffect, useRef } from "react";
import { cloneDeep } from "lodash";
import { parseForm } from "@jalik/form-parser";
import { useFormContext } from "../../../components/Contexts/FormContext";
import FormContainer from "../../../components/Questionnaire/FormContainer";
import SectionGroup from "../../../components/Questionnaire/SectionGroup";
import DatePickerInput from "../../../components/Questionnaire/DatePickerInput";
import TextInput from "../../../components/Questionnaire/TextInput";
import SelectInput from "../../../components/Questionnaire/SelectInput";
import FormGroupCheckbox from "../../../components/Questionnaire/FormGroupCheckbox";
import formSectionC from "../../../config/C";
import { reshapeContentOptions } from "../utils";

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
  const { dataAccess } = formSectionC.static;
  const { cancerTypes } = formSectionC.static;

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
    console.log({ formObject });

    return { ref: formRef, data: combinedData };
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
        description={dataAccess.sectionDescription}
      >
        <FormGroupCheckbox
          label={dataAccess.content.accessTypes.label}
          name={dataAccess.content.accessTypes.name}
          options={dataAccess.content.accessTypes.options}
          value={data.accessTypes}
          gridWidth={12}
        />
        <DatePickerInput
          label={dataAccess.content.targetedSubmissionDate.label}
          name={dataAccess.content.targetedSubmissionDate.name}
          required={dataAccess.content.targetedSubmissionDate.required}
          tooltipText={dataAccess.content.targetedSubmissionDate.tooltipText}
          initialValue={data.targetedSubmissionDate}
          gridWidth={6}
          disablePast
        />
        <DatePickerInput
          label={dataAccess.content.targetedReleaseDate.label}
          name={dataAccess.content.targetedReleaseDate.name}
          required={dataAccess.content.targetedReleaseDate.required}
          tooltipText={dataAccess.content.targetedReleaseDate.tooltipText}
          initialValue={data.targetedReleaseDate}
          gridWidth={6}
          disablePast
        />
        <DatePickerInput
          label={dataAccess.content.targetedSubmissionDate.label}
          name={dataAccess.content.targetedSubmissionDate.name}
          required={dataAccess.content.targetedSubmissionDate.required}
          tooltipText={dataAccess.content.targetedSubmissionDate.tooltipText}
          initialValue={data.targetedSubmissionDate}
          gridWidth={6}
          disablePast
        />
      </SectionGroup>

      <SectionGroup title={cancerTypes.sectionTitle}>
        <SelectInput
          label={cancerTypes.content.cancerTypes.label}
          name={cancerTypes.content.cancerTypes.name}
          options={cancerTypes.content.cancerTypes.options.map((option) => ({ label: option, value: option }))}
          placeholder={cancerTypes.content.cancerTypes.placeholder}
          required={cancerTypes.content.cancerTypes.required}
          value={data.cancerTypes}
          multiple
        />
        <TextInput
          label={cancerTypes.content.otherCancerTypes.label}
          name={cancerTypes.content.otherCancerTypes.name}
          placeholder={cancerTypes.content.otherCancerTypes.placeholder}
          required={cancerTypes.content.otherCancerTypes.required}
          value={data.otherCancerTypes}
          maxLength={1000}
        />
        <TextInput
          label={cancerTypes.content.test.label}
          name={cancerTypes.content.test.name}
          placeholder={cancerTypes.content.test.placeholder}
          required={cancerTypes.content.test.required}
          maxLength={1000}
        />

        <SelectInput
          label={cancerTypes.content.preCancerTypes.label}
          name={cancerTypes.content.preCancerTypes.name}
          options={cancerTypes.content.preCancerTypes.options.map((option) => ({ label: option, value: option }))}
          placeholder={cancerTypes.content.preCancerTypes.placeholder}
          required={cancerTypes.content.preCancerTypes.required}
          value={data.preCancerTypes}
          multiple
        />
        <TextInput
          label={cancerTypes.content.otherPreCancerTypes.label}
          name={cancerTypes.content.otherPreCancerTypes.name}
          placeholder={cancerTypes.content.otherPreCancerTypes.placeholder}
          required={cancerTypes.content.otherPreCancerTypes.required}
          value={data.otherPreCancerTypes}
          maxLength={1000}
        />

        <TextInput
          label={cancerTypes.content.numberOfParticipants.label}
          name={cancerTypes.content.numberOfParticipants.name}
          placeholder={cancerTypes.content.numberOfParticipants.placeholder}
          required={cancerTypes.content.numberOfParticipants.required}
          value={data.numberOfParticipants}
          maxLength={1000}
          validate={(input: string) => parseInt(input, 10) > 0}
          type="number"
        />
        <SelectInput
          label={cancerTypes.content.species.label}
          name={cancerTypes.content.species.name}
          options={cancerTypes.content.species.options.map((option) => ({ label: option, value: option }))}
          placeholder={cancerTypes.content.species.placeholder}
          required={cancerTypes.content.species.required}
          value={data.species}
          multiple
        />
        <FormGroupCheckbox
          label={cancerTypes.content.cellLinesModelSystems.label}
          name={cancerTypes.content.cellLinesModelSystems.name}
          options={cancerTypes.content.cellLinesModelSystems.options}
          required={cancerTypes.content.cellLinesModelSystems.required}
          value={reshapeContentOptions(cancerTypes.content.cellLinesModelSystems.options, data)}
          orientation="horizontal"
          gridWidth={12}
        />
      </SectionGroup>
    </FormContainer>
  );
};

export default FormSectionC;
