import React, { ReactNode, useState } from "react";
import { IconButton } from "@mui/material";
import { ReactComponent as TableColumnsIcon } from "../../assets/icons/table_columns_icon.svg";
import ColumnVisibilityPopper from "./ColumnVisibilityPopper";

type ColumnVisibilityModel = { [key: string]: boolean };

type Props<C extends { hideable?: boolean }> = {
  columns: C[];
  columnVisibilityModel: ColumnVisibilityModel;
  icon?: ReactNode;
  sortAlphabetically?: boolean;
  getColumnKey: (column: C) => string;
  getColumnLabel: (column: C) => string;
  onColumnVisibilityModelChange: (model: ColumnVisibilityModel) => void;
  // Removed localStorageKey as it's not needed here
};

/**
 * A component that renders a button to toggle the ColumnVisibilityPopper.
 * It receives the columnVisibilityModel from the parent component.
 *
 * @template C - The type of the column objects
 * @param {Props} props
 * @returns {JSX.Element}
 */
const ColumnVisibilityButton = <C extends { hideable?: boolean }>({
  columns,
  columnVisibilityModel,
  icon,
  sortAlphabetically = true,
  getColumnKey,
  getColumnLabel,
  onColumnVisibilityModelChange,
}: Props<C>): JSX.Element => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpenPopper = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopper = (): void => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton onClick={handleOpenPopper} aria-label="Manage columns button">
        {icon ?? <TableColumnsIcon />}
      </IconButton>
      <ColumnVisibilityPopper
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        columns={columns}
        columnVisibilityModel={columnVisibilityModel}
        sortAlphabetically={sortAlphabetically}
        onColumnVisibilityModelChange={onColumnVisibilityModelChange}
        onClose={handleClosePopper}
        getColumnKey={getColumnKey}
        getColumnLabel={getColumnLabel}
      />
    </>
  );
};

export default ColumnVisibilityButton;
