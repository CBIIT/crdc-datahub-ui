import {
  FormControl,
  FormGroup,
  FormHelperText,
  Grid,
  styled,
} from "@mui/material";
import { FC, useEffect, useId, useState } from "react";
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

type Props = {
  label: string;
  value: string[];
  name: string;
  options: SectionItemContentOption[];
  required?: boolean;
  orientation?: "vertical" | "horizontal";
  helpText?: string;
  tooltipText?: string;
  gridWidth?: 2 | 4 | 6 | 8 | 10 | 12;
  onChange?: (values: string[]) => void;
};

const FormGroupCheckbox: FC<Props> = ({
  label,
  value,
  name,
  options,
  required = false,
  orientation = "vertical",
  helpText,
  tooltipText,
  gridWidth,
  onChange
}) => {
  const id = useId();

  const [val, setVal] = useState(value ?? []);
  const [error] = useState(false);
  const helperText = helpText || (required ? "This field is required" : " ");

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

  return (
    <Grid md={gridWidth || 6} xs={12} item>
      <FormControl fullWidth error={error}>
        <StyledFormLabel htmlFor={id}>
          {label}
          {required ? <StyledAsterisk>*</StyledAsterisk> : ""}
          {tooltipText && <Tooltip title={tooltipText} />}
        </StyledFormLabel>
        <FormGroup row={orientation === "horizontal"}>
          {options.map((option) => {
            const isChecked = val?.includes(option.value);

            return (
              <CheckboxInput
                key={option.value}
                name={option.name ?? name} // prioritizes option name over parent name
                checked={isChecked}
                value={option.value}
                inputLabel={option.label}
                inputLabelTooltipText={option.tooltipText}
                errorText={option.errorText}
                onChange={handleChange}
                data-type="boolean" // TODO: FIX TYPE
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
              onChange={() => {}}
              checked
              hidden
            />
          );
        })}
        <FormHelperText>{error ? helperText : " "}</FormHelperText>
      </FormControl>
    </Grid>
  );
};

export default FormGroupCheckbox;
