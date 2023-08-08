import React, { FC, useState, useRef, useEffect } from 'react';
import { Grid, FormControl, FormControlLabel, Radio, RadioGroup, RadioProps, RadioGroupProps, FormHelperText } from '@mui/material';
import styled from "styled-components";
import { updateInputValidity } from '../../utils';

const GridStyled = styled(Grid)<{ $containerWidth?: string; }>`
  width: ${(props) => props.$containerWidth};
  .formControl{
    margin-top: 6px;
    margin-bottom: 8px;
  }
  .css-hsm3ra-MuiFormLabel-root {
    color: rgba(0, 0, 0, 0.6) !important;
  }
  .MuiRadio-root{
    color: #1D91AB !important;
    margin-left: 10px;
  }

  #invisibleRadioInput{
    height: 0;
    border: none;
    width: 0;
  }
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
`;

const BpIcon = styled('span')(() => ({
  borderRadius: '50%',
  width: 24,
  height: 24,
  outline: '6px auto #1D91AB',
  'input:hover ~ &': {
    outlineOffset: "2px",
  },
}));

const BpCheckedIcon = styled(BpIcon)({
  backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))',
  '&:before': {
    borderRadius: "50%",
    display: 'block',
    marginTop: "4px",
    marginLeft: "4px",
    width: 16,
    height: 16,
    backgroundImage: 'radial-gradient(#1D91AB, #1D91AB)',
    content: '""',
  },
});

const StyledFormLabel = styled("label")(() => ({
  fontWeight: 700,
  fontSize: "16px",
  lineHeight: "19.6px",
  minHeight: "20px",
  color: "#083A50",
  marginBottom: "4px",
}));

const StyledAsterisk = styled("span")(() => ({
  marginRight: "4px",
  color: "#D54309",
}));

const StyledRadio = styled(Radio)((props) => ({
  "& input": {
    cursor: props.readOnly ? "not-allowed" : "initial",
  },
  "& .radio-icon": {
    backgroundColor: props.readOnly ? "#D9DEE4 !important" : "initial",
  }
}));

// Inspired by blueprintjs
const BpRadio = (props: RadioProps) => (
  <StyledRadio
    disableRipple
    color="default"
    checkedIcon={<BpCheckedIcon className="radio-icon" />}
    icon={<BpIcon className="radio-icon" />}
    inputProps={{
        "data-type": "auto"
      } as unknown}
    {...props}
  />
);

type Props = {
  label: string;
  name: string;
  containerWidth?: string;
  value: string | boolean;
  id: string;
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
  id,
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

  return (
    <GridStyled md={gridWidth || 6} xs={12} item $containerWidth={containerWidth}>
      <FormControl className="formControl" error={error}>
        <StyledFormLabel>
          {required ? <StyledAsterisk>*</StyledAsterisk> : ""}
          {label}
        </StyledFormLabel>
        <RadioGroup
          name={name}
          value={val}
          onChange={onChangeWrapper}
          id={id}
          data-type="string"
          {...rest}
        >
          <FormControlLabel value="true" color="#1D91AB" control={<BpRadio inputRef={radioGroupInputRef} id={id.concat("-yes-radio-button")} readOnly={readOnly} />} label="Yes" />
          <FormControlLabel value="false" color="#1D91AB" control={<BpRadio id={id.concat("-no-radio-button")} readOnly={readOnly} />} label="No" />
        </RadioGroup>
        <FormHelperText>
          {(!readOnly && error ? "This field is required" : null) || " "}
        </FormHelperText>
      </FormControl>
    </GridStyled>
  );
};

export default RadioYesNoInput;
