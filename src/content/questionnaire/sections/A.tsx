import React, { FC, createRef, useEffect, useRef } from "react";
import { withStyles } from "@mui/styles";
import { useFormContext } from "../../../components/Contexts/FormContext";
import AdditionalContact from "../../../components/Questionnaire/AdditionalContact";
import PrimaryContact from "../../../components/Questionnaire/PrimaryContact";
import FormContainer from "../../../components/Questionnaire/FormContainer";
import SectionGroup from "../../../components/Questionnaire/SectionGroup";
import TextInput from "../../../components/Questionnaire/TextInput";

/**
 * Form Section A View
 *
 * @param {FormSectionProps} props
 * @param {object} props.refs The element refs passed from FormView
 * @param {object} props.classes The classes passed from Material UI Theme
 * @returns {JSX.Element}
 */
const FormSectionA: FC<FormSectionProps> = ({ refs, classes }: FormSectionProps) => {
  const [form, setFormData] = useFormContext();
  const { data } = form;

  const { pi, primaryContact, additionalContacts }: Application = data;
  const {
    firstName, lastName, position, email,
    institution, eRAAccount, address,
  }: PI = pi;

  const { saveForm, submitForm } = refs;
  const fields = {
    pi: {
      firstName: useRef<HTMLInputElement>(),
      lastName: useRef<HTMLInputElement>(),
      position: useRef<HTMLInputElement>(),
      email: useRef<HTMLInputElement>(),
      institution: useRef<HTMLInputElement>(),
      eRAAccount: useRef<HTMLInputElement>(),
      address: useRef<HTMLInputElement>(),
    },
    primaryContact: {
      firstName: useRef<HTMLInputElement>(),
      lastName: useRef<HTMLInputElement>(),
      email: useRef<HTMLInputElement>(),
      phone: useRef<HTMLInputElement>(),
    },
    additionalContacts: [],
  };

  useEffect(() => {
    if (!saveForm.current || !submitForm.current) { return; }

    // Save the form data on click
    saveForm.current.onclick = () => {
      const { pi, primaryContact, additionalContacts } = fields;

      setFormData({
        ...data,
        pi: {
          ...pi,
          ...Object.keys(pi).reduce((result, key : string) => {
            result[key] = pi[key].current?.value || "";
            return result;
          }, {})
        },
        primaryContact: {
          ...primaryContact,
          ...Object.keys(primaryContact).reduce((result, key : string) => {
            result[key] = primaryContact[key].current?.value || "";
            return result;
          }, {})
        },
        additionalContacts: additionalContacts.map((contact: AdditionalContact, idx: number) => {
          return {
            ...contact,
            ...Object.keys(additionalContacts[idx]).reduce((result, key : string) => {
              result[key] = additionalContacts[idx][key].current?.value || "";
              return result;
            }, {})
          };
        }),
      })
    };

    // Hide the submit button from this section
    submitForm.current.style.visibility = "hidden";
  }, [refs]);

  return (
    <FormContainer
      title="Section A"
      description="Principal Investigator and Contact Information"
    >
      {/* Principal Investigator */}
      <SectionGroup
        title={`Provide the principal investigator contact information
          for the study or collection`}
        divider={false}
      >
        <TextInput label="First Name" inputRef={fields.pi.firstName} value={firstName} maxLength={50} required />
        <TextInput label="Last Name" inputRef={fields.pi.lastName} value={lastName} maxLength={50} required />
        <TextInput label="Position" inputRef={fields.pi.position} value={position} maxLength={100} required />
        <TextInput label="Email Address" inputRef={fields.pi.email} value={email} required />
        <TextInput label="Institution" inputRef={fields.pi.institution} value={institution} maxLength={100} required />
        <TextInput label="If you have an eRA Commons account, provide here:" inputRef={fields.pi.eRAAccount} value={eRAAccount} />
        <TextInput
          label="Institution Address"
          value={address}
          gridWidth={12}
          maxLength={200}
          inputRef={fields.pi.address}
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
          refs={fields.primaryContact}
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
