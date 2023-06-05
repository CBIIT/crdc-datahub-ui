import React, { FC, useEffect, useRef, useState } from "react";
import { Button, Grid, Stack } from '@mui/material';
import { withStyles } from "@mui/styles";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { parseForm } from '@jalik/form-parser';
import { Status as FormStatus, useFormContext } from "../../../components/Contexts/FormContext";
import AdditionalContact from "../../../components/Questionnaire/AdditionalContact";
import FormContainer from "../../../components/Questionnaire/FormContainer";
import SectionGroup from "../../../components/Questionnaire/SectionGroup";
import TextInput from "../../../components/Questionnaire/TextInput";
import { filterNonNumeric, validateEmail } from '../utils';

/**
 * Form Section A View
 *
 * @param {FormSectionProps} props
 * @returns {JSX.Element}
 */
const FormSectionA: FC<FormSectionProps> = ({ refs, classes }: FormSectionProps) => {
  const { status, data, setData } = useFormContext();

  const [pi] = useState<PI>(data.pi);
  const [primaryContact] = useState<PrimaryContact>(data.primaryContact);
  const [additionalContacts, setAdditionalContacts] = useState<KeyedAdditionalContact[]>(data.additionalContacts
    .map((contact: AdditionalContact, index: number) => ({
      ...contact,
      key: `${index}_${new Date().getTime()}`,
    })));

  const formRef = useRef<HTMLFormElement>();
  const { saveForm, submitForm } = refs;

  useEffect(() => {
    if (!saveForm.current || !submitForm.current) { return; }

    // Save the form data on click
    saveForm.current.onclick = () => {
      if (!formRef.current) { return; }

      // Show validation errors but save the data anyway
      formRef.current.reportValidity();

      setData({
        ...data,
        ...parseForm(formRef.current, { nullify: false }),
      });
    };

    // Hide the submit button from this section
    submitForm.current.style.display = "none";
  }, [refs]);

  /**
   * Add a empty additional contact to the list
   *
   * @param {void}
   * @returns {void}
   */
  const addContact = () => {
    setAdditionalContacts([
      ...additionalContacts,
      {
        key: `${additionalContacts.length}_${new Date().getTime()}`,
        role: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        institution: "",
      },
    ]);
  };

  /**
   * Remove an additional contact from the list
   *
   * @param {string} key The generated key for the contact
   * @returns {void}
   */
  const removeContact = (key: string) => {
    setAdditionalContacts(additionalContacts.filter((c) => c.key !== key));
  };

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
        <TextInput label="First name" name="pi[firstName]" value={pi.firstName} maxLength={50} required />
        <TextInput label="Last name" name="pi[lastName]" value={pi.lastName} maxLength={50} required />
        <TextInput label="Position" name="pi[position]" value={pi.position} maxLength={100} required />
        <TextInput label="Email address" name="pi[email]" validate={validateEmail} value={pi.email} required />
        <TextInput label="Institution" name="pi[institution]" value={pi.institution} maxLength={100} required />
        <TextInput label="If you have an eRA Commons account, provide it here:" name="pi[eRAAccount]" value={pi.eRAAccount} />
        <TextInput
          label="Institution Address"
          value={pi.address}
          gridWidth={12}
          maxLength={200}
          name="pi[address]"
          rows={4}
          multiline
          required
        />
      </SectionGroup>

      {/* Primary Contact */}
      <SectionGroup
        title={`Enter Primary Contact information for the primary contact
          who will be assisting with data submission`}
      >
        <TextInput label="First name" name="primaryContact[firstName]" value={primaryContact.firstName} maxLength={50} required />
        <TextInput label="Last name" name="primaryContact[lastName]" value={primaryContact.lastName} maxLength={50} required />
        <TextInput label="Institution" name="primaryContact[institution]" value={primaryContact.institution} maxLength={100} required />
        <TextInput label="Position" name="primaryContact[position]" value={primaryContact.position} maxLength={100} placeholder="(exs. Co-PI, sequencing center manager)" />
        <TextInput label="Email address" name="primaryContact[email]" value={primaryContact.email} validate={validateEmail} required />
        <TextInput label="Phone number" name="primaryContact[phone]" value={primaryContact.phone} maxLength={25} filter={filterNonNumeric} />
      </SectionGroup>

      {/* Additional Contacts */}
      <SectionGroup title="Additional contacts (e.g., data coordinator)">
        {additionalContacts.map((contact: KeyedAdditionalContact, idx: number) => (
          <AdditionalContact
            key={contact.key}
            index={idx}
            contact={contact}
            onDelete={() => removeContact(contact.key)}
          />
        ))}
        <Grid item xs={12}>
          <Stack direction="row" justifyContent="end">
            <Button
              variant="outlined"
              type="button"
              onClick={addContact}
              size="large"
              startIcon={<PersonAddIcon />}
              className={classes.contactButton}
              disabled={status === FormStatus.SAVING}
            >
              Add Additional Contact
            </Button>
          </Stack>
        </Grid>
      </SectionGroup>
    </FormContainer>
  );
};

const styles = () => ({
  contactButton: {
    color: "#346798",
    margin: "10px",
    marginRight: "35px",
    marginBottom: "35px",
    padding: "6px 20px",
    minWidth: "115px",
    borderRadius: "24px",
    border: "2px solid #AFC2D8 !important",
    background: "transparent",
    "text-transform": "none",
  }
});

export default withStyles(styles, { withTheme: true })(FormSectionA);
