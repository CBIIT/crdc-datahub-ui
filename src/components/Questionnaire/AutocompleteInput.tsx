import {
  Autocomplete,
  AutocompleteChangeReason,
  AutocompleteProps,
  AutocompleteValue,
  FormControl,
  FormHelperText,
  Grid,
  TextField,
  styled,
} from "@mui/material";
import { SyntheticEvent, useEffect, useId, useRef, useState } from "react";
import { ReactComponent as DropdownArrowsIconSvg } from "../../assets/icons/dropdown_arrows.svg";

const StyledFormControl = styled(FormControl)(() => ({
  height: "100%",
  justifyContent: "end",
  "& .MuiFormHelperText-root.Mui-error": {
    color: "#D54309 !important",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderRadius: "8px",
    borderColor: "#6B7294",
  },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
    border: "1px solid #209D7D !important",
    boxShadow:
      "2px 2px 4px 0px rgba(38, 184, 147, 0.10), -1px -1px 6px 0px rgba(38, 184, 147, 0.20)",
  },
  "& .Mui-error fieldset": {
    borderColor: "#D54309 !important",
  },
  "& .MuiInputBase-input::placeholder": {
    color: "#929296",
    fontWeight: 400,
    opacity: 1,
  },
  "& .MuiAutocomplete-input": {
    color: "#083A50",
  },
  "& .MuiAutocomplete-root .MuiAutocomplete-endAdornment": {
    top: '50%',
    transform: 'translateY(-50%)',
    right: "12px",
  },
  "& .MuiAutocomplete-popupIndicator": {
    marginRight: "1px",
  },
  "& .MuiAutocomplete-popupIndicatorOpen": {
    transform: "none",
  },

  "& .MuiPaper-root": {
    borderRadius: "8px",
    border: "1px solid #6B7294",
    marginTop: "2px",
    "& .MuiAutocomplete-listbox": {
      padding: 0,
      overflow: "auto",
      maxHeight: "300px",
    },
    "& .MuiAutocomplete-option[aria-selected='true']": {
      color: "#083A50",
      background: "#FFFFFF",
    },
    "& .MuiAutocomplete-option": {
      padding: "7.5px 10px",
      minHeight: "35px",
      color: "#083A50",
      background: "#FFFFFF",
    },
    "& .MuiAutocomplete-option:hover": {
      backgroundColor: "#5E6787",
      color: "#FFFFFF",
    },
    "& .MuiAutocomplete-option.Mui-focused": {
      backgroundColor: "#5E6787 !important",
      color: "#FFFFFF",
    },
  },
}));

const StyledFormLabel = styled("label")(() => ({
  fontWeight: 700,
  fontSize: "16px",
  lineHeight: "19.6px",
  minHeight: "20px",
  color: "#083A50",
  marginBottom: "4px",
}));

const StyledAsterisk = styled("span")(() => ({
  color: "#D54309",
  marginLeft: "6px",
}));

const StyledAutocomplete = styled(Autocomplete)(() => ({
  "& .MuiInputBase-root": {
    backgroundColor: "#FFFFFF",
    "&.MuiAutocomplete-inputRoot.MuiInputBase-root": {
      display: 'flex',
      alignItems: 'center',
      padding: 0,
    },
    "&.MuiOutlinedInput-input:read-only": {
      backgroundColor: "#D9DEE4",
      cursor: "not-allowed",
      borderRadius: "8px",
    },
    "& .MuiInputBase-input": {
      fontWeight: 400,
      fontSize: "16px",
      fontFamily: "'Nunito', 'Rubik', sans-serif",
      padding: "12px 30px 12px 12px !important",
      height: "20px",
    },
    "& .MuiAutocomplete-clearIndicator": {
      visibility: "hidden !important",
      position: "absolute"
    },
  },
}));

const StyledFormHelperText = styled(FormHelperText)(() => ({
  marginLeft: 0,
  marginTop: "4px",
  minHeight: "20px",
}));

type Props<T> = {
  name?: string;
  label?: string;
  value?: T;
  options?: T[];
  gridWidth?: 2 | 4 | 6 | 8 | 10 | 12;
  helpText?: string;
  required?: boolean;
  validate?: (input: T) => boolean;
} & Omit<AutocompleteProps<T, false, true, true, "div">, "renderInput">;

const AutocompleteInput = <T,>({
  name,
  label,
  gridWidth,
  helpText,
  required,
  value,
  onChange,
  options,
  validate,
  placeholder,
  freeSolo,
  ...rest
}: Props<T>) => {
  const id = useId();

  const [val, setVal] = useState<T>(value);
  const [error, setError] = useState<boolean>(false);
  const helperText = helpText || (required ? "This field is required" : " ");
  const inputRef = useRef<HTMLInputElement>(null);

  const validateInput = (input: AutocompleteValue<T, false, false, false>,): boolean => {
    if (validate) {
      const customIsValid = validate(input);
      return customIsValid;
    }
    if ((required && input) || (required && typeof input === "string" && input?.length > 0)) {
      return false;
    }
    return true;
  };

  const onChangeWrapper = (
    event: SyntheticEvent,
    newValue: AutocompleteValue<T, false, false, false>,
    reason: AutocompleteChangeReason
  ): void => {
    if (typeof onChange === "function") {
      onChange(event, newValue, reason);
    }

    setVal(newValue);
    setError(!validateInput(newValue));
  };

  const onBlurWrapper = (value: string): void => {
    if (freeSolo) {
      setError(!validateInput(value as T));
    }
  };

  useEffect(() => {
    onChangeWrapper(null, value, null);
  }, [value]);

  return (
    <Grid md={gridWidth || 6} xs={12} item>
      <StyledFormControl fullWidth error={error}>
        <StyledFormLabel htmlFor={id}>
          {label}
          {required ? <StyledAsterisk>*</StyledAsterisk> : ""}
        </StyledFormLabel>
        <StyledAutocomplete
          value={val}
          onChange={onChangeWrapper}
          onBlur={(event: React.FocusEvent<HTMLInputElement>) => onBlurWrapper(event.target.value)}
          options={options}
          forcePopupIcon
          popupIcon={<DropdownArrowsIconSvg />}
          freeSolo={freeSolo}
          slotProps={{
            popper: {
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
          renderInput={(params) => (
            <TextField
              {...params}
              ref={inputRef}
              name={name}
              required={required}
              placeholder={placeholder}
            />
          )}
          {...rest}
        />
        <StyledFormHelperText>{error ? helperText : " "}</StyledFormHelperText>
      </StyledFormControl>
    </Grid>
  );
};

export default AutocompleteInput;
