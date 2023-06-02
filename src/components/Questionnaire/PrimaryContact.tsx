import React, { FC } from "react";
import TextInput from "./TextInput";
import { filterNonNumeric, validateEmail } from '../../content/questionnaire/utils';

type Props = {
  contact: PrimaryContact | null;
};

/**
 * Primary Contact Form Group
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
export const PrimaryContact: FC<Props> = ({ contact }: Props) => {
  const { firstName, lastName, email, phone } = contact;

  return (
    <>
      <TextInput label="First name" name="primaryContact[firstName]" value={firstName} maxLength={50} required />
      <TextInput label="Last name" name="primaryContact[lastName]" value={lastName} maxLength={50} required />
      <TextInput label="Email address" name="primaryContact[email]" value={email} validate={validateEmail} required />
      <TextInput label="Phone number" name="primaryContact[phone]" value={phone} maxLength={25} filter={filterNonNumeric} />
    </>
  );
};

export default PrimaryContact;
