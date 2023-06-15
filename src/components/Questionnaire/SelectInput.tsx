import React, { FC, useEffect, useId, useState } from "react";
import {
  FormControl,
  FormHelperText,
  Grid,
  MenuItem,
  Select,
} from "@mui/material";
import { WithStyles, withStyles } from "@mui/styles";

type Props = {
  classes: WithStyles<typeof styles>["classes"];
  value: string;
  options: { label: string; value: string | number }[];
  name: string;
  label: string;
  required?: boolean;
  helpText?: string;
  gridWidth?: 2 | 4 | 6 | 8 | 10 | 12;
  onChange?: (value: string) => void;
};

/**
 * Generates a generic select box with a label and help text
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const SelectInput: FC<Props> = ({
  classes,
  value,
  name,
  label,
  options,
  required = false,
  helpText,
  gridWidth,
  onChange,
}) => {
  const id = useId();

  const [val, setVal] = useState(value);
  const [error] = useState(false);
  const helperText = helpText || (required ? "This field is required" : " ");

  const onChangeWrapper = (newVal) => {
    if (typeof onChange === "function") {
      onChange(newVal);
    }

    setVal(newVal);
  };

  useEffect(() => {
    onChangeWrapper(value);
  }, [value]);

  return (
    <Grid className={classes.root} md={gridWidth || 6} xs={12} item>
      <FormControl fullWidth error={error}>
        <label htmlFor={id} className={classes.label}>
          {label}
          {required ? <span className={classes.asterisk}>*</span> : ""}
        </label>
        <Select
          classes={{ select: classes.input }}
          id={id}
          size="small"
          value={val}
          onChange={(e) => onChangeWrapper(e.target.value)}
          required={required}
          name={name}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
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
      borderRadius: "0",
      borderColor: "#346798",
    },
    "&.Mui-error fieldset": {
      borderColor: "#D54309 !important",
    },
  },
  label: {
    fontWeight: 500,
    fontSize: "16px",
    color: "#346798",
    marginBottom: "7px",
  },
  asterisk: {
    color: "#D54309",
    marginLeft: "4px",
  },
  input: {
    backgroundColor: "#fff",
    color: "#4E4E4E !important",
  },
});

export default withStyles(styles, { withTheme: true })(SelectInput);
