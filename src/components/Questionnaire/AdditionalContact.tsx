import React, { FC } from "react";
import { Grid } from "@mui/material";
import TextInput from "./TextInput";

type Props = {
  classes: any;
  contact: AdditionalContact | null;
};

/**
 * Additional Contact Form Group
 *
 * @param {*} props
 * @param {AdditionalContact|null} props.contact The contact entry
 * @param {object} props.classes The classes passed from Material UI Theme
 * @returns {JSX.Element}
 */
export const AdditionalContact: FC<Props> = ({ contact, classes }: Props) => {
  const { role, firstName, lastName, email, phone } = contact;

  return (
    <>
      <TextInput label="Contact Role" value={role} required />
      <Grid item xs={6} />
      <TextInput label="First Name" value={firstName} required />
      <TextInput label="Last Name" value={lastName} required />
      <TextInput label="Email" value={email} required />
      <TextInput label="Phone Number" value={phone} />
    </>
  );
};

export default AdditionalContact;
