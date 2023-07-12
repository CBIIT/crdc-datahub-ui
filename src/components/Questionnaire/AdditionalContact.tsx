import React, { FC } from "react";
import { Grid, styled } from "@mui/material";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import { Status as FormStatus, useFormContext } from "../Contexts/FormContext";
import institutionConfig from "../../config/InstitutionConfig";
import TextInput from "./TextInput";
import AddRemoveButton from "./AddRemoveButton";
import AutocompleteInput from "./AutocompleteInput";

const GridContainer = styled(Grid)({
  border: "0.5px solid #DCDCDC !important",
  borderRadius: "10px",
  padding: "18px 15px",
});

type Props = {
  idPrefix?: string;
  index: number;
  contact: Contact | null;
  onDelete: () => void;
};

/**
 * Additional Contact Form Group
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const AdditionalContact: FC<Props> = ({ idPrefix = "", index, contact, onDelete }: Props) => {
  const { status } = useFormContext();
  const {
    firstName, lastName, email,
    phone, position, institution,
  } = contact;

  return (
    <GridContainer container>
      <Grid container item xs={12} rowSpacing={0} columnSpacing={1.5}>
        <TextInput
          id={idPrefix.concat(`additionalContacts-${index}-first-name`)}
          label="First name"
          name={`additionalContacts[${index}][firstName]`}
          value={firstName}
          placeholder="Enter first name"
          maxLength={50}
          required
        />
        <TextInput
          id={idPrefix.concat(`additionalContacts-${index}-last-name`)}
          label="Last name"
          name={`additionalContacts[${index}][lastName]`}
          value={lastName}
          placeholder="Enter last name"
          maxLength={50}
          required
        />
        <TextInput
          id={idPrefix.concat(`additionalContacts-${index}-position`)}
          label="Position"
          name={`additionalContacts[${index}][position]`}
          value={position}
          placeholder="Enter position"
          maxLength={100}
          required
        />
        <TextInput
          id={idPrefix.concat(`additionalContacts-${index}-email`)}
          label="Email"
          name={`additionalContacts[${index}][email]`}
          type="email"
          value={email}
          placeholder="Enter email"
          required
        />
        <AutocompleteInput
          id={idPrefix.concat(`additionalContacts-${index}-institution`)}
          label="Institution"
          name={`additionalContacts[${index}][institution]`}
          value={institution || ""}
          options={institutionConfig}
          placeholder="Enter or Select an Institution"
          required
          disableClearable
          freeSolo
        />
        <TextInput
          id={idPrefix.concat(`additionalContacts-${index}-phone-number`)}
          label="Phone number"
          name={`additionalContacts[${index}][phone]`}
          type="phone"
          value={phone}
          placeholder="Enter phone number"
          maxLength={25}
        />
      </Grid>
      <Grid item xs={12}>
        <AddRemoveButton
          id={idPrefix.concat(`additionalContacts-${index}-remove-contact-button`)}
          label="Remove Contact"
          placement="start"
          onClick={onDelete}
          startIcon={<RemoveCircleIcon />}
          iconColor="#F18E8E"
          disabled={status === FormStatus.SAVING}
        />
      </Grid>
    </GridContainer>
  );
};

export default AdditionalContact;
