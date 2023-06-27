import React, { FC } from "react";
import { Button, Grid, Stack } from "@mui/material";
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { WithStyles, withStyles } from '@mui/styles';
import TextInput from "./TextInput";
import { Status as FormStatus, useFormContext } from '../Contexts/FormContext';
import { filterNonNumeric, validateEmail } from '../../content/questionnaire/utils';

type Props = {
  index: number;
  classes: WithStyles<typeof styles>['classes'];
  contact: AdditionalContact | null;
  onDelete: () => void;
};

/**
 * Additional Contact Form Group
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const AdditionalContact: FC<Props> = ({ index, classes, contact, onDelete }: Props) => {
  const { status } = useFormContext();

  const {
    firstName, lastName, email, phone, role, institution,
  } = contact;

  return (
    <Grid container className={classes.root}>
      <Grid item xs={12}>
        <Stack direction="row" justifyContent="end">
          <Button
            variant="outlined"
            type="button"
            onClick={onDelete}
            size="large"
            startIcon={<PersonRemoveIcon />}
            className={classes.contactButton}
            disabled={status === FormStatus.SAVING}
          >
            Remove Contact
          </Button>
        </Stack>
      </Grid>
      <TextInput label="First name" name={`additionalContacts[${index}][firstName]`} value={firstName} maxLength={50} required />
      <TextInput label="Last name" name={`additionalContacts[${index}][lastName]`} value={lastName} maxLength={50} required />
      <TextInput label="Institution" name={`additionalContacts[${index}][institution]`} value={institution} maxLength={100} required />
      <TextInput label="Position" name={`additionalContacts[${index}][role]`} value={role} maxLength={100} placeholder="(exs. Co-PI, sequencing center manager)" />
      <TextInput label="Email address" name={`additionalContacts[${index}][email]`} value={email} validate={validateEmail} required />
      <TextInput label="Phone number" name={`additionalContacts[${index}][phone]`} value={phone} maxLength={25} filter={filterNonNumeric} />
    </Grid>
  );
};

const styles = (theme) => ({
  root: {
    border: "0.5px solid #346798",
    borderRadius: "8px",
    padding: "10px",
    marginTop: "20px",
    marginLeft: "37px",
    marginRight: "-27px",
    "& .MuiGrid-item": {
      padding: "0 16px",
    },
    [theme.breakpoints.up("md")]: {
      "& .MuiGrid-item:nth-child(2n)": {
        paddingLeft: "16px",
        paddingRight: "32px",
      },
      "& .MuiGrid-item:nth-child(2n+1)": {
        paddingRight: "16px",
        paddingLeft: "32px",
      },
    },
  },
  contactButton: {
    color: "#346798",
    marginLeft: "auto",
    marginRight: "28px",
    marginTop: "10px",
    padding: "6px 20px",
    minWidth: "115px",
    borderRadius: "25px",
    border: "2px solid #AFC2D8 !important",
    background: "transparent",
    "text-transform": "none",
    "& .MuiButton-startIcon": {
      marginRight: "14px",
    },
  },
});

export default withStyles(styles, { withTheme: true })(AdditionalContact);
