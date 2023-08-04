import React, { FC, useState, useRef, useEffect } from 'react';
import { Grid, FormControl, FormControlLabel, Radio, RadioGroup, RadioProps, RadioGroupProps } from '@mui/material';
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
    color: #275D89 !important;
    margin-left: 10px;
  }

  #invisibleRadioInput{
    height: 0; 
    border: none; 
    width: 0;
  }
`;

const BpIcon = styled('span')(() => ({
  borderRadius: '50%',
  width: 24,
  height: 24,
  outline: '6px auto #275D89',
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
    backgroundImage: 'radial-gradient(#275D89, #275D89)',
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
  const radioGroupInputRef = useRef<HTMLInputElement>(null);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) {
      return;
    }
    const newValue = (event.target as HTMLInputElement).value;
    setVal(newValue === "" ? null : newValue);
  };
  useEffect(() => {
    if (required && val === null) {
          updateInputValidity(radioGroupInputRef, "Please select an option");
        } else {
          updateInputValidity(radioGroupInputRef);
        }
  }, [val]);

  return (
    <GridStyled md={gridWidth || 6} xs={12} item $containerWidth={containerWidth}>
      <FormControl className="formControl">
        <StyledFormLabel>
          {required ? <StyledAsterisk>*</StyledAsterisk> : ""}
          {label}
        </StyledFormLabel>
        <RadioGroup
          name={name}
          value={val}
          onChange={handleChange}
          id={id}
          data-type="string"
          {...rest}
        >
          <FormControlLabel value="true" color="#275D89" control={<BpRadio inputRef={radioGroupInputRef} id={id.concat("-yes-radio-button")} readOnly={readOnly} />} label="Yes" />
          <FormControlLabel value="false" color="#275D89" control={<BpRadio id={id.concat("-no-radio-button")} readOnly={readOnly} />} label="No" />
        </RadioGroup>
      </FormControl>
    </GridStyled>
  );
};

export default RadioYesNoInput;
