import React, { FC, useEffect, useId, useState } from 'react';
import { FormControl, FormHelperText, Grid, OutlinedInput, OutlinedInputProps } from '@mui/material';
import { WithStyles, withStyles } from '@mui/styles';

type Props = {
  classes: WithStyles<typeof styles>['classes'];
  value: string;
  label: string;
  name: string;
  helpText?: string;
  gridWidth?: 2 | 4 | 6 | 8 | 10 | 12;
  maxLength?: number;
  validate?: (input: string) => boolean;
  filter?: (input: string) => string;
} & OutlinedInputProps;

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
  ...rest
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

  useEffect(() => {
    setVal(value);
  }, [value]);

  return (
    <Grid className={classes.root} md={gridWidth || 6} xs={12} item>
      <FormControl fullWidth error={error}>
        <label htmlFor={id} className={classes.label}>
          {label}
          {required ? (<span className={classes.asterisk}>*</span>) : ''}
        </label>
        <OutlinedInput
          classes={{ root: classes.input }}
          type={rest.type || 'text'}
          id={id}
          size="small"
          value={val}
          name={name}
          onChange={onChange}
          required={required}
          {...rest}
        />
        <FormHelperText>{error ? helperText : ' '}</FormHelperText>
      </FormControl>
    </Grid>
  );
};

const styles = () => ({
  root: {
    "& .MuiFormHelperText-root.Mui-error": {
      color: "#D54309 !important",
    },
  },
  label: {
    fontWeight: 500,
    fontSize: "16px",
    color: "#346798",
    marginBottom: "7px",
  },
  asterisk: {
    color: '#D54309',
    marginLeft: '4px',
  },
  input: {
    borderRadius: "0",
    backgroundColor: "#fff",
    color: "#4E4E4E",

    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#346798",
    },
    "& input::placeholder": {
      color: "#9D9D9D",
    },
    // Override the input error border color
    "&.Mui-error fieldset": {
      borderColor: "#D54309 !important",
    },
    // Target readOnly <textarea> inputs
    "&.MuiInputBase-multiline.Mui-readOnly": {
      backgroundColor: '#D9DEE4',
      cursor: 'not-allowed',
    },
    // Target readOnly <input> inputs
    "& .MuiOutlinedInput-input:read-only": {
      backgroundColor: '#D9DEE4',
      cursor: 'not-allowed',
    },
  },
});

export default withStyles(styles, { withTheme: true })(TextInput);
