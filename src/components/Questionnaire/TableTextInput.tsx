import React, { FC, useEffect, useId, useState } from "react";
import {
  Input,
  InputProps,
} from "@mui/material";
import { WithStyles, withStyles } from "@mui/styles";

type Props = {
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
const TextInput: FC<Props> = ({
  classes,
  value,
  ...rest
}) => {
  const id = useId();
  const [val, setVal] = useState(value);

  const onChange = (newVal) => {
    setVal(newVal);
  };

  useEffect(() => {
    onChange(value.toString().trim());
  }, [value]);

  return (
    <Input
      classes={{ root: classes.input }}
      type={rest.type || "text"}
      id={id}
      size="small"
      value={val}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
      disableUnderline
    />
  );
};

const styles = () => ({
  input: {
    "& .MuiInputBase-input": {
      padding: "0px",
      color: "#083A50",
      fontWeight: 400,
      fontSize: "16px",
      fontFamily: "'Nunito', 'Rubik', sans-serif",
      lineHeight: "19.6px",
      height: "20px",
    },
    "& ::placeholder": {
      color: "#929296",
      fontWeight: 400,
      opacity: 1
    },
  },
});

export default withStyles(styles, { withTheme: true })(TextInput);
