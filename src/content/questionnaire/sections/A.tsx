import React, { FC, useEffect, useRef, useState } from "react";
import { withStyles } from "@mui/styles";
import { parseForm } from '@jalik/form-parser';
import { useFormContext } from "../../../components/Contexts/FormContext";
import AdditionalContact from "../../../components/Questionnaire/AdditionalContact";
import PrimaryContact from "../../../components/Questionnaire/PrimaryContact";
import FormContainer from "../../../components/Questionnaire/FormContainer";
import SectionGroup from "../../../components/Questionnaire/SectionGroup";
import TextInput from "../../../components/Questionnaire/TextInput";
import { validateEmail } from '../utils';

/**
 * Form Section A View
 *
 * NOTE:
 * - This component is not rendered until we have form data
 *   status validation is needed
 *
 * @param {FormSectionProps} props
 * @param {object} props.refs The element refs passed from FormView
 * @param {object} props.classes The classes passed from Material UI Theme
 * @returns {JSX.Element}
 */
const FormSectionA: FC<FormSectionProps> = ({ refs, classes }: FormSectionProps) => {
  const [form, setFormData] = useFormContext();
  const { data } = form;

  const formRef = useRef<HTMLFormElement>();
  const [pi] = useState<PI>(data.pi);
  const [primaryContact] = useState<PrimaryContact>(data.primaryContact);
  const [additionalContacts, setAdditionalContacts] = useState<AdditionalContact[]>(data.additionalContacts);

  const {
    firstName, lastName, position, email,
    institution, eRAAccount, address,
  }: PI = pi;

  const { saveForm, submitForm } = refs;

  useEffect(() => {
    if (!saveForm.current || !submitForm.current) { return; }

    // Save the form data on click
    saveForm.current.onclick = () => {
      if (!formRef.current) { return; }

      // TODO: we need to display validation errors, but save regardless
      formRef.current.reportValidity();

      setFormData({
        ...data,
        ...parseForm(formRef.current),
      })
    };

    // Hide the submit button from this section
    submitForm.current.style.visibility = "hidden";
  }, [refs]);

  return (
    <FormContainer
      title="Section A"
      description="Principal Investigator and Contact Information"
      formRef={formRef}
    >
      {/* Principal Investigator */}
      <SectionGroup
        title={`Provide the principal investigator contact information
          for the study or collection`}
        divider={false}
      >
        <TextInput label="First Name" name={"pi[firstName]"} value={firstName} maxLength={50} required />
        <TextInput label="Last Name" name={"pi[lastName]"} value={lastName} maxLength={50} required />
        <TextInput label="Position" name={"pi[position]"} value={position} maxLength={100} required />
        <TextInput label="Email Address" name={"pi[email]"} validate={validateEmail} value={email} required />
        <TextInput label="Institution" name={"pi[institution]"} value={institution} maxLength={100} required />
        <TextInput label="If you have an eRA Commons account, provide here:" name={"pi[eRAAccount]"} value={eRAAccount} />
        <TextInput
          label="Institution Address"
          value={address}
          gridWidth={12}
          maxLength={200}
          name={"pi[address]"}
          required
        />
      </SectionGroup>

      {/* Primary Contact */}
      <SectionGroup
        title={`Enter the contact information for the Primary Contact who will be
          assisting with data submission`}
      >
        <PrimaryContact
          contact={primaryContact}
          classes={classes}
        />
      </SectionGroup>

      {/* Additional Contacts */}
      <SectionGroup
        title={`If there are additional points of contact (e.g. data coordinator),
          enter the details for each. Each detail is required for each
          additional contact, you may add additional rows for the details for
          each contact.`}
      >
        {additionalContacts.map((contact: AdditionalContact, idx: number) => {
          // Create refs for each additional contact
          const refs = {
            role: createRef<HTMLInputElement>(),
            firstName: createRef<HTMLInputElement>(),
            lastName: createRef<HTMLInputElement>(),
            email: createRef<HTMLInputElement>(),
            phone: createRef<HTMLInputElement>(),
          };
          fields.additionalContacts.push(refs);

          return (
          <AdditionalContact
            key={idx}
            contact={contact}
            classes={classes}
              refs={refs}
          />
          );
        })}
        <button type="button">Add Contact</button>
      </SectionGroup>
    </FormContainer>
  );
};

const styles = (theme: any) => ({});

export default withStyles(styles, { withTheme: true })(FormSectionA);
