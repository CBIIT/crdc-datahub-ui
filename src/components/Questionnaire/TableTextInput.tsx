import React, { FC, useEffect, useId, useState, useRef } from "react";
import {
  Input,
  InputProps,
} from "@mui/material";
import { WithStyles, withStyles } from "@mui/styles";
import useFormMode from "../../content/questionnaire/sections/hooks/useFormMode";
import { updateInputValidity } from '../../utils';

/*
*Pass in a regex pattern if you want this field to have custom validation checking
*/
type Props = {
  pattern?: string;
  patternValidityMessage?: string;
  maxLength?: number;
  filter?: (input: string) => string;
  classes: WithStyles<typeof styles>["classes"];
} & InputProps;

/**
 * Generates a generic text input with a label and help text
 *
 * NOTE:
 * - We're using a custom wrapper for Material UI's OutlinedInput component
 *   instead of using the TextField component because of the forced
 *   floating label behavior of TextField.
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const TableTextInput: FC<Props> = ({
  classes,
  value,
  patternValidityMessage,
  maxLength,
  pattern,
  readOnly,
  filter,
  ...rest
}) => {
  const id = useId();
  const { readOnlyInputs } = useFormMode();

  const [val, setVal] = useState(value);
  const regex = new RegExp(pattern);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const invalid = (e) => {
      if (!e.target.reportValidityInProgress) {
        e.target.reportValidityInProgress = true;
        e.target.reportValidity();
        e.target.reportValidityInProgress = false;
      }
    };

    inputRef.current?.addEventListener("invalid", invalid);
    return () => {
      inputRef.current?.removeEventListener("invalid", invalid);
    };
  }, [inputRef]);
  const onChange = (newVal) => {
    if (typeof filter === "function") {
      newVal = filter(newVal);
    }
    if (typeof maxLength === "number" && newVal.length > maxLength) {
      newVal = newVal.slice(0, maxLength);
    }
    if (!newVal.match(regex)) {
      updateInputValidity(inputRef, patternValidityMessage || "Please enter input in the correct format");
    } else {
      updateInputValidity(inputRef);
    }
    setVal(newVal);
  };

  useEffect(() => {
    onChange(value.toString().trim());
  }, [value]);

  return (
    <Input
      inputRef={inputRef}
      sx={{ width: "100%", display: "flex", alignItems: "center" }}
      classes={{ input: classes.input }}
      id={id}
      size="small"
      value={val}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
      disableUnderline
      readOnly={readOnlyInputs || readOnly}
    />
  );
};

const styles = () => ({
  input: {
    "&.MuiInputBase-input": {
      padding: "0px",
      color: "#083A50",
      fontWeight: 400,
      fontSize: "16px",
      fontFamily: "'Nunito', 'Rubik', sans-serif",
      height: "20px",
      width: "100%"
    },
    "&::placeholder": {
      color: "#929296",
      fontWeight: 400,
      opacity: 1,
      height: "20px",
    },
    "&.MuiInputBase-input:read-only": {
      backgroundColor: "#D2DFE9",
      color: "#083A50",
      cursor: "not-allowed",
    },
  },
});

export default withStyles(styles, { withTheme: true })(TableTextInput);
