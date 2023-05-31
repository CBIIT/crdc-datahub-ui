import React, { FC } from "react";
import { Grid } from "@mui/material";
import TextInput from "./TextInput";
import { filterNonNumeric, validateEmail } from '../../content/questionnaire/utils';

type Props = {
  index: number;
  classes: any;
  contact: AdditionalContact | null;
  onDelete: () => void;
};

/**
 * Additional Contact Form Group
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
export const AdditionalContact: FC<Props> = ({ index, contact, onDelete }: Props) => {
  const { role, firstName, lastName, email, phone } = contact;

  return (
    <>
      <TextInput label="Contact Role" name={`additionalContacts[${index}][role]`} value={role} maxLength={100} required />
      <Grid item xs={6} />
      <TextInput label="First Name" name={`additionalContacts[${index}][firstName]`} value={firstName} maxLength={50} required />
      <TextInput label="Last Name" name={`additionalContacts[${index}][lastName]`} value={lastName} maxLength={50} required />
      <TextInput label="Email" name={`additionalContacts[${index}][email]`} value={email} validate={validateEmail} required />
      <TextInput label="Phone Number" name={`additionalContacts[${index}][phone]`} value={phone} maxLength={25} filter={filterNonNumeric} />
      <Grid item xs={12}>
        <button type="button" onClick={onDelete}>Remove</button>
      </Grid>
    </>
  );
};

export default AdditionalContact;
