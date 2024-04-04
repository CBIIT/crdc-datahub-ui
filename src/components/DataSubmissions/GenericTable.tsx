/* eslint-disable react/no-array-index-key */
import {
  Table,
  TableBody,
  TableCell,
  TableCellProps,
  TableContainer,
  TableContainerProps,
  TableHead,
  TablePagination,
  TablePaginationProps,
  TableRow,
  TableSortLabel,
  Typography,
  styled,
} from "@mui/material";
import {
  CSSProperties,
  ElementType,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import PaginationActions from "./PaginationActions";
import SuspenseLoader from "../SuspenseLoader";

const StyledTableContainer = styled(TableContainer)({
  borderRadius: "8px",
  border: "1px solid #6CACDA",
  marginBottom: "25px",
  position: "relative",
  overflow: "hidden",
  "& .MuiTableRow-root:nth-of-type(2n)": {
    background: "#E3EEF9",
  },
  "& .MuiTableCell-root:first-of-type": {
    paddingLeft: "40.44px",
  },
  "& .MuiTableCell-root:last-of-type": {
    paddingRight: "40.44px",
  },
});

const StyledTable = styled(Table, {
  shouldForwardProp: (p) => p !== "horizontalScroll",
})<{ horizontalScroll: boolean }>(({ horizontalScroll }) => ({
  whiteSpace: horizontalScroll ? "nowrap" : "initial",
  display: horizontalScroll ? "block" : "table",
  overflowX: horizontalScroll ? "auto" : "initial",
}));

const StyledTableHead = styled(TableHead)({
  background: "#4D7C8F",
});

const StyledTableRow = styled(TableRow)({
  height: "46.59px",
  minHeight: "46.59px",
});

const StyledHeaderCell = styled(TableCell)({
  fontWeight: 700,
  fontSize: "16px",
  lineHeight: "16px",
  color: "#fff !important",
  padding: "22px 53px 22px 16px",
  verticalAlign: "top",
  "&.MuiTableCell-root:first-of-type": {
    paddingTop: "22px",
    paddingRight: "16px",
    paddingBottom: "22px",
    color: "#fff !important",
  },
  "& .MuiSvgIcon-root, & .MuiButtonBase-root": {
    color: "#fff !important",
  },
});

const StyledTableCell = styled(TableCell)({
  fontSize: "16px",
  color: "#083A50 !important",
  borderBottom: "0.5px solid #6B7294",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: "19.6px",
  "&.MuiTableCell-root": {
    padding: "13px 16px",
  },
});

const StyledTablePagination = styled(TablePagination, {
  shouldForwardProp: (prop) => prop !== "placement",
})<
  TablePaginationProps & {
    component: ElementType;
    placement: CSSProperties["justifyContent"];
  }
>(({ placement }) => ({
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
    borderTop: "2px solid #083A50",
    background: "#F5F7F8",
    ...(placement && {
      justifyContent: placement,
      "& .MuiTablePagination-spacer": {
        display: "none",
      },
    }),
  },
}));

export type Order = "asc" | "desc";

export type Column<T> = {
  label: string | React.ReactNode;
  renderValue: (a: T) => React.ReactNode;
  field?: keyof T;
  default?: true;
  sortDisabled?: boolean;
  sx?: TableCellProps["sx"];
};

export type FetchListing<T> = {
  first: number;
  offset: number;
  sortDirection: Order;
  orderBy: keyof T;
};

export type TableMethods = {
  refresh: () => void;
  setPage: (page: number, forceRefetch?: boolean) => void;
};

type Props<T> = {
  columns: Column<T>[];
  data: T[];
  total: number;
  loading?: boolean;
  horizontalScroll?: boolean;
  noContentText?: string;
  defaultOrder?: Order;
  defaultRowsPerPage?: number;
  paginationPlacement?: CSSProperties["justifyContent"];
  containerProps?: TableContainerProps;
  numRowsNoContent?: number;
  AdditionalActions?: React.ReactNode;
  setItemKey?: (item: T, index: number) => string;
  onFetchData?: (params: FetchListing<T>, force: boolean) => void;
  onOrderChange?: (order: Order) => void;
  onOrderByChange?: (orderBy: Column<T>) => void;
  onPerPageChange?: (perPage: number) => void;
};

const GenericTable = <T,>(
  {
    columns,
    data,
    total = 0,
    loading,
    horizontalScroll = false,
    noContentText,
    defaultOrder = "desc",
    defaultRowsPerPage = 10,
    paginationPlacement,
    containerProps,
    numRowsNoContent = 10,
    AdditionalActions,
    setItemKey,
    onFetchData,
    onOrderChange,
    onOrderByChange,
    onPerPageChange,
  }: Props<T>,
  ref: React.Ref<TableMethods>
) => {
  const [order, setOrder] = useState<Order>(defaultOrder);
  const [orderBy, setOrderBy] = useState<Column<T>>(
    columns.find((c) => c.default) || columns.find((c) => c.field)
  );
  const [page, setPage] = useState<number>(0);
  const [perPage, setPerPage] = useState<number>(defaultRowsPerPage);

  const fetchData = (force = false) => {
    if (!onFetchData) {
      return;
    }
    onFetchData(
      {
        first: perPage,
        offset: page * perPage,
        sortDirection: order,
        orderBy: orderBy?.field,
      },
      force
    );
  };

  const emptyRows = useMemo(
    () => (page > 0 && total ? Math.max(0, (1 + page) * perPage - (total || 0)) : 0),
    [data]
  );

  const handleRequestSort = (column: Column<T>) => {
    const newOrder = orderBy === column && order === "asc" ? "desc" : "asc";
    if (typeof onOrderChange === "function") {
      onOrderChange(newOrder);
    }
    if (typeof onOrderByChange === "function") {
      onOrderByChange(column);
    }

    setOrder(newOrder);
    setOrderBy(column);
  };

  const handleChangeRowsPerPage = (event) => {
    const newPerPage = parseInt(event.target.value, 10);
    if (typeof onPerPageChange === "function") {
      onPerPageChange(newPerPage);
    }

    setPerPage(newPerPage);
    setPage(0);
  };

  useEffect(() => {
    fetchData();
  }, [page, perPage, order, orderBy]);

  useImperativeHandle(ref, () => ({
    refresh: () => {
      fetchData(true);
    },
    setPage: (newPage: number, forceRefetch = false) => {
      setPage(newPage);
      if (forceRefetch) {
        fetchData(true);
      }
    },
  }));

  return (
    <StyledTableContainer {...containerProps}>
      {loading && <SuspenseLoader fullscreen={false} />}
      <StyledTable horizontalScroll={horizontalScroll && total > 0}>
        <StyledTableHead>
          <TableRow>
            {columns.map((col: Column<T>) => (
              <StyledHeaderCell
                key={col.label.toString()}
                sx={col.sx}
                data-testid={`generic-table-header-${col.label.toString()}`}
              >
                {col.field && !col.sortDisabled ? (
                  <TableSortLabel
                    active={orderBy === col}
                    direction={orderBy === col ? order : "asc"}
                    onClick={() => handleRequestSort(col)}
                  >
                    {col.label}
                  </TableSortLabel>
                ) : (
                  col.label
                )}
              </StyledHeaderCell>
            ))}
          </TableRow>
        </StyledTableHead>
        <TableBody>
          {loading && total === 0
            ? Array.from(Array(numRowsNoContent).keys())?.map((_, idx) => (
                <StyledTableRow key={`loading_row_${idx}`}>
                  <TableCell colSpan={columns.length} />
                </StyledTableRow>
              ))
            : data?.map((d: T, idx: number) => {
                const itemKey = setItemKey ? setItemKey(d, idx) : d["_id"];
                return (
                  <TableRow tabIndex={-1} hover key={itemKey}>
                    {columns.map((col: Column<T>) => (
                      <StyledTableCell key={`${itemKey}_${col.label}`}>
                        {col.renderValue(d)}
                      </StyledTableCell>
                    ))}
                  </TableRow>
                );
              })}

          {!loading &&
            emptyRows > 0 &&
            Array.from(Array(emptyRows).keys())?.map((row) => (
              <StyledTableRow key={`empty_row_${row}`}>
                <TableCell colSpan={columns.length} />
              </StyledTableRow>
            ))}

          {/* No content message */}
          {!loading && (!total || total === 0) && (
            <TableRow style={{ height: 46 * numRowsNoContent }}>
              <TableCell colSpan={columns.length}>
                <Typography
                  variant="body1"
                  align="center"
                  fontSize={18}
                  fontWeight={500}
                  color="#757575"
                >
                  {noContentText || "No existing data was found"}
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </StyledTable>
      <StyledTablePagination
        rowsPerPageOptions={[5, 10, 20, 50]}
        component="div"
        count={total || 0}
        rowsPerPage={perPage}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage - 1)}
        onRowsPerPageChange={handleChangeRowsPerPage}
        placement={paginationPlacement}
        nextIconButtonProps={{
          disabled:
            perPage === -1 ||
            !data ||
            total === 0 ||
            total <= (page + 1) * perPage ||
            emptyRows > 0 ||
            loading,
        }}
        SelectProps={{
          inputProps: {
            "aria-label": "rows per page",
            "data-testid": "generic-table-rows-per-page",
          },
          native: true,
        }}
        backIconButtonProps={{ disabled: page === 0 || loading }}
        // eslint-disable-next-line react/no-unstable-nested-components
        ActionsComponent={(props) => (
          <PaginationActions {...props} AdditionalActions={AdditionalActions} />
        )}
      />
    </StyledTableContainer>
  );
};

const TableWithRef = forwardRef(GenericTable) as <T>(
  props: Props<T> & { ref?: React.Ref<TableMethods> }
) => ReturnType<typeof GenericTable>;

export default TableWithRef;
