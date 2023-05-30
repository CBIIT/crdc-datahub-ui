import React, { FC } from "react";
import { Grid } from "@mui/material";
import TextInput from "./TextInput";
import { filterNonNumeric, validateEmail } from '../../content/questionnaire/utils';

type Props = {
  classes: any;
  contact: AdditionalContact | null;
  refs: {
    role: React.RefObject<HTMLInputElement>;
    firstName: React.RefObject<HTMLInputElement>;
    lastName: React.RefObject<HTMLInputElement>;
    email: React.RefObject<HTMLInputElement>;
    phone: React.RefObject<HTMLInputElement>;
  };
};

/**
 * Additional Contact Form Group
 *
 * @param {*} props
 * @param {AdditionalContact|null} props.contact The contact entry
 * @param {object} props.classes The classes passed from Material UI Theme
 * @returns {JSX.Element}
 */
export const AdditionalContact: FC<Props> = ({ contact, classes, refs }: Props) => {
  const { role, firstName, lastName, email, phone } = contact;

  return (
    <>
      <TextInput label="Contact Role" inputRef={refs.role} value={role} maxLength={100} required />
      <Grid item xs={6} />
      <TextInput label="First Name" inputRef={refs.firstName} value={firstName} maxLength={50} required />
      <TextInput label="Last Name" inputRef={refs.lastName} value={lastName} maxLength={50} required />
      <TextInput label="Email" inputRef={refs.email} value={email} validate={validateEmail} required />
      <TextInput label="Phone Number" inputRef={refs.phone} value={phone} maxLength={25} filter={filterNonNumeric} />
    </>
  );
};

export default AdditionalContact;
