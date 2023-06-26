import React, { FC, useEffect, useId, useState } from "react";
import {
  Autocomplete,
  FormControl,
  FormHelperText,
  Grid,
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
  classes: WithStyles<typeof styles>["classes"];
  value: string;
  label?: string;
  options: string[];
  name?: string;
  required?: boolean;
  helpText?: string;
  gridWidth?: 2 | 4 | 6 | 8 | 10 | 12;
  placeholder?: string;
  disableClearable?: boolean;
  inTable?: boolean;
  hideHelperText?: boolean;
  freeSolo? : boolean;
  onChange?: (e: React.SyntheticEvent, v: string, r: string) => void;
};

/**
 * Generates a generic autocomplete select box with a label and help text
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const AutocompleteInput: FC<Props> = ({
  classes,
  value,
  name,
  label = "",
  required = false,
  helpText,
  gridWidth,
  hideHelperText = false,
  inTable = false,
  freeSolo = false,
  onChange,
  ...rest
}) => {
  const id = useId();

  const [val, setVal] = useState(value);
  const [error] = useState(false);
  const helperText = helpText || (required ? "This field is required" : " ");

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
    <Grid className={inTable ? classes.rootNoBorder : classes.rootBorder} md={gridWidth || 6} xs={12} item>
      <FormControl fullWidth error={error}>
        {label && (
          <label htmlFor={id} className={classes.label}>
            {label}
            {required ? <span className={classes.asterisk}>*</span> : ""}
          </label>
        )}
        <Autocomplete
          isOptionEqualToValue={(option, value) => option.value === value.value}
          sx={{
                '& .MuiAutocomplete-endAdornment': {
                  top: "auto"
                }
              }}
          id={id}
          size="small"
          value={val}
          classes={inTable ? { root: classes.inputInTable } : { root: classes.input }}
          onChange={onChangeWrapper}
          popupIcon={<DropdownArrowsIcon />}
          freeSolo={freeSolo}
          slotProps={{
            paper: {
              className: classes.paper
            },
            popper: {
              disablePortal: true,
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
              variant={inTable ? "standard" : undefined}
              InputProps={inTable ? { ...p.InputProps, disableUnderline: true } : { ...p.InputProps }}
            />
          )}
          {...rest}
        />
        {!hideHelperText && <FormHelperText>{error ? helperText : " "}</FormHelperText>}
      </FormControl>
    </Grid>
  );
};

const styles = () => ({
  rootBorder: {
    "& .MuiFormHelperText-root.Mui-error": {
      color: "#D54309 !important",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderRadius: "8px",
      borderColor: "#6B7294",
    },
    "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
      border: "1px solid #209D7D",
      boxShadow: "2px 2px 4px 0px rgba(38, 184, 147, 0.10), -1px -1px 6px 0px rgba(38, 184, 147, 0.20)",
    },
    "&.Mui-error fieldset": {
      borderColor: "#D54309 !important",
    },
    "& .MuiInputBase-input::placeholder": {
      color: "#929296",
      fontWeight: 400,
      opacity: 1
    },
    "& .MuiAutocomplete-input": {
      color: "#083A50",
    },
    "& .MuiAutocomplete-popupIndicator": {
      right: "12px"
    },
    "& .MuiAutocomplete-popupIndicatorOpen": {
      transform: "none"
    }
  },
  rootNoBorder: {
    border: "none",
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
  input: {
    backgroundColor: "#fff",
    "&  .MuiAutocomplete-inputRoot.MuiInputBase-root": {
      padding: 0,
    },
    "& .MuiInputBase-input": {
      fontWeight: 400,
      fontSize: "16px",
      fontFamily: "'Nunito', 'Rubik', sans-serif",
      padding: "12px !important",
      height: "20px",
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
  },
});

export default withStyles(styles, { withTheme: true })(AutocompleteInput);
