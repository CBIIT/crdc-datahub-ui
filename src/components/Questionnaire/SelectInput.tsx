import React, { FC, useEffect, useId, useState } from "react";
import {
  FormControl,
  FormHelperText,
  Grid,
  MenuItem,
  Select,
  SelectProps,
} from "@mui/material";
import { WithStyles, withStyles } from "@mui/styles";
import styled from "@emotion/styled";
import dropdownArrowsIcon from "../../assets/icons/dropdown_arrows.svg";

const DropdownArrowsIcon = styled.div`
  background-image: url(${dropdownArrowsIcon});
  background-size: contain;
  background-repeat: no-repeat;
  width: 9.17px;
  height: 18px;
`;

type Props = {
  classes: WithStyles<typeof styles>["classes"];
  value: string;
  options: { label: string; value: string | number }[];
  name: string;
  label: string;
  required?: boolean;
  helpText?: string;
  gridWidth?: 2 | 4 | 6 | 8 | 10 | 12;
  onChange?: (value: string) => void;
} & SelectProps;

/**
 * Generates a generic select box with a label and help text
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const SelectInput: FC<Props> = ({
  classes,
  value,
  name,
  label,
  options,
  required = false,
  helpText,
  gridWidth,
  onChange,
  ...rest
}) => {
  const id = useId();

  const [val, setVal] = useState(value);
  const [error] = useState(false);
  const helperText = helpText || (required ? "This field is required" : " ");

  const onChangeWrapper = (newVal) => {
    if (typeof onChange === "function") {
      onChange(newVal);
    }

    setVal(newVal);
  };

  useEffect(() => {
    onChangeWrapper(value);
  }, [value]);

  return (
    <Grid className={classes.root} md={gridWidth || 6} xs={12} item>
      <FormControl fullWidth error={error}>
        <label htmlFor={id} className={classes.label}>
          {label}
          {required ? <span className={classes.asterisk}>*</span> : ""}
        </label>
        <Select
          classes={{ select: classes.input }}
          id={id}
          size="small"
          value={val}
          onChange={(e) => onChangeWrapper(e.target.value)}
          required={required}
          name={name}
          IconComponent={DropdownArrowsIcon}
          MenuProps={{ PaperProps: { className: classes.paper } }}
          {...rest}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>{error ? helperText : " "}</FormHelperText>
      </FormControl>
    </Grid>
  );
};

const styles = () => ({
  root: {
    "& .MuiFormHelperText-root.Mui-error": {
      color: "#D54309 !important",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderRadius: "8px",
      borderColor: "#6B7294",
      padding: "0 12px"
    },
    "&.Mui-error fieldset": {
      borderColor: "#D54309 !important",
    },
    "& .MuiSelect-icon": {
      right: "12px"
    },
    "& .MuiSelect-iconOpen": {
      transform: "none"
    }
  },
  label: {
    fontWeight: 700,
    fontSize: "16px",
    color: "#083A50",
    marginBottom: "4px",
  },
  asterisk: {
    color: "#D54309",
    marginLeft: "6px",
  },
  paper: {
    borderRadius: "8px",
    border: "1px solid #6B7294",
    marginTop: "2px",
    "& .MuiList-root": {
      padding: 0,
      overflow: "auto",
      maxHeight: "40vh"
    },
    "& .MuiMenuItem-root": {
      padding: "0 10px",
      height: "35px",
      color: "#083A50",
      background: "#FFFFFF"
    },
    "& .MuiMenuItem-root.Mui-selected": {
      backgroundColor: "#FFFFFF",
      color: "#083A50",
    },
    "& .MuiMenuItem-root:hover": {
      background: "#5E6787",
      color: "#FFFFFF"
    },
    "& .MuiMenuItem-root.Mui-focused": {
      backgroundColor: "#5E6787 !important",
      color: "#FFFFFF"
    },
  },
  input: {
    backgroundColor: "#fff",
    color: "#083A50 !important",
    "&.MuiInputBase-input": {
      fontWeight: 400,
      fontSize: "16px",
      fontFamily: "'Nunito', 'Rubik', sans-serif",
      lineHeight: "19.6px",
      padding: "12px",
      height: "20px",
      minHeight: "20px"
    },
  },
});

export default withStyles(styles, { withTheme: true })(SelectInput);
