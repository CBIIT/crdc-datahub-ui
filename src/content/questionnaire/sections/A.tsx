import React, { FC } from "react";
import { withStyles } from "@mui/styles";
import AdditionalContact from "../../../components/Questionnaire/AdditionalContact";
import PrimaryContact from "../../../components/Questionnaire/PrimaryContact";
import { useFormContext } from "../../../components/Contexts/FormContext";
import FormContainer from "../../../components/Questionnaire/FormContainer";
import SectionGroup from "../../../components/Questionnaire/SectionGroup";
import TextInput from "../../../components/Questionnaire/TextInput";

type Props = {
  classes: any;
};

/**
 * Form Section A View
 *
 * @param {*} props
 * @param {object} props.classes The classes passed from Material UI Theme
 * @returns {JSX.Element}
 */
const FormSectionA: FC<Props> = ({ classes }: Props) => {
  const { data } = useFormContext();
  const { pi, primaryContact, additionalContacts } = data;

  const {
    firstName,
    lastName,
    position,
    email,
    institution,
    eRAAccount,
    address,
  }: PI = pi;

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
        <TextInput label="First Name" value={firstName} maxLength={50} required />
        <TextInput label="Last Name" value={lastName} maxLength={50} required />
        <TextInput label="Position" value={position} maxLength={100} required />
        <TextInput label="Email Address" value={email} required />
        <TextInput label="Institution" value={institution} maxLength={100} required />
        <TextInput label="If you have an eRA Commons account, provide here:" value={eRAAccount} />
        <TextInput
          label="Institution Address"
          value={address}
          gridWidth={12}
          maxLength={200}
          required
        />
      </SectionGroup>

      {/* Primary Contact */}
      <SectionGroup
        title={`Enter the contact information for the Primary Contact who will be
          assisting with data submission`}
      >
        <PrimaryContact contact={primaryContact} classes={classes} />
      </SectionGroup>

      {/* Additional Contacts */}
      <SectionGroup
        title={`If there are additional points of contact (e.g. data coordinator),
          enter the details for each. Each detail is required for each
          additional contact, you may add additional rows for the details for
          each contact.`}
      >
        {additionalContacts.map((contact: AdditionalContact, idx: number) => (
          <AdditionalContact key={idx} contact={contact} classes={classes} />
        ))}
        <button>Add Contact</button>
      </SectionGroup>
    </FormContainer>
  );
};

const styles = (theme: any) => ({});

export default withStyles(styles, { withTheme: true })(FormSectionA);
