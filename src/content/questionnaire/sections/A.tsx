import React, { FC, useEffect, useRef, useState } from "react";
import { Checkbox, FormControlLabel, Grid } from '@mui/material';
import { parseForm } from '@jalik/form-parser';
import { cloneDeep } from 'lodash';
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { Status as FormStatus, useFormContext } from "../../../components/Contexts/FormContext";
import AdditionalContact from "../../../components/Questionnaire/AdditionalContact";
import FormContainer from "../../../components/Questionnaire/FormContainer";
import SectionGroup from "../../../components/Questionnaire/SectionGroup";
import TextInput from "../../../components/Questionnaire/TextInput";
import AutocompleteInput from '../../../components/Questionnaire/AutocompleteInput';
import institutionConfig from "../../../config/InstitutionConfig";
import AddRemoveButton from '../../../components/Questionnaire/AddRemoveButton';
import { mapObjectWithKey } from '../utils';

type KeyedContact = {
  key: string;
} & Contact;

/**
 * Form Section A View
 *
 * @param {FormSectionProps} props
 * @returns {JSX.Element}
 */
const FormSectionA: FC<FormSectionProps> = ({ SectionOption, refs }: FormSectionProps) => {
  const { status, data } = useFormContext();
  const { pi, primaryContact } = data;

  const [piAsPrimaryContact, setPiAsPrimaryContact] = useState<boolean>(data?.piAsPrimaryContact || false);
  const [additionalContacts, setAdditionalContacts] = useState<KeyedContact[]>(data.additionalContacts?.map(mapObjectWithKey) || []);

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

    if (!formObject.additionalContacts || formObject.additionalContacts.length === 0) {
      combinedData.additionalContacts = [];
    }
    if (formObject.piAsPrimaryContact) {
      combinedData.primaryContact = null;
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
        position: "",
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
      description={SectionOption.title}
      formRef={formRef}
    >
      {/* Principal Investigator */}
      <SectionGroup title="Principal Investigator for study" divider={false}>
        <TextInput label="First name" name="pi[firstName]" value={pi.firstName} maxLength={50} required />
        <TextInput label="Last name" name="pi[lastName]" value={pi.lastName} maxLength={50} required />
        <TextInput label="Position" name="pi[position]" value={pi.position} maxLength={100} required />
        <TextInput
          type="email"
          label="Email address"
          name="pi[email]"
          value={pi.email}
          required
        />
        <AutocompleteInput
          label="Institution"
          name="pi[institution]"
          value={pi?.institution && institutionConfig.includes(pi.institution) ? pi.institution : "Other"}
          options={institutionConfig}
          placeholder="Select Institution"
          required
          disableClearable
        />
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
      <SectionGroup title="Primary Contact assisting with data collection">
        <Grid item md={12}>
          <FormControlLabel
            label="Same as Principal Investigator"
            control={(
              <Checkbox
                checked={piAsPrimaryContact}
                onChange={() => setPiAsPrimaryContact(!piAsPrimaryContact)}
              />
            )}
          />
          <input
            style={{ display: "none" }}
            type="checkbox"
            name="piAsPrimaryContact"
            data-type="boolean"
            value="true"
            checked={piAsPrimaryContact}
            readOnly
          />
        </Grid>
        <TextInput label="First name" name="primaryContact[firstName]" value={primaryContact.firstName} maxLength={50} readOnly={piAsPrimaryContact} required />
        <TextInput label="Last name" name="primaryContact[lastName]" value={primaryContact.lastName} maxLength={50} readOnly={piAsPrimaryContact} required />
        <TextInput label="Position" name="primaryContact[position]" value={primaryContact.position} maxLength={100} readOnly={piAsPrimaryContact} required />
        <TextInput
          type="email"
          label="Email"
          name="primaryContact[email]"
          value={primaryContact.email}
          readOnly={piAsPrimaryContact}
          required
        />
        <AutocompleteInput
          label="Institution"
          name="primaryContact[institution]"
          value={primaryContact?.institution}
          options={institutionConfig}
          placeholder="Select Institution"
          readOnly={piAsPrimaryContact}
          disableClearable
          required
        />
        <TextInput
          type="phone"
          label="Phone number"
          name="primaryContact[phone]"
          value={primaryContact.phone}
          maxLength={25}
          readOnly={piAsPrimaryContact}
        />
      </SectionGroup>

      {/* Additional Contacts */}
      <SectionGroup
        title="Additional Contacts"
        endButton={(
          <AddRemoveButton
            label="Add Contact"
            startIcon={<AddCircleIcon />}
            onClick={addContact}
            disabled={status === FormStatus.SAVING}
          />
        )}
      >
        {additionalContacts.map((contact: KeyedContact, idx: number) => (
          <AdditionalContact
            key={contact.key}
            index={idx}
            contact={contact}
            onDelete={() => removeContact(contact.key)}
          />
        ))}
      </SectionGroup>
    </FormContainer>
  );
};

export default FormSectionA;
