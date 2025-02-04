import {
  Alert,
  Skeleton,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { FC, memo, useMemo } from "react";
import { RetrieveReleasedDataResp } from "../../graphql";
import { safeParse } from "../../utils";
import Repeater from "../Repeater";

const StyledAlert = styled(Alert)({
  marginTop: "12px",
});

const StyledTableContainer = styled(TableContainer)({
  marginTop: "12px",
  paddingBottom: "6px",
  overflow: "hidden",
});

const StyledTable = styled(Table)({
  overflowX: "auto",
  display: "block",
  backgroundColor: "#fff",
  tableLayout: "auto",
  borderCollapse: "separate",
  // NOTE: The first element in this thead is a TD, not a TH
  "& thead tr:first-of-type td:first-of-type": {
    borderTopLeftRadius: "8px",
  },
  "& thead tr:first-of-type th:last-child": {
    borderTopRightRadius: "8px",
  },
  "& tbody tr:last-child td:first-of-type": {
    borderBottomLeftRadius: "8px",
  },
  "& tbody tr:last-child td:last-child": {
    borderBottomRightRadius: "8px",
  },
});

const StyledTableHead = styled(TableHead)({
  "& .MuiTableRow-root th": {
    fontWeight: 700,
  },
});

const StyledTableCell = styled(TableCell)({
  color: "#083A50",
  whiteSpace: "nowrap",
  overflow: "hidden",
  border: "0.5px solid #a7a7a7",
  padding: "8px 15px",
});

/**
 * The number of placeholder columns to display in the loading state
 */
const PLACEHOLDER_NUM_COLS = 5;

export type ComparisonTableProps = {
  /**
   * The new node to be compared
   */
  newNode: RetrieveReleasedDataResp["retrieveReleasedDataByID"][number];
  /**
   * The existing node to be compared
   */
  existingNode: RetrieveReleasedDataResp["retrieveReleasedDataByID"][number];
  /**
   * A boolean indicating whether the data is in a loading state
   */
  loading: boolean;
};

/**
 * Builds a dynamic table to compare the dataset between two data records
 * Handles loading state
 *
 * @returns The NodeComparisonTable component
 */
const ComparisonTable: FC<ComparisonTableProps> = ({ newNode, existingNode, loading }) => {
  const newProps = useMemo<Record<string, string | number>>(
    () => safeParse(newNode?.props),
    [newNode]
  );

  const existingProps = useMemo<Record<string, string | number>>(
    () => safeParse(existingNode?.props),
    [existingNode]
  );

  const allPropertyNames = useMemo<string[]>(() => {
    const newKeys = Object.keys(newProps);
    const existingKeys = Object.keys(existingProps);
    return [...new Set([...newKeys, ...existingKeys])];
  }, [newProps, existingProps]);

  if (!loading && !allPropertyNames.length) {
    return (
      <StyledAlert severity="warning" data-testid="node-comparison-error">
        Unable to show comparison of data.
      </StyledAlert>
    );
  }

  // TODO: check loading state styling (it wasn't taking up the full width)

  return (
    <StyledTableContainer>
      <StyledTable data-testid="node-comparison-table" size="small">
        <StyledTableHead>
          <TableRow>
            <StyledTableCell component="td" />
            {loading ? (
              <TableHeaderSkeleton />
            ) : (
              allPropertyNames.map((property) => (
                <StyledTableCell key={property}>{property}</StyledTableCell>
              ))
            )}
          </TableRow>
        </StyledTableHead>
        <TableBody>
          {loading ? (
            <TableBodySkeleton />
          ) : (
            <>
              <TableRow data-testid="node-comparison-table-existing">
                <StyledTableCell>Existing</StyledTableCell>
                {allPropertyNames.map((property) => (
                  <StyledTableCell key={property}>
                    {existingProps?.[property] || ""}
                  </StyledTableCell>
                ))}
              </TableRow>
              <TableRow data-testid="node-comparison-table-new">
                <StyledTableCell>New</StyledTableCell>
                {allPropertyNames.map((property) => (
                  <StyledTableCell key={property}>{newProps?.[property] || ""}</StyledTableCell>
                ))}
              </TableRow>
            </>
          )}
        </TableBody>
      </StyledTable>
    </StyledTableContainer>
  );
};

/**
 * A skeleton table header to display while the data is loading
 *
 * @returns The TableHeaderSkeleton component
 */
const TableHeaderSkeleton: FC = () => (
  <Repeater count={PLACEHOLDER_NUM_COLS}>
    <StyledTableCell component="td" data-testid="node-comparison-table-header-skeleton">
      <Skeleton variant="text" width="100%" height={24} />
    </StyledTableCell>
  </Repeater>
);

/**
 * A skeleton table body to display while the data is loading
 *
 * @returns The TableBodySkeleton component
 */
const TableBodySkeleton: FC = () => (
  <>
    <TableRow>
      <StyledTableCell>Existing</StyledTableCell>
      <Repeater count={PLACEHOLDER_NUM_COLS}>
        <StyledTableCell>
          <Skeleton variant="text" width="100%" height={24} />
        </StyledTableCell>
      </Repeater>
    </TableRow>
    <TableRow>
      <StyledTableCell>New</StyledTableCell>
      <Repeater count={PLACEHOLDER_NUM_COLS}>
        <StyledTableCell>
          <Skeleton variant="text" width="100%" height={24} />
        </StyledTableCell>
      </Repeater>
    </TableRow>
  </>
);

export default memo<ComparisonTableProps>(ComparisonTable);
