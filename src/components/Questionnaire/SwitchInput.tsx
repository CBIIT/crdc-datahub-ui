import React, {
  FC,
  HTMLProps,
  ReactElement,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  SwitchProps,
  Grid,
  Switch,
  FormHelperText,
  styled,
} from "@mui/material";
import Tooltip from "../Tooltip";
import { updateInputValidity } from "../../utils";

const GridStyled = styled(Grid)({
  "& .switchRoot": {
    width: "65px",
    height: "35px",
    padding: 0,
  },
  "& .switchBase": {
    paddingTop: "5px",
    paddingLeft: "7px",
  },
  "& .thumb": {
    color: "#1D91AB",
    width: "25px",
    height: "25px",
    boxShadow: "none",
  },
  "& .MuiSwitch-switchBase.Mui-checked": {
    transform: "translateX(26px)",
  },
  "& .track": {
    borderRadius: "60px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #DBDBDB",
    opacity: 1,
  },
  "& .MuiSwitch-track": {
    backgroundColor: "white !important",
  },
  "& .readOnly .MuiSwitch-track": {
    backgroundColor: "#E5EEF4 !important",
  },
  "& .readOnly .MuiSwitch-input": {
    cursor: "not-allowed",
  },
  "& .text": {
    display: "inline",
    fontFamily: "Lato",
    fontStyle: "normal",
    fontWeight: 600,
    fontSize: "16px",
    lineHeight: "22px",
    color: "#89A2A7",
    marginLeft: "6px",
    marginRight: "6px",
  },
  "& .textChecked": {
    display: "inline",
    fontFamily: "Lato",
    fontStyle: "normal",
    fontWeight: 600,
    fontSize: "16px",
    lineHeight: "22px",
    color: "#4E5F63",
    marginLeft: "6px",
    marginRight: "6px",
  },
  "& .input": {
    display: "none",
  },
  "& .asterisk": {
    color: "#D54309",
    marginLeft: "2px",
  },
  "& .labelContainer": {
    color: "#083A50",
    display: "flex",
    alignItems: "center",
    height: "20px",
  },
  "& .switchYesNoContainer": {
    display: "flex",
    alignItems: "center",
    marginRight: "72px",
    minHeight: "50px",
  },
  "& .tooltip": {
    alignSelf: "start",
    marginLeft: "6px",
  },
  "& .errorMessage": {
    color: "#D54309 !important",
    marginTop: "44px",
    marginLeft: "8px",
    minHeight: "20px",
    width: "fit-content",
    position: "absolute",
  },
  "& .switchErrorContainer": {
    display: "flex",
    flexDirection: "column",
  },
});

const Container = styled("div", {
  shouldForwardProp: (prop) => prop !== "containerWidth",
})<HTMLProps<HTMLDivElement> & { containerWidth?: string }>(
  ({ containerWidth }) => ({
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "16px",
    fontFamily: "'Nunito', 'Rubik', sans-serif",
    fontWeight: 700,
    lineHeight: "19.6px",
    minHeight: "50px",
    flexWrap: "wrap",
    width: containerWidth,
  })
);

const HideContentWrapper = styled("div")({
  display: "none !important",
});

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
  sx,
  ...rest
}) => {
  const id = rest.id || useId();

  const [val, setVal] = useState<boolean | null>(value);
  const [touched, setTouched] = useState(value?.toString()?.length > 0);
  const [error, setError] = useState(false);
  const errorMsg = errorText || (required ? "This field is required" : null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      updateInputValidity(inputRef, errorMsg);
      return;
    }

    updateInputValidity(inputRef);
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
    setError(false);
  };

  useEffect(() => {
    const invalid = () => setError(true);

    inputRef.current?.addEventListener("invalid", invalid);
    return () => {
      inputRef.current?.removeEventListener("invalid", invalid);
    };
  }, [inputRef]);

  return (
    <GridStyled md={gridWidth || 6} xs={12} item sx={sx}>
      <Container containerWidth={containerWidth}>
        <div className="labelContainer">
          {label && (
            <label htmlFor={id} id={`${id}-label`}>
              {label}
            </label>
          )}
          {required ? <span className="asterisk">*</span> : ""}
          {tooltipText && <Tooltip placement="right" className="tooltip" title={tooltipText} />}
        </div>
        <div className="switchErrorContainer">
          <div className="switchYesNoContainer">
            <div className={val ? "text" : "textChecked"}>No</div>
            <Switch
              inputRef={inputRef}
              inputProps={{ datatype: "boolean" }}
              focusVisibleClassName="focusVisible"
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
              id={id}
            />
            {/* To satisfy the form parser. The mui switch value is not good for the form parser */}
            <input
              onChange={() => { }}
              className="input"
              name={name}
              type="checkbox"
              data-type={isBoolean ? "boolean" : "auto"}
              value={proxyValue}
              aria-labelledby={`${id}-label`}
              checked
            />
            <div className={val ? "textChecked" : "text"}>Yes</div>
          </div>
          <FormHelperText className="errorMessage">{!readOnly && error ? errorMsg : " "}</FormHelperText>
        </div>
      </Container>
      {val ? (
        toggleContent
      ) : (
        <HideContentWrapper>{toggleContent}</HideContentWrapper>
      )}
    </GridStyled>
  );
};

export default CustomSwitch;
