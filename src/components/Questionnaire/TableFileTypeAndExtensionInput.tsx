import React, { FC, useEffect, useState, Fragment } from "react";
import {
  Autocomplete,
  TextField,
  TableCell } from "@mui/material";
import { WithStyles, withStyles } from "@mui/styles";
import styled from 'styled-components';
import dropdownArrowsIcon from "../../assets/icons/dropdown_arrows.svg";
import { fileTypeExtensions } from "../../config/FileTypeConfig";

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
  typeValue: string;
  extensionValue: string;
  options: string[];
  name: string;
  required?: boolean;
  helpText?: string;
  placeholder?: string;
  disableClearable?: boolean;
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
  typeValue,
  extensionValue,
  name,
  required = false,
  helpText,
  onChange,
  ...rest
}) => {
  const [typeVal, setTypeVal] = useState(typeValue);
  const [extensionVal, setExtensionVal] = useState(extensionValue);
  const [valTextColor, setValTextColor] = useState("#083A50");
  const [extensionTextColor, setExtensionTextColor] = useState("#083A50");

  const onTypeValChangeWrapper = (e, v, r) => {
    v = v || "";
    if (v.toLowerCase().includes("other")) {
      setValTextColor("#d3d3d3");
      setExtensionVal("Other Extension");
      setExtensionTextColor("#d3d3d3");
    } else {
      setValTextColor("#083A50");
    }
    if (typeof onChange === "function") {
      onChange(e, v, r);
    }

    setTypeVal(v);
  };
  const onExtensionValChangeWrapper = (e, v, r) => {
    v = v || "";
    if (v.toLowerCase().includes("other")) {
      setExtensionTextColor("#d3d3d3");
    } else {
      setExtensionTextColor("#083A50");
    }
    if (typeof onChange === "function") {
      onChange(e, v, r);
    }

    setExtensionVal(v);
  };

  useEffect(() => {
    onTypeValChangeWrapper(null, typeValue, null);
  }, [typeValue]);

  useEffect(() => {
    onExtensionValChangeWrapper(null, extensionValue, null);
  }, [extensionValue]);
  return (
    <>
      <TableCell className={classes.autocomplete}>
        <Autocomplete
          isOptionEqualToValue={(option, value) => option.value === value.value}
          sx={{
          "& .MuiInputBase-input": {
            color: valTextColor,
            fontWeight: 400,
            fontSize: "16px",
            fontFamily: "'Nunito', 'Rubik', sans-serif",
            padding: "0 !important",
            height: "20px",
          },
        }}
          id={inputID.concat("-type")}
          size="small"
          value={typeVal}
          classes={{ root: classes.inputInTable }}
          onChange={onTypeValChangeWrapper}
          popupIcon={<DropdownArrowsIcon />}
          freeSolo
          disableClearable
          slotProps={{
          paper: {
            className: classes.paper
          },
          popper: {
            disablePortal: true,
            sx: { marginTop: "8px !important" },
            style: { width: "200% !important" },
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
              name={name.concat("[type]")}
              required={required}
              placeholder={rest.placeholder || ""}
              variant="standard"
              InputProps={{ ...p.InputProps, disableUnderline: true }}
            />
        )}
          {...rest}
        />
      </TableCell>
      <TableCell className={classes.autocomplete}>
        <Autocomplete
          isOptionEqualToValue={(option, value) => option.value === value.value}
          sx={{
            "& .MuiInputBase-input": {
              color: extensionTextColor,
              fontWeight: 400,
              fontSize: "16px",
              fontFamily: "'Nunito', 'Rubik', sans-serif",
              padding: "0 !important",
              height: "20px",
            },
          }}
          id={inputID.concat("-extension")}
          size="small"
          value={extensionVal}
          classes={{ root: classes.inputInTable }}
          onChange={onExtensionValChangeWrapper}
          popupIcon={<DropdownArrowsIcon />}
          freeSolo
          disableClearable
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
              name={name.concat("[extension]")}
              required={required}
              placeholder={rest.placeholder || ""}
              variant="standard"
              InputProps={{ ...p.InputProps, disableUnderline: true }}
            />
          )}
          options={fileTypeExtensions[typeVal] || []}
        />
      </TableCell>
    </>
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
    "& ::placeholder": {
      color: "#929296",
      fontWeight: 400,
      opacity: 1
    },
  },
  autocomplete: {
    borderTop: "1px solid #6B7294 !important",
    borderRight: "1px solid #6B7294 !important",
    borderBottom: "none!important",
    borderLeft: "none!important",
    padding: "10px 12px 10px 12px",
    "& .MuiStack-root": {
      width: "auto",
    }
  }
});

export default withStyles(styles, { withTheme: true })(TableAutocompleteInput);
