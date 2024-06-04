/* eslint-disable react/no-array-index-key */
import {
  Table,
  TableBody,
  TableCell,
  TableCellProps,
  TableContainer,
  TableContainerProps,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  styled,
} from "@mui/material";
import { useSearchParams } from "react-router-dom";
import {
  CSSProperties,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import SuspenseLoader from "../SuspenseLoader";
import TablePagination from "./TablePagination";
import { generateSearchParameters } from "../../utils";

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
  borderBottom: "2px solid #083A50",
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
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: "19.6px",
  "&.MuiTableCell-root": {
    padding: "13px 16px",
  },
});

export type Column<T> = {
  label: string | React.ReactNode;
  renderValue: (a: T) => React.ReactNode;
  field?: keyof T;
  fieldKey?: string; // optional, used for custom unique identifier while sorting
  default?: true;
  sortDisabled?: boolean;
  comparator?: (a: T, b: T) => number;
  sx?: TableCellProps["sx"];
};

type Props<T> = {
  columns: Column<T>[];
  data: T[];
  total: number;
  loading?: boolean;
  horizontalScroll?: boolean;
  position?: PaginationPosition;
  noContentText?: string;
  defaultOrder?: Order;
  defaultRowsPerPage?: number;
  paginationPlacement?: CSSProperties["justifyContent"];
  containerProps?: TableContainerProps;
  numRowsNoContent?: number;
  AdditionalActions?: React.ReactNode;
  CustomTableHead?: React.ElementType<React.ComponentProps<typeof TableHead>>;
  CustomTableHeaderCell?: React.ElementType<React.ComponentProps<typeof TableCell>>;
  CustomTableBodyCell?: React.ElementType<React.ComponentProps<typeof TableCell>>;
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
    position = "bottom",
    noContentText,
    defaultOrder = "desc",
    defaultRowsPerPage = 10,
    paginationPlacement,
    containerProps,
    numRowsNoContent = 10,
    AdditionalActions,
    CustomTableHead,
    CustomTableHeaderCell,
    CustomTableBodyCell,
    setItemKey,
    onFetchData,
    onOrderChange,
    onOrderByChange,
    onPerPageChange,
  }: Props<T>,
  ref: React.Ref<TableMethods>
) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [order, setOrder] = useState<Order>(defaultOrder);
  const [orderBy, setOrderBy] = useState<Column<T>>(
    columns.find((c) => c.default) || columns.find((c) => c.fieldKey ?? c.field)
  );
  const [page, setPage] = useState<number>(0);
  const [perPage, setPerPage] = useState<number>(defaultRowsPerPage);
  const TableHeadComponent = CustomTableHead || StyledTableHead;
  const TableHeaderCellComponent = CustomTableHeaderCell || StyledHeaderCell;
  const TableBodyCellComponent = CustomTableBodyCell || StyledTableCell;
  const defaultOrderByColumn: Column<T> =
    columns.find((c) => c.default) || columns.find((c) => c.fieldKey ?? c.field);
  const defaultURLParams: TableURLParams = {
    page: "1",
    rowsPerPage: defaultRowsPerPage?.toString(),
    orderBy: defaultOrderByColumn?.fieldKey ?? defaultOrderByColumn?.field?.toString(),
    sortDirection: defaultOrder,
  };
  const paramsRef = useRef(false);

  const isOrder = (value: unknown): value is Order => value === "asc" || value === "desc";

  useEffect(() => {
    if (page < 0 || page > Math.ceil(total / perPage)) {
      setPage(0);
    }
  }, [data, total, perPage]);

  useEffect(() => {
    if (!total) {
      return;
    }

    const sortDirection = searchParams.get("sortDirection") || defaultURLParams.sortDirection;
    const orderBy = searchParams.get("orderBy") || defaultURLParams.orderBy;
    const page =
      parseInt(searchParams.get("page"), 10) - 1 || parseInt(defaultURLParams.page, 10) - 1;
    const rowsPerPage =
      parseInt(searchParams.get("rowsPerPage"), 10) || parseInt(defaultURLParams.rowsPerPage, 10);

    if (isOrder(sortDirection)) {
      setOrder(sortDirection);
    }
    const orderByColumn: Column<T> = columns.find((c) => orderBy === (c.fieldKey ?? c.field));
    if (orderByColumn) {
      setOrderBy(orderByColumn);
    }
    if (!isNaN(page) && page + 1 <= Math.ceil(total / rowsPerPage) && page + 1 > 0) {
      setPage(page);
    }
    if (!isNaN(rowsPerPage) && rowsPerPage > 0) {
      setPerPage(rowsPerPage);
    }
    paramsRef.current = true;
  }, [
    total,
    data,
    searchParams.get("sortDirection"),
    searchParams.get("orderBy"),
    searchParams.get("page"),
    searchParams.get("rowsPerPage"),
  ]);

  const fetchData = (force = false) => {
    if (!onFetchData) {
      return;
    }
    const fieldKey = orderBy?.fieldKey ?? orderBy?.field?.toString();
    onFetchData(
      {
        first: perPage,
        offset: page * perPage,
        sortDirection: order,
        orderBy: fieldKey,
        comparator: orderBy?.comparator,
      },
      force
    );
  };

  const emptyRows = useMemo(
    () => (page > 0 && total ? Math.max(0, (1 + page) * perPage - (total || 0)) : 0),
    [data]
  );

  const handleRequestSort = (column: Column<T>) => {
    const fieldKey = column.fieldKey ?? column.field?.toString();
    const newOrder = orderBy === column && order === "asc" ? "desc" : "asc";

    if (typeof onOrderChange === "function") {
      onOrderChange(newOrder);
    }
    if (typeof onOrderByChange === "function") {
      onOrderByChange(column);
    }

    const updatedParams = generateSearchParameters(
      {
        page: (page + 1)?.toString(),
        rowsPerPage: perPage?.toString(),
        orderBy: fieldKey?.toString(),
        sortDirection: newOrder,
      },
      defaultURLParams
    );

    setSearchParams(updatedParams);
  };

  const handleChangeRowsPerPage = (event) => {
    const fieldKey = orderBy?.fieldKey ?? orderBy?.field?.toString();
    const newPerPage = parseInt(event.target.value, 10);
    if (typeof onPerPageChange === "function") {
      onPerPageChange(newPerPage);
    }

    const updatedParams = generateSearchParameters(
      {
        page: "1",
        rowsPerPage: newPerPage?.toString(),
        orderBy: fieldKey,
        sortDirection: order,
      },
      defaultURLParams
    );

    setSearchParams(updatedParams);
  };

  const handlePageChange = (newPage: number) => {
    // initial URL params not set, avoid changing page too early
    if (!paramsRef.current) {
      return;
    }
    const fieldKey = orderBy?.fieldKey ?? orderBy?.field?.toString();

    const updatedParams = generateSearchParameters(
      {
        page: (newPage + 1)?.toString(),
        rowsPerPage: perPage?.toString(),
        orderBy: fieldKey,
        sortDirection: order,
      },
      defaultURLParams
    );

    setSearchParams(updatedParams);
  };

  useEffect(() => {
    fetchData();
  }, [page, perPage, order, orderBy]);

  useImperativeHandle(ref, () => ({
    refresh: () => {
      fetchData(true);
    },
    setPage: (newPage: number, forceRefetch = false) => {
      handlePageChange(newPage);
      if (forceRefetch) {
        fetchData(true);
      }
    },
  }));

  return (
    <StyledTableContainer {...containerProps}>
      {loading && <SuspenseLoader fullscreen={false} />}
      {(position === "top" || position === "both") && (
        <TablePagination
          data={data}
          total={total}
          perPage={perPage}
          page={page < total / perPage ? page : 0}
          emptyRows={emptyRows}
          loading={loading}
          verticalPlacement="top"
          placement={paginationPlacement}
          AdditionalActions={AdditionalActions}
          onPageChange={(_, newPage) => handlePageChange(newPage - 1)}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
      <StyledTable horizontalScroll={horizontalScroll && total > 0}>
        {columns?.length > 0 && (
          <TableHeadComponent>
            <TableRow>
              {columns.map((col: Column<T>) => (
                <TableHeaderCellComponent
                  key={col.label.toString()}
                  sx={col.sx}
                  data-testid={`generic-table-header-${col.label.toString()}`}
                >
                  {!col.sortDisabled ? (
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
                </TableHeaderCellComponent>
              ))}
            </TableRow>
          </TableHeadComponent>
        )}
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
                      <TableBodyCellComponent
                        key={`${itemKey}_${col.label}`}
                        sx={{
                          borderBottom:
                            idx !== (data?.length ?? 0) - 1 ? "1px solid #6B7294" : "none",
                        }}
                      >
                        {col.renderValue(d)}
                      </TableBodyCellComponent>
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
      {(position === "bottom" || position === "both") && (
        <TablePagination
          data={data}
          total={total}
          perPage={perPage}
          page={page < total / perPage ? page : 0}
          emptyRows={emptyRows}
          loading={loading}
          verticalPlacement="bottom"
          placement={paginationPlacement}
          AdditionalActions={AdditionalActions}
          onPageChange={(_, newPage) => handlePageChange(newPage - 1)}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </StyledTableContainer>
  );
};

const TableWithRef = forwardRef(GenericTable) as <T>(
  props: Props<T> & { ref?: React.Ref<TableMethods> }
) => ReturnType<typeof GenericTable>;

export default TableWithRef;
