import React, { FC, useId, useState } from 'react';
import { FormControl, FormHelperText, Grid, OutlinedInput } from '@mui/material';
import { withStyles } from '@mui/styles';

type Props = {
  classes: any;
  value: string;
  label: string;
  name: string;
  required?: boolean;
  helpText?: string;
  gridWidth?: 2 | 4 | 6 | 8 | 10 | 12;
  maxLength?: number;
  validate?: (input: string) => boolean;
  filter?: (input: string) => string;
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
 * @returns {JSX.Element}
 */
const TextInput: FC<Props> = ({
  classes, value, label, required = false,
  helpText, gridWidth, maxLength, name,
  validate, filter,
}) => {
  const id = useId();
  const [val, setVal] = useState(value);
  const [error, setError] = useState(false);
  const helperText = helpText || (required ? 'This field is required' : ' ');

  const validateInput = (input: string) => {
    if (validate) {
      return validate(input);
    }
    if (typeof maxLength === "number" && input.length > maxLength) {
      return false;
    }
    if (required && input.trim().length === 0) {
      return false;
    }

    return true;
  };

  const onChange = (e) => {
    let newVal = e.target.value;

    if (typeof filter === "function") {
      newVal = filter(newVal);
      e.target.value = newVal;
    }

    if (typeof maxLength === "number" && newVal.length > maxLength) {
      newVal = newVal.slice(0, maxLength);
      e.target.value = newVal;
    }

    setVal(newVal);
    setError(!validateInput(newVal));
  };

  return (
    <Grid xs={gridWidth || 6} item>
      <FormControl fullWidth error={error}>
        <label htmlFor={id} className={classes.label}>
          {label}
          {required ? (<span className={classes.asterisk}> *</span>) : ''}
        </label>
        <OutlinedInput
          id={id}
          size="small"
          value={val}
          onChange={onChange}
          required={required}
          name={name}
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
