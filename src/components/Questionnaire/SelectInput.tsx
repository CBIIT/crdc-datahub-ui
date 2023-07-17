import React, { FC, useEffect, useId, useState } from "react";
import {
  FormControl,
  FormHelperText,
  Grid,
  MenuItem,
  Select,
  SelectProps,
  styled,
} from "@mui/material";
import dropdownArrowsIcon from "../../assets/icons/dropdown_arrows.svg";
import useFormMode from "../../content/questionnaire/sections/hooks/useFormMode";

const DropdownArrowsIcon = styled("div")(() => ({
  backgroundImage: `url(${dropdownArrowsIcon})`,
  backgroundSize: "contain",
  backgroundRepeat: "no-repeat",
  width: "10px",
  height: "18px",
}));

const GridItem = styled(Grid)(() => ({
  "& .MuiFormHelperText-root.Mui-error": {
    color: "#D54309 !important",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderRadius: "8px",
    borderColor: "#6B7294",
    padding: "0 12px"
  },
  "&.Mui-error fieldset": {
    borderColor: "#D54309 !important",
  },
  "& .MuiSelect-icon": {
    right: "12px"
  },
  "& .MuiSelect-iconOpen": {
    transform: "none"
  },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
    border: "1px solid #209D7D !important",
    boxShadow: "2px 2px 4px 0px rgba(38, 184, 147, 0.10), -1px -1px 6px 0px rgba(38, 184, 147, 0.20)",
  },
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

const ProxySelect = styled("select")(() => ({
  display: "none"
}));

const StyledSelect = styled(Select, {
  shouldForwardProp: (prop) => prop !== "placeholderText"
})<SelectProps & { placeholderText: string; }>((props) => ({
  "& .MuiSelect-select .notranslate::after": {
    // content: `'${(props) => props.placeholderText || "none"}'`,
    content: `'${props.placeholderText ?? "Select"}'`,
    color: "#929296",
    fontWeight: 400,
    opacity: 1
  },
  "& .MuiPaper-root": {
    borderRadius: "8px",
    border: "1px solid #6B7294",
    marginTop: "2px",
    "& .MuiList-root": {
      padding: 0,
      overflow: "auto",
      maxHeight: "40vh"
    },
    "& .MuiMenuItem-root": {
      padding: "0 10px",
      height: "35px",
      color: "#083A50",
      background: "#FFFFFF"
    },
    "& .MuiMenuItem-root.Mui-selected": {
      backgroundColor: "#5E6787",
      color: "#FFFFFF",
    },
    "& .MuiMenuItem-root:hover": {
      background: "#5E6787",
      color: "#FFFFFF"
    },
    "& .MuiMenuItem-root.Mui-focused": {
      backgroundColor: "#5E6787 !important",
      color: "#FFFFFF"
    },
  },
  "& .MuiInputBase-input": {
    backgroundColor: "#fff",
    color: "#083A50 !important",
    fontWeight: 400,
    fontSize: "16px",
    fontFamily: "'Nunito', 'Rubik', sans-serif",
    lineHeight: "19.6px",
    padding: "12px",
    height: "20px !important",
    minHeight: "20px !important",
    "&::placeholder": {
      color: "#929296",
      fontWeight: 400,
      opacity: 1
    },
  },
  // Target readOnly <input> inputs
  "& .MuiOutlinedInput-input:read-only": {
    backgroundColor: "#D9DEE4",
    cursor: "not-allowed",
    borderRadius: "8px",
  },
}));

type Props = {
  value: string | string[];
  options: { label: string; value: string | number }[];
  name: string;
  label: string;
  required?: boolean;
  helpText?: string;
  gridWidth?: 2 | 4 | 6 | 8 | 10 | 12;
  onChange?: (value: string) => void;
} & SelectProps;

/**
 * Generates a generic select box with a label and help text
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const SelectInput: FC<Props> = ({
  value,
  name,
  label,
  options,
  required = false,
  helpText,
  gridWidth,
  onChange,
  multiple,
  placeholder,
  readOnly,
  ...rest
}) => {
  const id = useId();
  const { readOnlyInputs } = useFormMode();

  const [val, setVal] = useState(multiple ? [] : "");
  const [error] = useState(false);
  const helperText = helpText || (required ? "This field is required" : " ");

  const validateInput = (input: string | string[]) => {
    const inputIsArray = Array.isArray(input);
    if (multiple && !inputIsArray) {
      return false;
    }

    if (inputIsArray) {
      const containsOnlyValidOptions = input.every((value: string) => !!options.find((option) => option.value === value));
      return containsOnlyValidOptions;
    }
    const isValidOption = !!options.find((option) => option.value === input);
    return isValidOption;
  };

  const getValidInitialValue = (input: string | string[]) => {
    const validInitialValue = multiple ? [] : "";

    return validateInput(input) ? input : validInitialValue;
  };

  const onChangeWrapper = (newVal) => {
    if (typeof onChange === "function") {
      onChange(newVal);
    }

    setVal(newVal);
  };

  useEffect(() => {
    onChangeWrapper(getValidInitialValue(value));
  }, [value]);

  return (
    <GridItem md={gridWidth || 6} xs={12} item>
      <FormControl fullWidth error={error}>
        <StyledFormLabel htmlFor={id}>
          {label}
          {required ? <StyledAsterisk>*</StyledAsterisk> : ""}
        </StyledFormLabel>
        <StyledSelect
          size="small"
          value={val}
          onChange={(e) => onChangeWrapper(e.target.value)}
          required={required}
          IconComponent={DropdownArrowsIcon}
          MenuProps={{ disablePortal: true }}
          slotProps={{ input: { id } }}
          multiple={multiple}
          placeholderText={placeholder}
          readOnly={readOnlyInputs || readOnly}
          {...rest}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </StyledSelect>

        {/* Proxy select for the form parser to correctly parse data if multiple attribute is on */}
        <ProxySelect
          name={name}
          value={val}
          onChange={() => {}}
          multiple={multiple}
          hidden
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} aria-label={`${option.value}`} />
          ))}
        </ProxySelect>
        <FormHelperText>{error ? helperText : " "}</FormHelperText>
      </FormControl>
    </GridItem>
  );
};

export default SelectInput;
