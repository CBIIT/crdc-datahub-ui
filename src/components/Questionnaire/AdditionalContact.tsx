import React, { FC } from "react";
import { Button, Grid, Stack } from "@mui/material";
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { WithStyles, withStyles } from '@mui/styles';
import TextInput from "./TextInput";
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
  const { role, firstName, lastName, email, phone } = contact;

  return (
    <Grid container columnSpacing={8} xs={12} className={classes.root}>
      <Grid item xs={12}>
        <Stack direction="row" justifyContent="end">
          <Button
            variant="outlined"
            type="button"
            onClick={onDelete}
            size="large"
            startIcon={<PersonRemoveIcon />}
            className={classes.contactButton}
          >
            Remove Contact
          </Button>
        </Stack>
      </Grid>
      <TextInput label="First name" name={`additionalContacts[${index}][firstName]`} value={firstName} maxLength={50} required />
      <TextInput label="Last name" name={`additionalContacts[${index}][lastName]`} value={lastName} maxLength={50} required />
      <TextInput label="Institution" name={`additionalContacts[${index}][todo]`} value="TODO" maxLength={100} required />
      <TextInput label="Position" name={`additionalContacts[${index}][role]`} value={role} maxLength={100} />
      <TextInput label="Email address" name={`additionalContacts[${index}][email]`} value={email} validate={validateEmail} required />
      <TextInput label="Phone number" name={`additionalContacts[${index}][phone]`} value={phone} maxLength={25} filter={filterNonNumeric} />
    </Grid>
  );
};

const styles = () => ({
  root: {
    marginLeft: "35px",
    border: "1px solid #3b3b3b",
    padding: "10px",
    borderRadius: "5px",
    marginTop: "20px",
    "& .MuiGrid-item": {
      paddingLeft: "16px !important",
      paddingRight: "16px !important",
    },
  },
  contactButton: {
    marginLeft: "auto",
    marginTop: "10px",
    padding: "8px 20px",
    minWidth: "115px",
    borderRadius: "24px",
    color: "inherit",
    borderColor: "inherit !important",
    background: "transparent",
    "text-transform": "none",
  }
});

export default withStyles(styles)(AdditionalContact);
