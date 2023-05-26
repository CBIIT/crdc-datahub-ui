import React, { FC } from "react";
import TextInput from "./TextInput";

type Props = {
  contact: PrimaryContact | null;
  classes: any;
};

/**
 * Primary Contact Form Group
 *
 * @param {Props} props
 * @param {PrimaryContact|null} props.contact The contact entry
 * @param {object} props.classes The classes passed from Material UI Theme
 * @returns {JSX.Element}
 */
export const PrimaryContact: FC<Props> = ({ contact, classes }: Props) => {
  const { firstName, lastName, email, phone } = contact;

  return (
    <>
      <TextInput label="First Name" value={firstName} required />
      <TextInput label="Last Name" value={lastName} required />
      <TextInput label="Email" value={email} required />
      <TextInput label="Phone Number" value={phone} />
    </>
  );
};

export default PrimaryContact;
