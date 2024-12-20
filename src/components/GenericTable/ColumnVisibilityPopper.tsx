import React, { ChangeEvent, InputHTMLAttributes, useMemo } from "react";
import {
  Popper,
  Paper,
  Checkbox,
  FormControlLabel,
  styled,
  Box,
  Stack,
  ClickAwayListener,
  Typography,
  IconButton,
  Button,
} from "@mui/material";
import checkboxCheckedIcon from "../../assets/icons/checkbox_checked.svg";
import { ReactComponent as CloseIconSvg } from "../../assets/icons/close_icon.svg";

const StyledPopper = styled(Popper)({
  zIndex: 100,
});

const StyledResetButton = styled(Button)(({ theme }) => ({
  color: "#083A50",
  fontSize: "16px",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontStyle: "normal",
  fontWeight: 700,
  lineHeight: "19.6px",
  padding: 0,
  "&.Mui-disabled": {
    opacity: theme.palette.action.disabledOpacity,
  },
}));

const StyledCloseDialogButton = styled(IconButton)(() => ({
  position: "absolute !important" as "absolute",
  right: "21px",
  top: "11px",
  padding: "10px",
  "& svg": {
    color: "#44627C",
  },
}));

const UncheckedIcon = styled("div")({
  outline: "3px solid #1D91AB",
  outlineOffset: -3,
  borderRadius: "4px",
  width: "24px",
  height: "24px",
  backgroundColor: "#FFFFFF",
  color: "#083A50",
  cursor: "pointer",
});

const CheckedIcon = styled("div")({
  backgroundImage: `url(${checkboxCheckedIcon})`,
  backgroundSize: "auto",
  backgroundRepeat: "no-repeat",
  width: "24px",
  height: "24px",
  backgroundColor: "initial",
  color: "#1D91AB",
  borderRadius: "4px",
  cursor: "pointer",
});

const StyledTitle = styled(Typography)({
  fontSize: "16px",
  color: "#083A50 !important",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontStyle: "normal",
  fontWeight: 700,
  lineHeight: "19.6px",
});

const StyledCheckbox = styled(Checkbox)({
  padding: 0,
  marginRight: "5px",
});

const StyledPaper = styled(Paper)({
  width: "295px",
  border: "2px solid #5AB8FF",
  borderRadius: "8px",
  backgroundColor: "#F2F6FA",
});

const StyledColumnList = styled(Box)({
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "flex-start",
  gap: "10px",
  marginBottom: "12px",
  padding: "22px 16px 18px 25px",
});

const StyledFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
  width: "100%",
  marginRight: 0,
  marginLeft: 0,
  "& .MuiFormControlLabel-label": {
    width: "100%",
    fontSize: "16px",
    color: "#083A50 !important",
    fontFamily: "'Nunito', 'Rubik', sans-serif",
    fontStyle: "normal",
    fontWeight: 700,
    lineHeight: "19.6px",
  },
  "& .Mui-disabled": {
    opacity: theme.palette.action.disabledOpacity,
  },
}));

const StyledFooter = styled(Stack)({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 8px 20px 13px",
  borderTop: "1px solid #375F9A",
  marginLeft: "12px",
  marginRight: "12px",
});

type Props<C extends { hideable?: boolean }> = {
  anchorEl: HTMLElement | null;
  open: boolean;
  columns: C[];
  columnVisibilityModel: ColumnVisibilityModel;
  sortAlphabetically?: boolean;
  onColumnVisibilityModelChange: (model: ColumnVisibilityModel) => void;
  onClose: () => void;
  getColumnKey: (column: C) => string;
  getColumnLabel: (column: C) => string;
};

/**
 * A popper component that allows users to toggle the visibility of table columns.
 * Supports non-hideable columns by disabling their checkboxes and labels.
 *
 * @template C - The type of the column objects
 * @param {Props} props
 * @returns {JSX.Element}
 */
const ColumnVisibilityPopper = <C extends { hideable?: boolean }>({
  anchorEl,
  open,
  columns,
  columnVisibilityModel,
  sortAlphabetically = true,
  onColumnVisibilityModelChange,
  onClose,
  getColumnKey,
  getColumnLabel,
}: Props<C>): JSX.Element => {
  /**
   * Handles the change event for individual column checkboxes.
   * Ensures non-hideable columns remain checked.
   *
   * @param key - The unique key of the column
   * @param isHideable - Indicates if the column is hideable
   */
  const handleCheckboxChange =
    (key: string, isHideable: boolean) =>
    (event: ChangeEvent<HTMLInputElement>): void => {
      if (!isHideable) {
        return; // Prevent changing non-hideable columns
      }
      const updatedModel = {
        ...columnVisibilityModel,
        [key]: event.target.checked,
      };
      onColumnVisibilityModelChange(updatedModel);
    };

  /**
   * Handles the "Show/Hide All" checkbox change event.
   * Toggles visibility of all hideable columns.
   *
   * @param event - The change event from the checkbox
   */
  const handleToggleAll = (event: ChangeEvent<HTMLInputElement>): void => {
    const isChecked = event.target.checked;
    const updatedModel = columns.reduce<ColumnVisibilityModel>((model, column) => {
      const key = getColumnKey(column);
      const isHideable = column.hideable !== false;
      if (isHideable) {
        model[key] = isChecked;
      } else {
        model[key] = true; // Non-hideable columns remain visible
      }
      return model;
    }, {});
    onColumnVisibilityModelChange(updatedModel);
  };

  /**
   * Resets all columns to visible.
   * Non-hideable columns remain visible.
   */
  const handleReset = (): void => {
    const resetModel = columns.reduce<ColumnVisibilityModel>((model, column) => {
      const key = getColumnKey(column);
      model[key] = true; // Set all columns to visible
      return model;
    }, {});
    onColumnVisibilityModelChange(resetModel);
  };

  const sortedColumns = useMemo(() => {
    if (!sortAlphabetically) {
      return columns;
    }

    return [...columns].sort((a, b) => {
      const labelA = getColumnLabel(a)?.toLowerCase();
      const labelB = getColumnLabel(b)?.toLowerCase();
      return labelA?.localeCompare(labelB);
    });
  }, [columns, getColumnLabel, sortAlphabetically]);

  // Filter hideable columns for computing 'allChecked' state
  const hideableColumns = columns.filter((column) => column.hideable !== false);

  const allHideableChecked = hideableColumns.every((column) => {
    const key = getColumnKey(column);
    return columnVisibilityModel[key];
  });

  const anyHidden = hideableColumns.some((column) => {
    const key = getColumnKey(column);
    return !columnVisibilityModel[key];
  });

  return (
    <StyledPopper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-end"
      modifiers={[
        {
          name: "flip",
          enabled: false,
          options: {
            fallbackPlacements: [],
          },
        },
      ]}
      data-testid="column-visibility-popper"
    >
      <ClickAwayListener onClickAway={onClose}>
        <StyledPaper elevation={8} role="presentation">
          <StyledCloseDialogButton
            aria-label="close"
            data-testid="column-visibility-popper-close-button"
            onClick={onClose}
          >
            <CloseIconSvg />
          </StyledCloseDialogButton>

          <StyledColumnList data-testid="column-list">
            <StyledTitle>Displayed Columns</StyledTitle>

            {sortedColumns?.map((column) => {
              const key = getColumnKey(column);
              const isHideable = column.hideable !== false;
              return (
                <StyledFormControlLabel
                  key={key}
                  control={
                    <StyledCheckbox
                      checked={columnVisibilityModel[key]}
                      onChange={handleCheckboxChange(key, isHideable)}
                      icon={<UncheckedIcon />}
                      checkedIcon={<CheckedIcon />}
                      disabled={!isHideable}
                      inputProps={
                        {
                          "data-testid": `checkbox-${key}`,
                        } as InputHTMLAttributes<HTMLInputElement>
                      }
                    />
                  }
                  label={getColumnLabel(column)}
                  disabled={!isHideable}
                />
              );
            })}
          </StyledColumnList>

          <StyledFooter>
            <StyledFormControlLabel
              control={
                <StyledCheckbox
                  indeterminate={false}
                  checked={allHideableChecked}
                  onChange={handleToggleAll}
                  icon={<UncheckedIcon />}
                  checkedIcon={<CheckedIcon />}
                  inputProps={
                    {
                      "data-testid": "toggle-all-checkbox",
                    } as InputHTMLAttributes<HTMLInputElement>
                  }
                />
              }
              label="Show All"
            />
            <StyledResetButton
              variant="text"
              onClick={handleReset}
              disabled={!anyHidden}
              data-testid="reset-button"
            >
              RESET
            </StyledResetButton>
          </StyledFooter>
        </StyledPaper>
      </ClickAwayListener>
    </StyledPopper>
  );
};

export default ColumnVisibilityPopper;
