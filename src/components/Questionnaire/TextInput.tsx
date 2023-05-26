import React, { FC, useId, useState } from 'react';
import { FormControl, FormHelperText, Grid, OutlinedInput } from '@mui/material';
import { withStyles } from '@mui/styles';

type Props = {
  classes: any;
  value: string;
  label: string;
  required?: boolean;
  helpText?: string;
  gridWidth?: 2 | 4 | 6 | 8 | 10 | 12;
  maxLength?: number;
};

/**
 * Generates a generic text input with a label and help text
 *
 * NOTE:
 * - We're using a custom wrapper for Material UI's OutlinedInput component
 *   instead of using the TextField component because of the forced
 *   floating label behavior of TextField.
 *
 * @param {Props} props
 * @param {object} props.classes The classes passed from Material UI Theme
 * @param {string} props.value The value of the input
 * @param {string} props.label The label of the input
 * @param {boolean} [props.required] Whether the input is required
 * @param {string} [props.helpText] The help text of the input
 * @param {number} [props.gridWidth] The width of the input in the grid view
 * @param {number} [props.maxLength] The maximum length of the input
 * @returns {JSX.Element}
 */
const TextInput: FC<Props> = ({
  classes, value, label, required = false,
  helpText, gridWidth, maxLength,
}) => {
  const helperText = helpText || (required ? 'This field is required' : ' ');
  const id = useId();
  const [error, setError] = useState(false);

  if (maxLength && value.length > maxLength) {
    setError(true);
  }

  return (
    <Grid xs={gridWidth ? gridWidth : 6} item>
      <FormControl fullWidth error={error}>
        <label htmlFor={id} className={classes.label}>
          {label}
          {required ? ( <span className={classes.asterisk}> *</span> ) : ''}
        </label>
        <OutlinedInput
          id={id}
          size="small"
          defaultValue={value}
          required={required}
        />
        <FormHelperText>{error ? helperText : ' '}</FormHelperText>
      </FormControl>
    </Grid>
  );
};

const styles = (theme: any) => ({
  label: {
    fontWeight: 600,
    color: "blue",
  },
  asterisk: {
    color: 'red',
  },
});

export default withStyles(styles, { withTheme: true })(TextInput);
