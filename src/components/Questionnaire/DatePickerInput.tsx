import React, { FC, useEffect, useId, useState } from "react";
import {
  FormControl,
  FormHelperText,
  Grid,
  OutlinedInputProps,
} from "@mui/material";
import { WithStyles, withStyles } from "@mui/styles";
import { DatePicker } from "@mui/x-date-pickers";
import Tooltip from "./Tooltip";

type Props = {
  classes: WithStyles<typeof styles>["classes"];
  label: string;
  infoText?: string;
  errorText?: string;
  tooltipText?: string;
  gridWidth?: 2 | 4 | 6 | 8 | 10 | 12;
  maxLength?: number;
  validate?: (input: string) => boolean;
  filter?: (input: string) => string;
} & OutlinedInputProps;

/**
 * Generates a generic date picker input with a label, help text, and tooltip text
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const DatePickerInput: FC<Props> = ({
  classes,
  value,
  label,
  required = false,
  gridWidth,
  maxLength,
  infoText,
  tooltipText,
  errorText,
  validate,
  filter,
  onChange,
  ...rest
}) => {
  const id = useId();
  const [val, setVal] = useState<Date | null>(value as Date);
  const [error, setError] = useState(false);
  const errorMsg = errorText || (required ? "This field is required" : null);

  const onChangeWrapper = (newVal) => {
    if (typeof onChange === "function") {
      onChange(newVal);
    }

    setVal(newVal);
  };

  useEffect(() => {
    onChangeWrapper(value.toString().trim());
  }, [value]);

  return (
    <Grid className={classes.root} md={gridWidth || 6} xs={12} item>
      <FormControl className={classes.formControl} fullWidth error={error}>
        <label htmlFor={id} className={classes.label}>
          {label}
          {required ? <span className={classes.asterisk}>*</span> : ""}
          {tooltipText && <Tooltip title={tooltipText} />}
        </label>
        {/* <TextInput
          label={label}
          name="datepicker[label]"
          value={val}
          onChange={(e) => onChangeWrapper(e.target.value)}
          placeholder="MM/DD/YYYY"
          validate={isValidDate}
          errorText="Please enter a valid date in the format MM/DD/YYYY"
          maxLength={10}
          required
        /> */}
        <DatePicker />
        <FormHelperText>{(error ? errorMsg : infoText) || " "}</FormHelperText>
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
  tooltip: {
    fontSize: "12px",
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
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#6B7294",
    },
    "& ::placeholder": {
      color: "#969696",
      fontWeight: 400,
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
});

export default withStyles(styles, { withTheme: true })(DatePickerInput);
