import React, { FC, useEffect, useState, useRef } from "react";
import {
  Autocomplete,
  TextField,
  TableCell,
  Tooltip,
  TooltipProps,
  styled
} from "@mui/material";
import { WithStyles, withStyles } from "@mui/styles";
import dropdownArrowsIcon from "../../assets/icons/dropdown_arrows.svg";
import { fileTypeExtensions } from "../../config/FileTypeConfig";
import useFormMode from "../../content/questionnaire/sections/hooks/useFormMode";

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

const StyledTooltip = styled((props: TooltipProps) => (
  <Tooltip classes={{ popper: props.className }} {...props} />
))(() => ({
  "& .MuiTooltip-tooltip": {
    marginTop: "4px !important",
    color: "#D54309",
    background: "#FFFFFF",
    border: "1px solid #2B528B",
  },
  "& .MuiTooltip-arrow": {
    color: "#2B528B",
  },
}));

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
  const { readOnlyInputs } = useFormMode();

  const [typeVal, setTypeVal] = useState(typeValue);
  const [extensionVal, setExtensionVal] = useState(extensionValue);
  const fileTypeRef = useRef<HTMLInputElement>(null);
  const fileExtensionRef = useRef<HTMLInputElement>(null);
  const [showFileTypeEror, setShowFileTypeError] = useState<boolean>(false);
  const [showFileExtensionError, setShowFileExtensionError] = useState<boolean>(false);

  useEffect(() => {
    const invalid = () => {
      setShowFileTypeError(true);
    };
    fileTypeRef.current?.addEventListener("invalid", invalid);
    return () => {
      fileTypeRef.current?.removeEventListener("invalid", invalid);
    };
  }, [fileTypeRef]);

  useEffect(() => {
    const invalid = () => {
      setShowFileExtensionError(true);
    };

    fileExtensionRef.current?.addEventListener("invalid", invalid);
    return () => {
      fileExtensionRef.current?.removeEventListener("invalid", invalid);
    };
  }, [fileExtensionRef]);

  const onTypeValChangeWrapper = (e, v, r) => {
    setShowFileTypeError(false);
    v = v || "";
    if (v === "") {
      fileTypeRef.current.setCustomValidity("Please specify a file type");
    } else {
      fileTypeRef.current.setCustomValidity("");
    }
    if (typeof onChange === "function") {
      onChange(e, v, r);
    }

    setTypeVal(v);
  };
  const onExtensionValChangeWrapper = (e, v, r) => {
    setShowFileExtensionError(false);
    v = v || "";
    if (v === "") {
      fileExtensionRef.current.setCustomValidity("Please specify a file extension type");
    } else {
      fileExtensionRef.current.setCustomValidity("");
    }
    if (typeof onChange === "function") {
      onChange(e, v, r);
    }

    setExtensionVal(v);
  };
  const typeTextInputOnChange = (r) => {
    onTypeValChangeWrapper(null, r.target.value, null);
  };
  const extensionTextInputOnChange = (r) => {
    onExtensionValChangeWrapper(null, r.target.value, null);
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
        <StyledAutocomplete
          sx={{
          "& .MuiInputBase-input": {
            fontWeight: 400,
            fontSize: "16px",
            fontFamily: "'Nunito', 'Rubik', sans-serif",
            padding: "0 !important",
            height: "20px",
          },
        }}
          id={inputID.concat("-type")}
          size="small"
          value={typeVal || ""}
          classes={{ root: classes.inputInTable }}
          onChange={onTypeValChangeWrapper}
          popupIcon={<DropdownArrowsIcon />}
          readOnly={readOnlyInputs}
          freeSolo
          slotProps={{
          paper: {
            className: classes.paper
          },
          popper: {
            disablePortal: true,
            sx: {
              top: "-2px !important",
              zIndex: "2000"
            },
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
            <StyledTooltip
              title="Missing required field"
              arrow
              disableHoverListener
              disableFocusListener
              disableTouchListener
              open={showFileTypeEror}
              slotProps={{ tooltip: { style: { marginTop: "4px !important" } } }}
            >
              <TextField
                {...p}
                onChange={typeTextInputOnChange}
                name={name.concat("[type]")}
                required={required}
                placeholder={rest.placeholder || "Enter or select a type"}
                variant="standard"
                inputRef={fileTypeRef}
                InputProps={{ ...p.InputProps, disableUnderline: true }}
              // eslint-disable-next-line react/jsx-no-duplicate-props
                inputProps={{ ...p.inputProps, maxLength: 30 }}
              />
            </StyledTooltip>
        )}
          {...rest}
        />
      </TableCell>
      <TableCell className={classes.autocomplete}>
        <StyledAutocomplete
          sx={{
            "& .MuiInputBase-input": {
              fontWeight: 400,
              fontSize: "16px",
              fontFamily: "'Nunito', 'Rubik', sans-serif",
              padding: "0 !important",
              height: "20px",
            },
          }}
          id={inputID.concat("-extension")}
          size="small"
          value={extensionVal || ""}
          classes={{ root: classes.inputInTable }}
          onChange={onExtensionValChangeWrapper}
          popupIcon={<DropdownArrowsIcon />}
          readOnly={readOnlyInputs}
          freeSolo
          slotProps={{
            paper: {
              className: classes.paper
            },
            popper: {
              disablePortal: true,
              sx: {
                top: "-2px !important",
                zIndex: "2000"
              },
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
            <StyledTooltip
              title="Missing required field"
              arrow
              disableHoverListener
              disableFocusListener
              disableTouchListener
              open={showFileExtensionError}
            >
              <TextField
                {...p}
                onChange={extensionTextInputOnChange}
                name={name.concat("[extension]")}
                required={required}
                placeholder={rest.placeholder || "Enter or select an extension"}
                variant="standard"
                inputRef={fileExtensionRef}
                InputProps={{ ...p.InputProps, disableUnderline: true }}
              // eslint-disable-next-line react/jsx-no-duplicate-props
                inputProps={{ ...p.inputProps, maxLength: 10 }}
              />
            </StyledTooltip>
          )}
          options={fileTypeExtensions[typeVal] || []}
        />
      </TableCell>
    </>
  );
};

const StyledAutocomplete = styled(Autocomplete)(({ readOnly } : { readOnly? : boolean }) => ({
  "& .MuiInputBase-root": {
    backgroundColor: readOnly ? "#D9DEE4" : "#FFFFFF",
    "&.MuiAutocomplete-inputRoot.MuiInputBase-root": {
      display: 'flex',
      alignItems: 'center',
      padding: 0,
    },
    "& .MuiInputBase-input": {
      fontWeight: 400,
      fontSize: "16px",
      fontFamily: "'Nunito', 'Rubik', sans-serif",
      padding: "10px 12px 10px 12px !important",
      cursor: readOnly ? "not-allowed !important" : "initial",
    },
    "& .MuiAutocomplete-endAdornment": {
      right: "8px",
    },
    "&.Mui-focused": {
      boxShadow:
        "2px 2px 2px 1px rgba(38, 184, 147, 0.10), -2px -2px 2px 1px rgba(38, 184, 147, 0.20)",
    },
  },
}));

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
      backgroundColor: "#3E7E6D",
      color: "#FFFFFF"
    },
    "& .MuiAutocomplete-option.Mui-focused": {
      backgroundColor: "#3E7E6D !important",
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
    "& .MuiAutocomplete-input:read-only": {
      backgroundColor: "#D2DFE9",
      color: "#083A50",
      cursor: "not-allowed",
    },
  },
  autocomplete: {
    borderTop: "1px solid #6B7294 !important",
    borderRight: "1px solid #6B7294 !important",
    borderBottom: "none!important",
    borderLeft: "none!important",
    padding: "0",
    "& .MuiStack-root": {
      width: "auto",
    }
  }
});

export default withStyles(styles, { withTheme: true })(TableAutocompleteInput);
