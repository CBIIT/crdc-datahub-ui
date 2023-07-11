import React, { FC, ReactElement, useEffect, useId, useMemo, useRef, useState } from 'react';
import { SwitchProps, Grid, Switch, FormHelperText } from '@mui/material';
import styled from "styled-components";
import Tooltip from "./Tooltip";
import { updateInputValidity } from '../../utils';

const GridStyled = styled(Grid)`
  // Customize the root class
  .switchRoot {
    width: 65px;
    height: 35px;
    padding: 0;
  }
  // Customize the switchBase class
  .switchBase {
    padding-top: 5px;
    padding-left: 7px;
   }
  // Customize the thumb class
  .thumb {
    color: #1D91AB;
    width: 25px;
    height: 25px;
    box-shadow: none;
  }
  .MuiSwitch-switchBase.Mui-checked{
    transform: translateX(26px);
  }
  // Customize the track class
  .track {
    border-radius: 60px;
    background-color: #FFFFFF;
    border: 1px solid #DBDBDB;
    opacity: 1;
  }
  .MuiSwitch-track{
    background-color: white !important;
  }
  .text {
    display: inline;
    font-family: Lato;
    font-style: normal;
    font-weight: 600;
    font-size: 16px;
    line-height: 22px;
    color: #89A2A7;
    margin-left: 6px;
    margin-right: 6px;
  }
  .textChecked {
    display: inline;
    font-family: Lato;
    font-style: normal;
    font-weight: 600;
    font-size: 16px;
    line-height: 22px;
    color: #4E5F63;
    margin-left: 6px;
    margin-right: 6px;
  }
  .input {
    display: none;
  }
  .container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    font-size: 16px;
    font-family: Nunito;
    font-weight: 700;
    line-height: 19.6px;
    min-height: 20px;
  }
  .asterisk {
    color: #D54309;
    margin-left: 6px;
  }
  .labelContainer {
    display: flex;
    align-items: center;
    height: 20px;
  }
  .switchYesNoContainer {
    display: flex;
    align-items: center;
    margin-right: 32px;
  }
  .tooltip {
    align-self: start;
  }
  .errorMessage {
    color: #D54309 !important;
    margin-top: 0;
    min-height: 20px;
    width: 100%;
  }
`;

type Props = {
  label: string,
  name: string,
  tooltipText?: string;
  required?: boolean;
  gridWidth?: 2 | 4 | 6 | 8 | 10 | 12;
  errorText?: string;
  value: boolean;
  toggleContent?: ReactElement;
  isBoolean? : boolean;
  touchRequired?: boolean;
  graphQLValue?: string;
} & Omit<SwitchProps, "color">;

const CustomSwitch: FC<Props> = ({
  classes,
  label,
  required,
  value,
  name,
  tooltipText,
  gridWidth,
  errorText,
  toggleContent,
  graphQLValue = "",
  isBoolean = false,
  touchRequired,
  ...rest
}) => {
  const id = useId();
  const [val, setVal] = useState<boolean | null>(value || false);
  const [touched, setTouched] = useState(value?.toString()?.length > 0);
  const [error, setError] = useState(false);

  const errorMsg = errorText || (required ? "This field is required" : null);
  const switchInputRef = useRef<HTMLInputElement>(null);
  const proxyValue = useMemo(() => {
    if (isBoolean) {
      return touchRequired && !touched ? undefined : val?.toString();
    }
    return val ? graphQLValue : "";
  }, [isBoolean, val, graphQLValue, touched, touchRequired]);

  // Validation if touch is required
  useEffect(() => {
    if (!touchRequired) {
      return;
    }
    if (!touched) {
      updateInputValidity(switchInputRef, errorMsg);
      setError(true);
      return;
    }
    updateInputValidity(switchInputRef);
    setError(false);
  }, [touched, touchRequired]);

  const onChangeWrapper = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    if (!touched) {
      setTouched(true);
    }

    setVal(checked);
  };

  return (
    <GridStyled md={gridWidth || 6} xs={12} item>
      <div className="container" style={{ flexWrap: "wrap" }}>
        <div className="labelContainer">
          {label}
          {required ? <span className="asterisk">*</span> : ""}
          {tooltipText && <Tooltip placement="right" className="tooltip" title={tooltipText} />}
        </div>
        <div className="switchYesNoContainer">
          <div className={val ? "text" : "textChecked"}>No</div>
          <Switch
            inputRef={switchInputRef}
            inputProps={{ datatype: "boolean" }}
            focusVisibleClassName="focusVisible"
            id={id}
            checked={val}
            onChange={onChangeWrapper}
            classes={{
              root: "switchRoot",
              switchBase: "switchBase",
              thumb: "thumb",
              track: "track",
              checked: "checked",
            }}
            {...rest}
          />
          {/* To satisfy the form parser. The mui switch value is not good for the form parser */}
          {/* eslint-disable-next-line no-nested-ternary */}
          <input
            onChange={() => {}}
            className="input"
            name={name}
            type="checkbox"
            data-type={isBoolean ? "boolean" : "auto"}
            value={proxyValue}
            checked
          />
          <div className={val ? "textChecked" : "text"}>Yes</div>
        </div>
        <FormHelperText className="errorMessage">{error ? errorMsg : " "}</FormHelperText>
      </div>
      {val ? toggleContent : <div />}
    </GridStyled>
  );
};

export default CustomSwitch;
