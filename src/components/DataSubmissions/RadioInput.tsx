import React, { FC, useState, useRef, useEffect } from 'react';
import { Grid, FormControl, FormControlLabel, RadioGroup, RadioGroupProps, FormHelperText, Stack } from '@mui/material';
import styled from "styled-components";
import { updateInputValidity } from '../../utils';
import StyledRadioButton from '../Questionnaire/StyledRadioButton';

const GridStyled = styled(Grid)<{ $containerWidth?: string; }>`
  width: ${(props) => props.$containerWidth};
  .formControl{
    margin-top: 8px;
    margin-bottom: 4px;
  }
  .css-hsm3ra-MuiFormLabel-root {
    color: rgba(0, 0, 0, 0.6) !important;
  }
  .MuiRadio-root {
    color: #1D91AB !important;
    margin-left: 10px;
    padding-right: 7px;
  }
  #invisibleRadioInput {
    height: 0;
    border: none;
    width: 0;
  }
  .MuiFormHelperText-root {
    color: #083A50;
    margin-left: 0;
  }
  .MuiFormHelperText-root.Mui-error {
    color: #D54309 !important;
  }
  .displayNone {
    display: none !important;
  }
`;

const StyledFormLabel = styled("label")(() => ({
  fontWeight: 700,
  fontSize: "16px",
  lineHeight: "19.6px",
  minHeight: "20px",
  color: "#083A50",
}));

const StyledAsterisk = styled("span")(() => ({
  marginRight: "2px",
  color: "#D54309",
}));

const StyledFormControlLabel = styled(FormControlLabel)(() => ({
  "&.MuiFormControlLabel-root": {
    paddingRight: "10px",
    marginRight: "2px"
  },
  "& .MuiFormControlLabel-label": {
    color: "#083A50",
    fontFamily: "'Nunito'",
    fontSize: "16px",
    fontStyle: "normal",
    fontWeight: 500,
    lineHeight: "19.6px",
  }
}));

type Option = {
  label: string;
  value: string;
  disabled?: boolean;
};

type Props = {
  label: string;
  name?: string;
  containerWidth?: string;
  value: string | boolean;
  options: Option[];
  id: string;
  inline?: boolean;
  helpText?: string;
  required?: boolean;
  readOnly?: boolean;
  gridWidth?: 2 | 4 | 6 | 8 | 10 | 12;
} & RadioGroupProps;

const RadioYesNoInput: FC<Props> = ({
  label,
  name,
  gridWidth,
  containerWidth,
  value,
  options,
  id,
  inline,
  helpText,
  required,
  readOnly,
  ...rest
}) => {
  const [val, setVal] = useState<string>((value?.toString() === "" || value?.toString() === undefined) ? null : value?.toString());
  const [error, setError] = useState(false);
  const radioGroupInputRef = useRef<HTMLInputElement>(null);

  const onChangeWrapper = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) {
      return;
    }
    const newValue = (event.target as HTMLInputElement).value;
    setVal(newValue === "" ? null : newValue);
    setError(false);
  };

  useEffect(() => {
    if (required && val === null) {
      updateInputValidity(radioGroupInputRef, "Please select an option");
    } else {
      updateInputValidity(radioGroupInputRef);
    }
  }, [val]);

  useEffect(() => {
    const invalid = () => setError(true);

    radioGroupInputRef.current?.addEventListener("invalid", invalid);
    return () => {
      radioGroupInputRef.current?.removeEventListener("invalid", invalid);
    };
  }, [radioGroupInputRef]);

  useEffect(() => {
    setVal(value?.toString() ?? null);
  }, [value]);

  return (
    <GridStyled md={gridWidth || 6} xs={12} item $containerWidth={containerWidth}>
      <FormControl className="formControl" error={error}>
        <Stack direction={inline ? "row" : "column"} alignItems={inline ? "center" : "initial"}>
          <StyledFormLabel>
            {label}
            {required ? <StyledAsterisk>*</StyledAsterisk> : ""}
          </StyledFormLabel>
          <RadioGroup
            name={name}
            value={val}
            onChange={onChangeWrapper}
            id={id}
            data-type="string"
            {...rest}
          >
            {options?.map((option: Option, idx: number) => {
              const isFirstOption = idx === 0;

              return (
                <StyledFormControlLabel
                  key={`${option.label}-${option.value}}`}
                  value={option.value}
                  label={option.label}
                  color="#1D91AB"
                  control={(
                    <StyledRadioButton
                      id={id.concat(`-${option.label}-radio-button`)}
                      readOnly={readOnly || option.disabled}
                      disabled={option.disabled}
                      {...(isFirstOption && { inputRef: radioGroupInputRef })}
                    />
                  )}
                />
              );
            })}
          </RadioGroup>
        </Stack>
        <FormHelperText className={(!readOnly && error ? "" : "displayNone") || ""}>
          {(!readOnly && error ? "This field is required" : null) || " "}
        </FormHelperText>
      </FormControl>
    </GridStyled>
  );
};

export default RadioYesNoInput;
