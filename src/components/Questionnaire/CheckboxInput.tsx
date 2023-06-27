import React, { ChangeEvent, FC, useEffect, useId, useState } from "react";
import {
  Checkbox,
  CheckboxProps,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  styled,
} from "@mui/material";
import Tooltip from "./Tooltip";
import checkboxUncheckedIcon from "../../assets/icons/checkbox_unchecked.svg";
import checkboxCheckedIcon from "../../assets/icons/checkbox_checked.svg";

const UncheckedIcon = styled("div")(() => ({
  backgroundImage: `url(${checkboxUncheckedIcon})`,
  backgroundSize: "auto",
  backgroundRepeat: "no-repeat",
  width: "24px",
  height: "24px",
}));

const CheckedIcon = styled("div")(() => ({
  backgroundImage: `url(${checkboxCheckedIcon})`,
  backgroundSize: "auto",
  backgroundRepeat: "no-repeat",
  width: "24px",
  height: "24px",
}));

const GridItem = styled(Grid)(() => ({
  "& .MuiFormHelperText-root.Mui-error": {
    color: "#D54309 !important",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderRadius: "8px",
    borderColor: "#6B7294",
    padding: "0 12px",
  },
  "&.Mui-error fieldset": {
    borderColor: "#D54309 !important",
  },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
    border: "1px solid #209D7D !important",
    boxShadow:
      "2px 2px 4px 0px rgba(38, 184, 147, 0.10), -1px -1px 6px 0px rgba(38, 184, 147, 0.20)",
  },
}));

const StyledFormControl = styled(FormControl)(() => ({
  width: "auto",
  display: "inline-block"
}));

const StyledAsterisk = styled("span")(() => ({
  color: "#D54309",
  marginLeft: "6px",
}));

const StyledFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
  width: "fit-content",
  pointerEvents: "none",
  marginLeft: "-10px",
  marginRight: "30px",
  "& .MuiButtonBase-root ": {
    pointerEvents: "all",
  },
  "& .MuiFormControlLabel-label": {
    fontWeight: 700,
    fontSize: "16px",
    lineHeight: "19.6px",
    minHeight: "20px",
    color: "#083A50",
    [theme.breakpoints.up("lg")]: {
      whiteSpace: "nowrap",
    },
  },
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

const StyledCheckbox = styled(Checkbox)(() => ({
  "&.MuiCheckbox-root": {
    padding: "10px",
  },
  "& .MuiSvgIcon-root": {
    fontSize: "24px",
  },
}));

type Props = {
  value: string;
  name: string;
  label?: string;
  inputLabel: string;
  errorText?: string;
  tooltipText?: string;
  inputLabelTooltipText?: string;
  required?: boolean;
  helpText?: string;
  onChange?: (value: string, checked: boolean) => void;
} & Omit<CheckboxProps, "onChange">;

const CheckboxInput: FC<Props> = ({
  value,
  label,
  inputLabel,
  name,
  required = false,
  helpText,
  tooltipText,
  inputLabelTooltipText,
  errorText,
  onChange,
  ...rest
}) => {
  const id = useId();

  const [val, setVal] = useState(value);
  const [error] = useState(false);
  const helperText = helpText || (required ? "This field is required" : " ");

  const onChangeWrapper = (newVal: string, checked: boolean) => {
    if (typeof onChange === "function") {
      onChange(newVal, checked);
    }

    setVal(newVal);
  };

  return (
    <StyledFormControl fullWidth error={error}>
      {(label || required || tooltipText) && (
      <StyledFormLabel htmlFor={id}>
        {label}
        {required ? <StyledAsterisk>*</StyledAsterisk> : ""}
        {tooltipText && <Tooltip title={tooltipText} />}
      </StyledFormLabel>
        )}
      <StyledFormControlLabel
        value={val}
        control={(
          <StyledCheckbox
            name={name}
            icon={<UncheckedIcon />}
            checkedIcon={<CheckedIcon />}
            onChange={(e, checked) => onChangeWrapper(e.target.value, checked)}
            disableRipple
            {...rest}
          />
          )}
        label={(
          <>
            {inputLabel}
            {inputLabelTooltipText && (
            <Tooltip title={inputLabelTooltipText} />
              )}
          </>
          )}
        labelPlacement="end"
      />
      {error && <FormHelperText>{error ? helperText : " "}</FormHelperText>}
    </StyledFormControl>
  );
};

export default CheckboxInput;
