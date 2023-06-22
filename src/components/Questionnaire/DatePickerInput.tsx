import React, { FC, useEffect, useId, useState } from "react";
import {
  FormControl,
  FormHelperText,
  Grid,
  TextFieldProps,
} from "@mui/material";
import { WithStyles, withStyles } from "@mui/styles";
import { DatePicker, DatePickerProps } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import styled from "@emotion/styled";
import Tooltip from "./Tooltip";
import calendarIcon from "../../assets/icons/calendar.svg";

const CalendarIcon = styled.div`
  background-image: url(${calendarIcon});
  background-size: contain;
  background-repeat: no-repeat;
  width: 22.77px;
  height: 22.06px;
`;

type Props = {
  classes: WithStyles<typeof styles>["classes"];
  initialValue?: string | Date;
  label: string;
  infoText?: string;
  errorText?: string;
  tooltipText?: string;
  gridWidth?: 2 | 4 | 6 | 8 | 10 | 12;
  maxLength?: number;
  name?: string;
  required?: boolean;
  inputProps?: TextFieldProps;
  validate?: (input: string) => boolean;
  filter?: (input: string) => string;
} & DatePickerProps<Dayjs>;

/**
 * Generates a generic date picker input with a label, help text, and tooltip text
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const DatePickerInput: FC<Props> = ({
  classes,
  initialValue,
  label,
  name,
  required = false,
  inputProps,
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
  const [val, setVal] = useState<Dayjs>(typeof initialValue === "string" ? dayjs(new Date(initialValue)) : dayjs(initialValue));
  const [error, setError] = useState(false);
  const errorMsg = errorText || (required ? "This field is required" : null);

  const onChangeWrapper = (newVal) => {
    if (typeof onChange === "function") {
      onChange(newVal, null);
    }

    setVal(newVal);
  };

  useEffect(() => {
    onChangeWrapper(initialValue.toString().trim());
  }, [initialValue]);

  return (
    <Grid className={classes.root} md={gridWidth || 6} xs={12} item>
      <FormControl className={classes.formControl} fullWidth error={error}>
        <label htmlFor={id} className={classes.label}>
          {label}
          {required ? (<span className={classes.asterisk}>*</span>) : ""}
          {tooltipText && <Tooltip title={tooltipText} />}
        </label>
        <DatePicker
          value={val || ""}
          onChange={(value) => onChangeWrapper(value)}
          slots={{ openPickerIcon: CalendarIcon }}
          slotProps={{
            textField: {
              name,
              size: "small",
              classes: { root: classes.input },
              ...inputProps,
            },
            popper: {
              placement: "bottom-end",
              disablePortal: true,
              modifiers: [
                {
                  // disables popper from flipping above the input when out of screen room
                  name: "flip",
                  enabled: false,
                  options: {
                    fallbackPlacements: [],
                  },
                },
              ],
            },
          }}
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
    "& .MuiInputBase-root": {
      borderRadius: "8px",
      backgroundColor: "#fff",
      color: "#083A50",
    },
    "& .MuiInputBase-input": {
      fontWeight: 400,
      fontSize: "16px",
      fontFamily: "'Nunito', 'Rubik', sans-serif",
      lineHeight: "19.6px",
      padding: "12px",
      height: "20px",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#6B7294",
    },
    "& .MuiInputBase-input::placeholder": {
      color: "#929296",
      fontWeight: 400,
    },
    // Override the input error border color
    "&.Mui-error fieldset": {
      borderColor: "#D54309 !important",
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

export default withStyles(styles, { withTheme: true })(DatePickerInput);
