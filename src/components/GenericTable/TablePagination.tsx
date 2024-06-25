import { TablePagination as MuiTablePagination, TablePaginationProps, styled } from "@mui/material";
import { CSSProperties, ElementType } from "react";
import PaginationActions from "./PaginationActions";

const StyledTablePagination = styled(MuiTablePagination, {
  shouldForwardProp: (prop) => prop !== "placement" && prop !== "verticalPlacement",
})<
  TablePaginationProps & {
    component: ElementType;
    verticalPlacement: "top" | "bottom";
    placement: CSSProperties["justifyContent"];
  }
>(({ verticalPlacement, placement }) => ({
  "& .MuiTablePagination-displayedRows, & .MuiTablePagination-selectLabel, & .MuiTablePagination-select":
    {
      height: "27px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#1D355F",
      textAlign: "center",
      fontVariantNumeric: "lining-nums tabular-nums",
      fontFamily: "Lato, sans-serif",
      fontSize: "14px",
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "14.913px",
      letterSpacing: "0.14px",
    },
  "& .MuiToolbar-root .MuiInputBase-root": {
    height: "27px",
    marginLeft: 0,
    marginRight: "16px",
  },
  "& .MuiToolbar-root p": {
    marginTop: 0,
    marginBottom: 0,
  },
  "& .MuiToolbar-root": {
    minHeight: "45px",
    height: "fit-content",
    paddingTop: "7px",
    paddingBottom: "6px",
    borderTop: verticalPlacement === "bottom" ? "2px solid #083A50" : "none",
    background: "#FFFFFF",
    ...(placement && {
      justifyContent: placement,
      "& .MuiTablePagination-spacer": {
        display: "none",
      },
    }),
  },
}));

type Props = {
  disabled: boolean;
  total: number;
  perPage: number;
  page: number;
  verticalPlacement: "top" | "bottom";
  placement?: CSSProperties["justifyContent"];
  AdditionalActions?: React.ReactNode;
} & Partial<TablePaginationProps>;

const TablePagination = ({
  disabled,
  total,
  perPage,
  page,
  verticalPlacement,
  placement,
  AdditionalActions,
  rowsPerPageOptions = [5, 10, 20, 50],
  onPageChange,
  onRowsPerPageChange,
  ...rest
}: Props) => (
  <StyledTablePagination
    rowsPerPageOptions={rowsPerPageOptions}
    component="div"
    count={total || 0}
    rowsPerPage={perPage}
    page={page}
    onPageChange={onPageChange}
    onRowsPerPageChange={onRowsPerPageChange}
    verticalPlacement={verticalPlacement}
    placement={placement}
    nextIconButtonProps={{
      disabled: disabled || !total || total <= (page + 1) * perPage,
    }}
    SelectProps={{
      inputProps: {
        "aria-label": "rows per page",
        "data-testid": `generic-table-rows-per-page-${verticalPlacement}`,
      },
      native: true,
    }}
    backIconButtonProps={{ disabled: disabled || page <= 0 }}
    // eslint-disable-next-line react/no-unstable-nested-components
    ActionsComponent={(props) => (
      <PaginationActions
        AdditionalActions={AdditionalActions}
        ariaProps={{ "aria-label": `${verticalPlacement} pagination actions` }}
        {...props}
      />
    )}
    {...rest}
  />
);

export default TablePagination;
