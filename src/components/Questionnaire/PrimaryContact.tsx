import React, { FC } from "react";
import TextInput from "./TextInput";
import { filterNonNumeric, validateEmail } from '../../content/questionnaire/utils';

type Props = {
  contact: PrimaryContact | null;
  classes: any;
  refs: {
    firstName: React.RefObject<HTMLInputElement>;
    lastName: React.RefObject<HTMLInputElement>;
    email: React.RefObject<HTMLInputElement>;
    phone: React.RefObject<HTMLInputElement>;
  };
};

/**
 * Primary Contact Form Group
 *
 * @param {Props} props
 * @param {PrimaryContact|null} props.contact The contact entry
 * @param {object} props.classes The classes passed from Material UI Theme
 * @param {object} props.refs The element refs passed from FormView
 * @returns {JSX.Element}
 */
export const PrimaryContact: FC<Props> = ({ contact, classes, refs }: Props) => {
  const { firstName, lastName, email, phone } = contact;

  return (
    <>
      <TextInput label="First Name" inputRef={refs.firstName} value={firstName} maxLength={50} required />
      <TextInput label="Last Name" inputRef={refs.lastName} value={lastName} maxLength={50} required />
      <TextInput label="Email" inputRef={refs.email} value={email} validate={validateEmail} required />
      <TextInput label="Phone Number" inputRef={refs.phone} value={phone} maxLength={25} filter={filterNonNumeric} />
    </>
  );
};

export default PrimaryContact;
