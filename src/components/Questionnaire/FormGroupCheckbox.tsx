import {
  FormControl,
  FormGroup,
  FormHelperText,
  Grid,
  styled,
} from "@mui/material";
import { FC, useEffect, useId, useRef, useState } from "react";
import Tooltip from "./Tooltip";
import CheckboxInput from "./CheckboxInput";

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

const StyledAsterisk = styled("span")(() => ({
  color: "#D54309",
  marginLeft: "6px",
}));

const StyledFormHelperText = styled(FormHelperText)(() => ({
  marginLeft: 0,
}));

export type FormGroupCheckboxOption = {
  label: string;
  value: string;
  name?: string; // overrides parent name in checkboxes
  tooltipText?: string;
  errorText?: string;
  required?: boolean;
};

type Props = {
  idPrefix?: string;
  label?: string | JSX.Element;
  hideLabel?: boolean;
  value: string[];
  name?: string;
  options: FormGroupCheckboxOption[];
  required?: boolean; // at least one checkbox needs to be checked
  allowMultipleChecked?: boolean;
  orientation?: "vertical" | "horizontal";
  helpText?: string;
  tooltipText?: string;
  gridWidth?: 2 | 4 | 6 | 8 | 10 | 12;
  readOnly?: boolean;
  onChange?: (values: string[]) => void;
};

const FormGroupCheckbox: FC<Props> = ({
  idPrefix = "",
  label,
  hideLabel,
  value,
  name,
  options,
  required = false,
  allowMultipleChecked = true,
  orientation = "vertical",
  helpText,
  tooltipText,
  gridWidth,
  readOnly,
  onChange,
}) => {
  const id = useId();

  const [val, setVal] = useState(value ?? []);
  const [error, setError] = useState(false);
  const helperText = helpText
    || (required && !val?.length && "This field is required")
    || (!allowMultipleChecked && val?.length > 1
      ? "Please select only one option"
      : " ");
  const firstCheckboxInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (selectedValue: string, checked: boolean) => {
    const currentVal = val || [];
    const updatedValues = checked
      ? [...currentVal, selectedValue]
      : currentVal?.filter((v) => v !== selectedValue);

    onChangeWrapper(updatedValues);
  };

  const onChangeWrapper = (newVal: string[]) => {
    if (typeof onChange === "function") {
      onChange(newVal);
    }

    setVal(newVal);
  };

  useEffect(() => {
    if (value) {
      onChangeWrapper(value);
    }
  }, [value]);

  useEffect(() => {
    const notSelectedAndRequired = required && !val?.length;
    const multipleChecked = val?.length > 1;

    if (notSelectedAndRequired) {
      firstCheckboxInputRef?.current.setCustomValidity(
        "Please select at least one option"
      );
      setError(true);
      return;
    }

    if (!allowMultipleChecked && multipleChecked) {
      firstCheckboxInputRef?.current.setCustomValidity(
        "Please select only one option"
      );
      setError(true);
      return;
    }

    firstCheckboxInputRef?.current.setCustomValidity("");
    setError(false);
  }, [val]);

  return (
    <Grid md={gridWidth || 6} xs={12} item>
      <FormControl fullWidth error={error}>
        {!hideLabel && (
          <StyledFormLabel htmlFor={id}>
            {label}
            {required ? <StyledAsterisk>*</StyledAsterisk> : ""}
            {tooltipText && <Tooltip title={tooltipText} />}
          </StyledFormLabel>
        )}
        <FormGroup row={orientation === "horizontal"}>
          {options.map((option, index) => {
            const isChecked = val?.includes(option.value);
            return (
              <CheckboxInput
                id={idPrefix.concat(`-${option.label.toLowerCase().replace(" ", "-")}-checkbox`)}
                key={option.value}
                name={name}
                checked={isChecked}
                value={option.value}
                inputLabel={option.label}
                inputLabelTooltipText={option.tooltipText}
                errorText={option.errorText}
                onChange={handleChange}
                readOnly={readOnly}
                inputRef={(ref) => {
                  if (index === 0) {
                    firstCheckboxInputRef.current = ref;
                  }
                }}
              />
            );
          })}
        </FormGroup>

        {/* NOTE: This is a proxy element for form parsing purposes.
          Also, if parent has shared name then it will use string[] as value,
          otherwise value will be of type boolean for the form parser */}
        {!name && options.map((option) => {
          const isChecked = val?.includes(option.value);
          return (
            <input
              key={option.value}
              name={option.name}
              type="checkbox"
              data-type="boolean"
              value={isChecked ? "true" : "false"}
              onChange={() => { }}
              checked
              hidden
            />
          );
        })}
        <StyledFormHelperText>{error ? helperText : " "}</StyledFormHelperText>
      </FormControl>
    </Grid>
  );
};

export default FormGroupCheckbox;
