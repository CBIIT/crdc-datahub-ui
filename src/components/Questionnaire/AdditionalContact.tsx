import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import { Grid, styled } from "@mui/material";
import React, { FC } from "react";

import { filterForNumbers, validateEmail, validateUTF8, getInstitutionNameById } from "../../utils";
import AddRemoveButton from "../AddRemoveButton";
import { Status as FormStatus, useFormContext } from "../Contexts/FormContext";
import { useInstitutionList } from "../Contexts/InstitutionListContext";

import AutocompleteInput from "./AutocompleteInput";
import TextInput from "./TextInput";

const GridContainer = styled(Grid)({
  border: "0.5px solid #DCDCDC !important",
  borderRadius: "10px",
  padding: "18px 15px",
});

type Props = {
  idPrefix?: string;
  index: number;
  contact: Contact | null;
  readOnly?: boolean;
  onDelete: () => void;
};

/**
 * Additional Contact Form Group
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const AdditionalContact: FC<Props> = ({
  idPrefix = "",
  index,
  contact,
  readOnly,
  onDelete,
}: Props) => {
  const { status, data } = useFormContext();
  const { data: institutionList } = useInstitutionList();
  const { firstName, lastName, email, phone, position, institution } = contact;

  // Convert institution ID to name for display, or keep as-is if it's already a name
  const displayInstitutionValue = getInstitutionNameById(
    institution || "",
    institutionList || [],
    data?.newInstitutions || []
  );

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
          readOnly={readOnly}
        />
        <TextInput
          id={idPrefix.concat(`additionalContacts-${index}-last-name`)}
          label="Last name"
          name={`additionalContacts[${index}][lastName]`}
          value={lastName}
          placeholder="Enter last name"
          maxLength={50}
          required
          readOnly={readOnly}
        />
        <TextInput
          id={idPrefix.concat(`additionalContacts-${index}-position`)}
          label="Position"
          name={`additionalContacts[${index}][position]`}
          value={position}
          placeholder="Enter position"
          maxLength={100}
          required
          readOnly={readOnly}
        />
        <TextInput
          id={idPrefix.concat(`additionalContacts-${index}-email`)}
          label="Email"
          name={`additionalContacts[${index}][email]`}
          type="email"
          value={email}
          validate={validateEmail}
          errorText="Please provide a valid email address"
          placeholder="Enter email"
          required
          readOnly={readOnly}
        />
        <AutocompleteInput
          id={idPrefix.concat(`additionalContacts-${index}-institution`)}
          label="Institution"
          name={`additionalContacts[${index}][institution]`}
          value={displayInstitutionValue}
          options={institutionList?.map((i) => i.name)}
          placeholder="Enter or Select an Institution"
          validate={(v: string) => v?.trim()?.length > 0 && !validateUTF8(v)}
          required
          disableClearable
          freeSolo
          readOnly={readOnly}
        />
        <TextInput
          id={idPrefix.concat(`additionalContacts-${index}-phone-number`)}
          label="Phone number"
          name={`additionalContacts[${index}][phone]`}
          type="tel"
          filter={filterForNumbers}
          value={phone}
          placeholder="Enter phone number"
          maxLength={25}
          readOnly={readOnly}
        />
      </Grid>
      <Grid item xs={12}>
        <AddRemoveButton
          id={idPrefix.concat(`additionalContacts-${index}-remove-contact-button`)}
          label="Remove Contact"
          placement="start"
          onClick={onDelete}
          startIcon={<RemoveCircleIcon />}
          iconColor="#E74040"
          disabled={readOnly || status === FormStatus.SAVING}
        />
      </Grid>
    </GridContainer>
  );
};

export default AdditionalContact;
