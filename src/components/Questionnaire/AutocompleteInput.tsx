import React, { FC, useEffect, useId, useState } from "react";
import {
  Autocomplete,
  FormControl,
  FormHelperText,
  Grid,
  TextField,
} from "@mui/material";
import { WithStyles, withStyles } from "@mui/styles";

type Props = {
  classes: WithStyles<typeof styles>["classes"];
  value: string;
  label: string;
  options: string[];
  name?: string;
  required?: boolean;
  helpText?: string;
  gridWidth?: 2 | 4 | 6 | 8 | 10 | 12;
  placeholder?: string;
  disableClearable?: boolean;
  onChange?: (e: React.SyntheticEvent, v: string, r: string) => void;
};

/**
 * Generates a generic autocomplete select box with a label and help text
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const AutocompleteInput: FC<Props> = ({
  classes,
  value,
  name,
  label,
  required = false,
  helpText,
  gridWidth,
  onChange,
  ...rest
}) => {
  const id = useId();

  const [val, setVal] = useState(value);
  const [error] = useState(false);
  const helperText = helpText || (required ? "This field is required" : " ");

  const onChangeWrapper = (e, v, r) => {
    if (typeof onChange === "function") {
      onChange(e, v, r);
    }

    setVal(v);
  };

  useEffect(() => {
    onChangeWrapper(null, value, null);
  }, [value]);

  return (
    <Grid className={classes.root} md={gridWidth || 6} xs={12} item>
      <FormControl fullWidth error={error}>
        <label htmlFor={id} className={classes.label}>
          {label}
          {required ? <span className={classes.asterisk}>*</span> : ""}
        </label>
        <Autocomplete
          id={id}
          size="small"
          value={val}
          classes={{ root: classes.input }}
          onChange={onChangeWrapper}
          renderInput={(p) => (
            <TextField
              {...p}
              name={name}
              required={required}
              placeholder={rest.placeholder || ""}
            />
          )}
          {...rest}
        />
        <FormHelperText>{error ? helperText : " "}</FormHelperText>
      </FormControl>
    </Grid>
  );
};

const styles = () => ({
  root: {
    "& .MuiFormHelperText-root.Mui-error": {
      color: "#D54309 !important",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderRadius: "8px",
      borderColor: "#6B7294",
    },
    "&.Mui-error fieldset": {
      borderColor: "#D54309 !important",
    },
    "& .MuiAutocomplete-input": {
      color: "#083A50",
    },
  },
  label: {
    fontWeight: 700,
    fontSize: "16px",
    color: "#083A50",
    marginBottom: "4px",
  },
  asterisk: {
    color: "#D54309",
    marginLeft: "6px",
  },
  input: {
    backgroundColor: "#fff",
    "&  .MuiAutocomplete-inputRoot.MuiInputBase-root": {
      padding: 0,
    },
    "& .MuiInputBase-input": {
      fontWeight: 400,
      fontSize: "16px",
      fontFamily: "'Nunito', 'Rubik', sans-serif",
      padding: "12px !important",
      height: "20px",
    },
  },
});

export default withStyles(styles, { withTheme: true })(AutocompleteInput);
