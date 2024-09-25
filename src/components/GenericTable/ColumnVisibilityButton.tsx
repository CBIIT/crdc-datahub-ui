import React, { useState } from "react";
import { IconButton } from "@mui/material";
import { ReactComponent as TableColumnsIcon } from "../../assets/icons/table_columns_icon.svg";
import ColumnVisibilityPopper from "./ColumnVisibilityPopper";
import { useLocalStorage } from "../../hooks/useLocalStorage";

type ColumnVisibilityModel = { [key: string]: boolean };

type Props<C extends { hideable?: boolean }> = {
  columns: C[];
  localStroageKey: string;
  getColumnKey: (column: C) => string;
  getColumnLabel: (column: C) => string;
};

/**
 * A component that renders a button to toggle the ColumnVisibilityPopper.
 * It manages the anchor element and stores the column visibility settings in localStorage.
 * @template C - The type of the column objects
 * @param {Props} props
 * @returns {JSX.Element}
 */
const ColumnVisibilityButton = <C extends { hideable?: boolean }>({
  columns,
  localStroageKey,
  getColumnKey,
  getColumnLabel,
}: Props<C>): JSX.Element => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  // Initialize the default visibility model (all columns visible)
  const defaultVisibilityModel = columns.reduce<ColumnVisibilityModel>((model, column) => {
    const key = getColumnKey(column);
    model[key] = true;
    return model;
  }, {});

  // Use localStorage to store the visibility model
  const [columnVisibilityModel, setColumnVisibilityModel] = useLocalStorage<ColumnVisibilityModel>(
    localStroageKey,
    defaultVisibilityModel
  );

  const handleOpenPopper = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopper = (): void => {
    setAnchorEl(null);
  };

  const handleColumnVisibilityChange = (model: ColumnVisibilityModel): void => {
    setColumnVisibilityModel(model);
  };

  return (
    <>
      <IconButton onClick={handleOpenPopper} aria-label="Manage columns button">
        <TableColumnsIcon />
      </IconButton>
      <ColumnVisibilityPopper
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        columns={columns}
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={handleColumnVisibilityChange}
        onClose={handleClosePopper}
        getColumnKey={getColumnKey}
        getColumnLabel={getColumnLabel}
      />
    </>
  );
};

export default ColumnVisibilityButton;
