import React, { FC, useEffect, useRef, useState } from "react";
import { Checkbox, FormControlLabel, Grid, styled } from '@mui/material';
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
import TransitionGroupWrapper from "../../../components/Questionnaire/TransitionGroupWrapper";

type KeyedContact = {
  key: string;
} & Contact;

const StyledFormControlLabel = styled(FormControlLabel)({
  transform: "translateY(-15px)",
  "& .MuiFormControlLabel-label": {
    color: "#083A50",
    fontWeight: "700",
  },
});

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

  const getFormObject = (): FormObject | null => {
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
        <TextInput
          id="section-a-pi-first-name"
          label="First name"
          name="pi[firstName]"
          value={pi.firstName}
          placeholder="Enter first name"
          maxLength={50}
          required
        />
        <TextInput
          id="section-a-pi-last-name"
          label="Last name"
          name="pi[lastName]"
          value={pi.lastName}
          placeholder="Enter last name"
          maxLength={50}
          required
        />
        <TextInput
          id="section-a-pi-position"
          label="Position"
          name="pi[position]"
          value={pi.position}
          placeholder="Enter position"
          maxLength={100}
          required
        />
        <TextInput
          id="section-a-pi-email"
          type="email"
          label="Email address"
          name="pi[email]"
          value={pi.email}
          placeholder="Enter email address"
          required
        />
        <AutocompleteInput
          id="section-a-pi-institution"
          label="Institution"
          name="pi[institution]"
          value={pi?.institution || ""}
          options={institutionConfig}
          placeholder="Select Institution"
          required
          disableClearable
          freeSolo
        />
        <TextInput
          id="section-a-pi-era-commons-account"
          label="If you have an eRA Commons account, provide it here:"
          name="pi[eRAAccount]"
          value={pi.eRAAccount}
        />
        <TextInput
          id="section-a-pi-institution-address"
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
          <StyledFormControlLabel
            label="Same as Principal Investigator"
            control={(
              <Checkbox
                checked={piAsPrimaryContact}
                onChange={() => setPiAsPrimaryContact(!piAsPrimaryContact)}
              />
            )}
          />
          <input
            id="section-a-primary-contact-same-as-pi-checkbox"
            style={{ display: "none" }}
            type="checkbox"
            name="piAsPrimaryContact"
            data-type="boolean"
            value={piAsPrimaryContact?.toString()}
            checked
            readOnly
          />
        </Grid>
        <TextInput
          id="section-a-primary-contact-first-name"
          label="First name"
          name="primaryContact[firstName]"
          value={primaryContact?.firstName || ""}
          placeholder="Enter first name"
          maxLength={50}
          readOnly={piAsPrimaryContact}
          required
        />
        <TextInput
          id="section-a-primary-contact-last-name"
          label="Last name"
          name="primaryContact[lastName]"
          value={primaryContact?.lastName || ""}
          placeholder="Enter last name"
          maxLength={50}
          readOnly={piAsPrimaryContact}
          required
        />
        <TextInput
          id="section-a-primary-contact-position"
          label="Position"
          name="primaryContact[position]"
          value={primaryContact?.position || ""}
          placeholder="Enter position"
          maxLength={100}
          readOnly={piAsPrimaryContact}
          required
        />
        <TextInput
          id="section-a-primary-contact-email"
          type="email"
          label="Email"
          name="primaryContact[email]"
          value={primaryContact?.email || ""}
          placeholder="Enter email address"
          readOnly={piAsPrimaryContact}
          required
        />
        <AutocompleteInput
          id="section-a-primary-contact-institution"
          label="Institution"
          name="primaryContact[institution]"
          value={primaryContact?.institution || ""}
          options={institutionConfig}
          placeholder="Select Institution"
          readOnly={piAsPrimaryContact}
          disableClearable
          required
          freeSolo
        />
        <TextInput
          id="section-a-primary-contact-phone-number"
          type="phone"
          label="Phone number"
          name="primaryContact[phone]"
          value={primaryContact?.phone || ""}
          placeholder="Enter phone number"
          maxLength={25}
          readOnly={piAsPrimaryContact}
        />
      </SectionGroup>

      {/* Additional Contacts */}
      <SectionGroup
        title="Additional Contacts"
        endButton={(
          <AddRemoveButton
            id="section-a-add-additional-contact-button"
            label="Add Contact"
            startIcon={<AddCircleIcon />}
            onClick={addContact}
            disabled={status === FormStatus.SAVING}
          />
        )}
      >
        <TransitionGroupWrapper
          items={additionalContacts}
          renderItem={(contact: KeyedContact, idx: number) => (
            <AdditionalContact
              idPrefix="section-a"
              index={idx}
              contact={contact}
              onDelete={() => removeContact(contact.key)}
            />
          )}
        />
      </SectionGroup>
    </FormContainer>
  );
};

export default FormSectionA;
