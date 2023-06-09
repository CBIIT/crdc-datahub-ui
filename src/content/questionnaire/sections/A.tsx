import React, { FC, useEffect, useRef, useState } from "react";
import { Button, Grid, Stack } from '@mui/material';
import { withStyles } from "@mui/styles";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { parseForm } from '@jalik/form-parser';
import { cloneDeep, isEqual } from 'lodash';
import { Status as FormStatus, useFormContext } from "../../../components/Contexts/FormContext";
import AdditionalContact from "../../../components/Questionnaire/AdditionalContact";
import FormContainer from "../../../components/Questionnaire/FormContainer";
import SectionGroup from "../../../components/Questionnaire/SectionGroup";
import TextInput from "../../../components/Questionnaire/TextInput";
import { filterNonNumeric, mapObjectWithKey, validateEmail } from '../utils';

type KeyedContact = {
  key: string;
} & AdditionalContact;

/**
 * Form Section A View
 *
 * @param {FormSectionProps} props
 * @returns {JSX.Element}
 */
const FormSectionA: FC<FormSectionProps> = ({ refs, classes }: FormSectionProps) => {
  const { status, data } = useFormContext();

  const [pi] = useState<PI>(data.pi);
  const [primaryContact] = useState<PrimaryContact>(data.primaryContact);
  const [additionalContacts, setAdditionalContacts] = useState<KeyedContact[]>(data.additionalContacts.map(mapObjectWithKey));

  const formRef = useRef<HTMLFormElement>();
  const {
    saveFormRef, submitFormRef, getFormObjectRef,
  } = refs;

  useEffect(() => {
    if (!saveFormRef.current || !submitFormRef.current) { return; }

    saveFormRef.current.style.display = "initial";
    submitFormRef.current.style.display = "none";

    getFormObjectRef.current = getFormObject;
  }, [refs]);

  const getFormObject = () : FormObject | null => {
    if (!formRef.current) { return null; }

    const formObject = parseForm(formRef.current, { nullify: false });
    const combinedData = { ...cloneDeep(data), ...formObject };

    // Reset additional contacts if none are provided
    if (!formObject.additionalContacts || formObject.additionalContacts.length === 0) {
      combinedData.additionalContacts = [];
    }

    return { ref: formRef, data: combinedData };
  };

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
          placeholder="200 characters allowed"
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
      <SectionGroup>
        {additionalContacts.map((contact: KeyedContact, idx: number) => (
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
    margin: "25px",
    padding: "6px 20px",
    minWidth: "115px",
    borderRadius: "25px",
    border: "2px solid #AFC2D8 !important",
    background: "transparent",
    "text-transform": "none",
    "& .MuiButton-startIcon": {
      marginRight: "14px",
    },
  },
});

export default withStyles(styles, { withTheme: true })(FormSectionA);
