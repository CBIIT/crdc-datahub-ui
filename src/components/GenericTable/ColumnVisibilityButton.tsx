import React, { ReactNode, useState } from "react";
import { IconButton, Stack, styled } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ReactComponent as TableColumnsIcon } from "../../assets/icons/table_columns_icon.svg";
import ColumnVisibilityPopper from "./ColumnVisibilityPopper";
import Tooltip from "../Tooltip";

const StyledIconButton = styled(IconButton)({
  padding: 0,
  paddingLeft: "3px",
});

const StyledExpandMoreIcon = styled(ExpandMoreIcon)({
  color: "#000",
  fontSize: "18px",
  alignSelf: "flex-end",
});

const StyledTableColumnsIcon = styled(TableColumnsIcon)({
  color: "#346798",
});

type Props<C extends { hideable?: boolean }> = {
  columns: C[];
  columnVisibilityModel: ColumnVisibilityModel;
  icon?: ReactNode;
  sortAlphabetically?: boolean;
  getColumnKey: (column: C) => string;
  getColumnLabel: (column: C) => string;
  onColumnVisibilityModelChange: (model: ColumnVisibilityModel) => void;
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
      <Tooltip
        open={undefined}
        title="View filterable columns."
        placement="top"
        disableHoverListener={false}
      >
        <StyledIconButton
          onClick={handleOpenPopper}
          aria-label="Manage columns button"
          data-testid="column-visibility-button"
          disableTouchRipple
          disableRipple
          disableFocusRipple
        >
          {icon ?? (
            <Stack direction="row">
              <StyledTableColumnsIcon />
              <StyledExpandMoreIcon />
            </Stack>
          )}
        </StyledIconButton>
      </Tooltip>
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
