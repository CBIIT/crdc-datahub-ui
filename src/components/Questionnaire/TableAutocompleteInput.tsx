import React, { FC, useEffect, useState } from "react";
import {
  Autocomplete,
  TextField,
  styled,
} from "@mui/material";
import { WithStyles, withStyles } from "@mui/styles";
import dropdownArrowsIcon from "../../assets/icons/dropdown_arrows.svg";

const DropdownArrowsIcon = styled("div")(() => ({
  backgroundImage: `url(${dropdownArrowsIcon})`,
  backgroundSize: "contain",
  backgroundRepeat: "no-repeat",
  width: "9.17px",
  height: "18px",
}));

type Props = {
  inputID: string;
  classes: WithStyles<typeof styles>["classes"];
  value: string;
  options: string[];
  name?: string;
  required?: boolean;
  helpText?: string;
  placeholder?: string;
  disableClearable?: boolean;
  freeSolo?: boolean;
  onChange?: (e: React.SyntheticEvent, v: string, r: string) => void;
};

/**
 * Generates a generic autocomplete select box with a label and help text
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const TableAutocompleteInput: FC<Props> = ({
  inputID,
  classes,
  value,
  name,
  required = false,
  helpText,
  freeSolo = false,
  onChange,
  ...rest
}) => {
  const [val, setVal] = useState(value);

  const onChangeWrapper = (e, v, r) => {
    if (typeof onChange === "function") {
      onChange(e, v, r);
    }

    setVal(v);
  };

  useEffect(() => {
    onChangeWrapper(null, value, null);
  }, [value]);

  return (
    <Autocomplete
      isOptionEqualToValue={(option, value) => option.value === value.value}
      sx={{
        '& .MuiAutocomplete-endAdornment': {
          top: "auto"
        }
      }}
      id={inputID}
      size="small"
      value={val}
      classes={{ root: classes.inputInTable }}
      onChange={onChangeWrapper}
      popupIcon={<DropdownArrowsIcon />}
      freeSolo={freeSolo}
      slotProps={{
        paper: {
          className: classes.paper
        },
        popper: {
          disablePortal: true,
          sx: { marginTop: "8px !important" },
          modifiers: [
            {
              // disables popper from flipping above the input when out of screen room
              name: "flip",
              enabled: false,
              options: {
                fallbackPlacements: [],
              },
            },
          ],
        },
      }}
      renderInput={(p) => (
        <TextField
          {...p}
          name={name}
          required={required}
          placeholder={rest.placeholder || ""}
          variant="standard"
          InputProps={{ ...p.InputProps, disableUnderline: true }}
        />
      )}
      {...rest}
    />
  );
};

const styles = () => ({
  paper: {
    borderRadius: "8px",
    border: "1px solid #6B7294",
    marginTop: "2px",
    "& .MuiAutocomplete-listbox": {
      padding: 0
    },
    "& .MuiAutocomplete-option[aria-selected='true']": {
      color: "#083A50",
      background: "#FFFFFF"
    },
    "& .MuiAutocomplete-option": {
      padding: "0 10px",
      height: "35px",
      color: "#083A50",
      background: "#FFFFFF"
    },
    "& .MuiAutocomplete-option:hover": {
      backgroundColor: "#5E6787",
      color: "#FFFFFF"
    },
    "& .MuiAutocomplete-option.Mui-focused": {
      backgroundColor: "#5E6787 !important",
      color: "#FFFFFF"
    },
  },
  inputInTable: {
    backgroundColor: "#fff",
    "& .MuiAutocomplete-inputRoot.MuiInputBase-root": {
      padding: 0,
    },
    "& .MuiInputBase-input": {
      color: "#083A50",
      fontWeight: 400,
      fontSize: "16px",
      fontFamily: "'Nunito', 'Rubik', sans-serif",
      padding: "0 !important",
      height: "20px",
    },
    "& ::placeholder": {
      color: "#929296",
      fontWeight: 400,
      opacity: 1
    },
  },
});

export default withStyles(styles, { withTheme: true })(TableAutocompleteInput);
