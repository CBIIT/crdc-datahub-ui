import React, { FC, useEffect, useId, useRef, useState } from "react";
import {
  FormControl,
  FormHelperText,
  Grid,
  TextFieldProps,
  styled,
} from "@mui/material";
import { DatePicker, DatePickerProps, DateValidationError } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import Tooltip from "./Tooltip";
import calendarIcon from "../../assets/icons/calendar.svg";
import useFormMode from "../../content/questionnaire/sections/hooks/useFormMode";

const CalendarIcon = styled("div")(() => ({
  backgroundImage: `url(${calendarIcon})`,
  backgroundSize: "contain",
  backgroundRepeat: "no-repeat",
  width: "22.77px",
  height: "22.06px",
}));

const GridItem = styled(Grid)(({ theme }) => ({
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
}));

const StyledFormControl = styled(FormControl)(() => ({
  height: "100%",
  justifyContent: "end",
}));

const StyledAsterisk = styled("span")(() => ({
  color: "#D54309",
  marginLeft: "6px",
}));

const StyledFormLabel = styled("label")(({ theme }) => ({
  fontWeight: 700,
  fontSize: "16px",
  lineHeight: "19.6px",
  minHeight: "20px",
  color: "#083A50",
  marginBottom: "4px",
  [theme.breakpoints.up("lg")]: {
    whiteSpace: "nowrap",
  },
}));

const StyledFormHelperText = styled(FormHelperText)(() => ({
  marginTop: "4px",
  minHeight: "20px",
}));

const StyledDatePicker = styled(DatePicker)(() => ({
  "& .MuiInputBase-root": {
    borderRadius: "8px",
    backgroundColor: "#FFFFFF",
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
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
    border: "1px solid #209D7D !important",
    boxShadow: "2px 2px 4px 0px rgba(38, 184, 147, 0.10), -1px -1px 6px 0px rgba(38, 184, 147, 0.20)",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#6B7294",
  },
  "& .MuiInputBase-input::placeholder": {
    color: "#929296",
    fontWeight: 400,
    opacity: 1
  },
  // Override the input error border color
  "&.Mui-error fieldset": {
    borderColor: "#D54309 !important",
  },
  // Target readOnly <input> inputs
  "& .MuiInputBase-root:read-only": {
    backgroundColor: "#D9DEE4",
    cursor: "not-allowed",
  },
}));

type Props = {
  inputID: string;
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
  inputID,
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
  readOnly,
  ...rest
}) => {
  const id = useId();
  const { readOnlyInputs } = useFormMode();

  const [val, setVal] = useState<Dayjs>(dayjs(initialValue ?? ""));
  const [error, setError] = useState(false);
  const errorMsg = errorText || (required ? "This field is required" : null);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateInputValidity = (message: string) => {
    inputRef.current.setCustomValidity(message);
  };

  const validateInput = (input: Dayjs) => {
    inputRef.current.checkValidity();
    const value = input?.format("MM/DD/YYYY");
    const invalidDateMessage = "The date is invalid. Please enter a date in the format MM/DD/YYYY";

    if (validate) {
      const isValidCustom = validate(value);
      updateInputValidity(!isValidCustom ? invalidDateMessage : "");
      return isValidCustom;
    }

    const missingValueWhenRequired = required && !value;
    const isValid = input?.isValid() && !missingValueWhenRequired;
    updateInputValidity(!isValid ? invalidDateMessage : "");

    return isValid;
  };

  const handleOnError = (error: DateValidationError) => {
    if (!error && val) {
      setError(false);
      return;
    }
    setError(true);
  };

  const onChangeWrapper = (newVal: Dayjs) => {
    if (val === newVal) {
      return;
    }

    if (typeof onChange === "function") {
      onChange(newVal, null);
    }

    if (!newVal) {
      setError(true);
    }

    setVal(newVal);
    setError(!validateInput(newVal));
  };

  useEffect(() => {
    onChangeWrapper(dayjs(initialValue?.toString().trim()));
  }, [initialValue]);

  return (
    <GridItem md={gridWidth || 6} xs={12} item>
      <StyledFormControl fullWidth error={error}>
        <StyledFormLabel htmlFor={id}>
          {label}
          {required ? (<StyledAsterisk>*</StyledAsterisk>) : ""}
          {tooltipText && <Tooltip title={tooltipText} />}
        </StyledFormLabel>
        <StyledDatePicker
          value={val}
          onChange={(value: Dayjs) => onChangeWrapper(value)}
          inputRef={inputRef}
          onError={handleOnError}
          readOnly={readOnlyInputs || readOnly}
          slots={{ openPickerIcon: CalendarIcon }}
          slotProps={{
            textField: {
              id: inputID,
              name,
              required,
              error,
              size: "small",
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
        <StyledFormHelperText>
          {(error ? errorMsg : infoText) || " "}
        </StyledFormHelperText>
      </StyledFormControl>
    </GridItem>
  );
};

export default DatePickerInput;
