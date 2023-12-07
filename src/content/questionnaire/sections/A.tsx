import React, { FC, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
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
import AddRemoveButton from '../../../components/Questionnaire/AddRemoveButton';
import { filterForNumbers, mapObjectWithKey, validateEmail } from '../../../utils';
import TransitionGroupWrapper from "../../../components/Questionnaire/TransitionGroupWrapper";
import institutionConfig from "../../../config/InstitutionConfig";
import { InitialQuestionnaire } from '../../../config/InitialValues';
import SectionMetadata from "../../../config/SectionMetadata";
import useFormMode from "./hooks/useFormMode";

export type KeyedContact = {
  key: string;
} & Contact;

const StyledFormControlLabel = styled(FormControlLabel)({
  transform: "translateY(-15px)",
  "& .MuiFormControlLabel-label": {
    color: "#083A50",
    fontWeight: "700",
  },
  "& .MuiCheckbox-root": {
    color: "#005EA2 !important",
  },
});

/**
 * Form Section A View
 *
 * @param {FormSectionProps} props
 * @returns {JSX.Element}
 */
const FormSectionA: FC<FormSectionProps> = ({ SectionOption, refs }: FormSectionProps) => {
  const { status, data: { questionnaireData: data } } = useFormContext();
  const location = useLocation();
  const { pi } = data;
  const { readOnlyInputs } = useFormMode();
  const { A: SectionAMetadata } = SectionMetadata;

  const [primaryContact, setPrimaryContact] = useState<Contact>(data?.primaryContact);
  const [piAsPrimaryContact, setPiAsPrimaryContact] = useState<boolean>(data?.piAsPrimaryContact || false);
  const [additionalContacts, setAdditionalContacts] = useState<KeyedContact[]>(data.additionalContacts?.map(mapObjectWithKey) || []);

  const formContainerRef = useRef<HTMLDivElement>();
  const formRef = useRef<HTMLFormElement>();
  const {
    nextButtonRef, saveFormRef, submitFormRef,
    approveFormRef, inquireFormRef, rejectFormRef, getFormObjectRef,
  } = refs;

  useEffect(() => {
    if (!saveFormRef.current || !submitFormRef.current) { return; }

    nextButtonRef.current.style.display = "flex";
    saveFormRef.current.style.display = "initial";
    submitFormRef.current.style.display = "none";
    approveFormRef.current.style.display = "none";
    inquireFormRef.current.style.display = "none";
    rejectFormRef.current.style.display = "none";
    getFormObjectRef.current = getFormObject;
  }, [refs]);

  const togglePrimaryPI = () => {
    setPiAsPrimaryContact(!piAsPrimaryContact);
    setPrimaryContact(cloneDeep(InitialQuestionnaire.primaryContact));
  };

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

  useEffect(() => {
    if (location?.state?.from === "/submissions") {
      return;
    }
    formContainerRef.current?.scrollIntoView({ block: "start" });
  }, [location]);

  return (
    <FormContainer
      ref={formContainerRef}
      formRef={formRef}
      description={SectionOption.title}
    >
      {/* Principal Investigator */}
      <SectionGroup
        title={SectionAMetadata.sections.PRINCIPAL_INVESTIGATOR.title}
        description={SectionAMetadata.sections.PRINCIPAL_INVESTIGATOR.description}
      >
        <TextInput
          id="section-a-pi-first-name"
          label="First name"
          name="pi[firstName]"
          value={pi?.firstName}
          placeholder="Enter first name"
          maxLength={50}
          required
          readOnly={readOnlyInputs}
        />
        <TextInput
          id="section-a-pi-last-name"
          label="Last name"
          name="pi[lastName]"
          value={pi?.lastName}
          placeholder="Enter last name"
          maxLength={50}
          required
          readOnly={readOnlyInputs}
        />
        <TextInput
          id="section-a-pi-position"
          label="Position"
          name="pi[position]"
          value={pi?.position}
          placeholder="Enter position"
          maxLength={100}
          required
          readOnly={readOnlyInputs}
        />
        <TextInput
          id="section-a-pi-email"
          type="email"
          label="Email"
          name="pi[email]"
          value={pi?.email}
          placeholder="Enter email"
          validate={validateEmail}
          errorText="Please provide a valid email address"
          required
          readOnly={readOnlyInputs}
        />
        <AutocompleteInput
          id="section-a-pi-institution"
          label="Institution"
          name="pi[institution]"
          value={pi?.institution || ""}
          options={institutionConfig}
          placeholder="Enter or Select an Institution"
          validate={(v: string) => v?.trim()?.length > 0}
          required
          disableClearable
          freeSolo
          readOnly={readOnlyInputs}
        />
        <TextInput
          id="section-a-pi-institution-address"
          label="Institution Address"
          value={pi?.address}
          gridWidth={12}
          maxLength={200}
          name="pi[address]"
          placeholder="200 characters allowed"
          rows={4}
          multiline
          required
          readOnly={readOnlyInputs}
        />
      </SectionGroup>

      {/* Primary Contact */}
      <SectionGroup
        title={SectionAMetadata.sections.PRIMARY_CONTACT.title}
        description={SectionAMetadata.sections.PRIMARY_CONTACT.description}
      >
        <Grid item md={12}>
          <StyledFormControlLabel
            label="Same as Principal Investigator"
            control={(
              <Checkbox
                checked={piAsPrimaryContact}
                onChange={() => !readOnlyInputs && togglePrimaryPI()}
                readOnly={readOnlyInputs}
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
            aria-label="Same as Principal Investigator"
            checked
            readOnly
          />
        </Grid>
        {!piAsPrimaryContact && (
          <>
            <TextInput
              id="section-a-primary-contact-first-name"
              label="First name"
              name="primaryContact[firstName]"
              value={primaryContact?.firstName || ""}
              placeholder="Enter first name"
              maxLength={50}
              readOnly={readOnlyInputs}
              required
            />
            <TextInput
              id="section-a-primary-contact-last-name"
              label="Last name"
              name="primaryContact[lastName]"
              value={primaryContact?.lastName || ""}
              placeholder="Enter last name"
              maxLength={50}
              readOnly={readOnlyInputs}
              required
            />
            <TextInput
              id="section-a-primary-contact-position"
              label="Position"
              name="primaryContact[position]"
              value={primaryContact?.position || ""}
              placeholder="Enter position"
              maxLength={100}
              readOnly={readOnlyInputs}
              required
            />
            <TextInput
              id="section-a-primary-contact-email"
              type="email"
              label="Email"
              name="primaryContact[email]"
              value={primaryContact?.email || ""}
              validate={validateEmail}
              errorText="Please provide a valid email address"
              placeholder="Enter email"
              readOnly={readOnlyInputs}
              required
            />
            <AutocompleteInput
              id="section-a-primary-contact-institution"
              label="Institution"
              name="primaryContact[institution]"
              value={primaryContact?.institution || ""}
              options={institutionConfig}
              placeholder="Enter or Select an Institution"
              readOnly={readOnlyInputs}
              validate={(v: string) => v?.trim()?.length > 0}
              disableClearable
              required
              freeSolo
            />
            <TextInput
              id="section-a-primary-contact-phone-number"
              type="tel"
              label="Phone number"
              name="primaryContact[phone]"
              filter={filterForNumbers}
              value={primaryContact?.phone || ""}
              placeholder="Enter phone number"
              maxLength={25}
              readOnly={readOnlyInputs}
            />
          </>
        )}
      </SectionGroup>

      {/* Additional Contacts */}
      <SectionGroup
        title={SectionAMetadata.sections.ADDITIONAL_CONTACTS.title}
        description={SectionAMetadata.sections.ADDITIONAL_CONTACTS.description}
        endButton={(
          <AddRemoveButton
            id="section-a-add-additional-contact-button"
            label="Add Contact"
            startIcon={<AddCircleIcon />}
            onClick={addContact}
            disabled={readOnlyInputs || status === FormStatus.SAVING}
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
              readOnly={readOnlyInputs}
            />
          )}
        />
      </SectionGroup>
    </FormContainer>
  );
};

export default FormSectionA;
