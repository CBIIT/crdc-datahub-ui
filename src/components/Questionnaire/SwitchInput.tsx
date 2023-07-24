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
  .readOnly .MuiSwitch-track {
    background-color: #D9DEE4 !important;
  }
  .readOnly .MuiSwitch-input {
    cursor: not-allowed;
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
    min-height: 50px;
  }
  .tooltip {
    align-self: start;
  }
  .errorMessage {
    color: #D54309 !important;
    margin-top: 44px;
    margin-left: 8px;
    min-height: 20px;
    width: fit-content;
    position: absolute;
  }
  .switchErrorContainer {
    display: flex;
    flex-direction: column;
  }
`;
const Container = styled.div<{ $containerWidth?: string; }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-family: Nunito;
  font-weight: 700;
  line-height: 19.6px;
  min-height: 50px;
  flex-wrap: wrap;
  width: ${(props) => props.$containerWidth};
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
  isBoolean?: boolean;
  touchRequired?: boolean;
  graphQLValue?: string;
  containerWidth?: string;
} & Omit<SwitchProps, "color">;

const CustomSwitch: FC<Props> = ({
  classes,
  label,
  required,
  value,
  onChange,
  name,
  tooltipText,
  gridWidth,
  errorText,
  toggleContent,
  graphQLValue = "",
  isBoolean = false,
  containerWidth = "auto",
  touchRequired,
  readOnly,
  ...rest
}) => {
  const id = useId();

  const [val, setVal] = useState<boolean | null>(value);
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
    if (!touchRequired || readOnly) {
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
    if (readOnly) {
      return;
    }
    if (typeof onChange === "function") {
      onChange(event, checked);
    }
    if (!touched) {
      setTouched(true);
    }

    setVal(checked);
  };

  return (
    <GridStyled md={gridWidth || 6} xs={12} item>
      <Container $containerWidth={containerWidth}>
        <div className="labelContainer">
          {label}
          {required ? <span className="asterisk">*</span> : ""}
          {tooltipText && <Tooltip placement="right" className="tooltip" title={tooltipText} />}
        </div>
        <div className="switchErrorContainer">
          <div className="switchYesNoContainer">
            <div className={val ? "text" : "textChecked"}>No</div>
            <Switch
              inputRef={switchInputRef}
              inputProps={{ datatype: "boolean" }}
              focusVisibleClassName="focusVisible"
              id={id}
              checked={val || false}
              onChange={onChangeWrapper}
              readOnly={readOnly}
              disableRipple
              className={readOnly ? "readOnly" : ""}
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
            <input
              onChange={() => { }}
              className="input"
              name={name}
              type="checkbox"
              data-type={isBoolean ? "boolean" : "auto"}
              value={proxyValue}
              checked
            />
            <div className={val ? "textChecked" : "text"}>Yes</div>
          </div>
          <FormHelperText className="errorMessage">{!readOnly && error ? errorMsg : " "}</FormHelperText>
        </div>
      </Container>
      {val ? toggleContent : <div />}
    </GridStyled>
  );
};

export default CustomSwitch;
