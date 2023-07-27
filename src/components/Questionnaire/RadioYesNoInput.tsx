import React, { FC, useState, useRef, useEffect } from 'react';
import { Grid, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, RadioProps } from '@mui/material';
import styled from "styled-components";
import { updateInputValidity } from '../../utils';

const GridStyled = styled(Grid)<{ $containerWidth?: string; }>`
  width: ${(props) => props.$containerWidth};
  .formControl{
    margin-left: 10px;
    margin-top: 6px;
    margin-bottom: 8px;
  }
  .css-hsm3ra-MuiFormLabel-root {
    color: rgba(0, 0, 0, 0.6) !important;
  }
  .MuiRadio-root{
    color: #275D89 !important;
  }

  #invisibleRadioInput{
    height: 0; 
    border: none; 
    width: 0;
  }
`;

type Props = {
  title: string;
  name: string;
  gridWidth?: 2 | 4 | 6 | 8 | 10 | 12;
  containerWidth?: string;
  value: string;
};

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

// Inspired by blueprintjs
function BpRadio(props: RadioProps) {
  return (
    <Radio
      disableRipple
      color="default"
      checkedIcon={<BpCheckedIcon />}
      icon={<BpIcon />}
      {...props}
    />
  );
}

const RadioYesNoInput: FC<Props> = ({
  title,
  name,
  gridWidth,
  containerWidth,
  value,
}) => {
  const [statevalue, setValue] = useState(value);
  const radioGroupInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value);
  };
  useEffect(() => {
    if (statevalue === "") {
      updateInputValidity(radioGroupInputRef, "Please select an option");
    } else {
      updateInputValidity(radioGroupInputRef);
    }
  }, [statevalue]);

  return (
    <GridStyled md={gridWidth || 6} xs={12} item $containerWidth={containerWidth}>
      <FormControl className="formControl">
        <FormLabel id="demo-controlled-radio-buttons-group">{title}</FormLabel>
        <RadioGroup
          name={name}
          value={statevalue}
          onChange={handleChange}
        >
          <FormControlLabel value="true" color="#275D89" control={<BpRadio inputRef={radioGroupInputRef} />} label="Yes" />
          <FormControlLabel value="false" color="#275D89" control={<BpRadio />} label="No" />
        </RadioGroup>
      </FormControl>
    </GridStyled>
  );
};

export default RadioYesNoInput;
