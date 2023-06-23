import React, { FC, useEffect, useId, useState } from "react";
import {
  FormControl,
  FormHelperText,
  Grid,
  OutlinedInput,
  OutlinedInputProps,
} from "@mui/material";
import { WithStyles, withStyles } from "@mui/styles";

type Props = {
  classes: WithStyles<typeof styles>["classes"];
  label: string;
  infoText?: string;
  errorText?: string;
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
  classes,
  value,
  label,
  required = false,
  gridWidth,
  maxLength,
  infoText,
  errorText,
  validate,
  filter,
  ...rest
}) => {
  const id = useId();
  const [val, setVal] = useState(value);
  const [error, setError] = useState(false);
  const errorMsg = errorText || (required ? "This field is required" : null);

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

  const onChange = (newVal) => {
    if (typeof filter === "function") {
      newVal = filter(newVal);
    }
    if (typeof maxLength === "number" && newVal.length > maxLength) {
      newVal = newVal.slice(0, maxLength);
    }

    setVal(newVal);
    setError(!validateInput(newVal));
  };

  useEffect(() => {
    onChange(value.toString().trim());
  }, [value]);

  return (
    <Grid className={classes.root} md={gridWidth || 6} xs={12} item>
      <FormControl className={classes.formControl} fullWidth error={error}>
        <label htmlFor={id} className={classes.label}>
          {label}
          {required ? <span className={classes.asterisk}>*</span> : ""}
        </label>
        <OutlinedInput
          classes={{ root: classes.input }}
          type={rest.type || "text"}
          id={id}
          size="small"
          value={val}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          {...rest}
        />
        <FormHelperText className={classes.helperText}>
          {(error ? errorMsg : infoText) || " "}
        </FormHelperText>
      </FormControl>
    </Grid>
  );
};

const styles = (theme) => ({
  root: {
    "& .MuiFormHelperText-root": {
      color: "#083A50",
      marginLeft: "0",
      [theme.breakpoints.up("lg")]: {
        whiteSpace: "nowrap",
      },
    },
    "& .MuiFormHelperText-root.Mui-error": {
      color: "#D54309 !important",
    },
  },
  formControl: {
    height: "100%",
    justifyContent: "end",
  },
  label: {
    fontWeight: 700,
    fontSize: "16px",
    lineHeight: "19.6px",
    minHeight: "20px",
    color: "#083A50",
    marginBottom: "4px",
    [theme.breakpoints.up("lg")]: {
      whiteSpace: "nowrap",
    },
  },
  asterisk: {
    color: "#D54309",
    marginLeft: "6px",
  },
  input: {
    borderRadius: "8px",
    backgroundColor: "#fff",
    color: "#083A50",
    "& .MuiInputBase-input": {
      fontWeight: 400,
      fontSize: "16px",
      fontFamily: "'Nunito', 'Rubik', sans-serif",
      lineHeight: "19.6px",
      padding: "12px",
      height: "20px",
    },
    "&.MuiInputBase-multiline": {
      padding: "12px",
    },
    "&.MuiInputBase-multiline .MuiInputBase-input": {
      lineHeight: "25px",
      padding: 0,
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#6B7294",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      border: "1px solid #209D7D",
      boxShadow: "2px 2px 4px 0px rgba(38, 184, 147, 0.10), -1px -1px 6px 0px rgba(38, 184, 147, 0.20)",
    },
    "& ::placeholder": {
      color: "#929296",
      fontWeight: 400,
      opacity: 1
    },
    // Override the input error border color
    "&.Mui-error fieldset": {
      borderColor: "#D54309 !important",
    },
    // Target readOnly <textarea> inputs
    "&.MuiInputBase-multiline.Mui-readOnly": {
      backgroundColor: "#D9DEE4",
      cursor: "not-allowed",
    },
    // Target readOnly <input> inputs
    "& .MuiOutlinedInput-input:read-only": {
      backgroundColor: "#D9DEE4",
      cursor: "not-allowed",
    },
  },
  helperText: {
    marginTop: "4px",
    minHeight: "20px",
  },
});

export default withStyles(styles, { withTheme: true })(TextInput);
