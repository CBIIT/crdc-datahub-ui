import { Skeleton, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { FC, memo } from "react";
import { RetrieveReleasedDataResp } from "../../graphql";

const TableBodySkeleton = () => (
  <>
    <TableRow>
      <TableCell>Existing</TableCell>
      <TableCell>
        <Skeleton variant="text" width="100%" height={24} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width="100%" height={24} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width="100%" height={24} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width="100%" height={24} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width="100%" height={24} />
      </TableCell>
    </TableRow>
    <TableRow>
      <TableCell>New</TableCell>
      <TableCell>
        <Skeleton variant="text" width="100%" height={24} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width="100%" height={24} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width="100%" height={24} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width="100%" height={24} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width="100%" height={24} />
      </TableCell>
    </TableRow>
  </>
);

export type NodeComparisonTableProps = {
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
const NodeComparisonTable: FC<NodeComparisonTableProps> = ({ newNode, existingNode, loading }) => (
  <Table data-testid="node-comparison-table">
    <TableHead>
      <TableRow>
        <TableCell />
        <TableCell>Col 1</TableCell>
        <TableCell>Col 2</TableCell>
        <TableCell>Col 3</TableCell>
        <TableCell>Col 4</TableCell>
        <TableCell>Col 5</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {loading ? (
        <TableBodySkeleton />
      ) : (
        <>
          <TableRow>
            <TableCell>Existing</TableCell>
            <TableCell>Data 1</TableCell>
            <TableCell>Data 2</TableCell>
            <TableCell>Data 3</TableCell>
            <TableCell>Data 4</TableCell>
            <TableCell>Data 5</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>New</TableCell>
            <TableCell>Data 1</TableCell>
            <TableCell>Data 2</TableCell>
            <TableCell>Data 3</TableCell>
            <TableCell>Data 4</TableCell>
            <TableCell>Data 5</TableCell>
          </TableRow>
        </>
      )}
    </TableBody>
  </Table>
);

export default memo<NodeComparisonTableProps>(NodeComparisonTable);
