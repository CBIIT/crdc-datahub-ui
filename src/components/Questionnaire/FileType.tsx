import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { FC, useState } from "react";
import { makeStyles } from '@mui/styles';

function createData(
  fileType: string,
  numberOfFiles: number,
  amountOfData: string,
) {
  return { fileType, numberOfFiles, amountOfData };
}

const rows = [
  createData('test1', 1, "1tb"),
  createData('test1', 1, "1tb"),
  createData('test1', 1, "1tb"),

];

const useStyles = makeStyles({
  tableContainer: {
    border: '1px solid #6B7294',
    borderRadius: '10px',

  },
  noBorder: {
    border: "none"
  },
  rightBorder: {
    borderTop: 'none',
    borderRight: '1px solid #6B7294',
    borderBottom: 'none',
    borderLeft: 'none'
  },
  tableCell: {
    borderTop: '1px solid #6B7294',
    borderRight: '1px solid #6B7294',
    borderBottom: 'none',
    borderLeft: 'none'
  },
  tableCellRight: {
    borderTop: '1px solid #6B7294',
    borderRight: 'none',
    borderBottom: 'none',
    borderLeft: 'none'
  }
});
type Props = {
  index: number;
  data: FileTypeData | null;
  onDelete: () => void;
};
const FileTypeTable: FC = () => {
    const classes = useStyles();

    return (
      <TableContainer className={classes.tableContainer}>
        <Table className={classes.noBorder}>
          <TableHead className={classes.noBorder}>
            <TableRow className={classes.noBorder}>
              <TableCell className={classes.rightBorder}>File Type</TableCell>
              <TableCell className={classes.rightBorder}>Number of Files</TableCell>
              <TableCell className={classes.rightBorder}>Estimated amount of data (KB, MB, GB, TB)</TableCell>
              <TableCell className={classes.noBorder}>Remove</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.fileType + row.numberOfFiles.toString() + row.amountOfData}
              >
                <TableCell className={classes.tableCell}>{row.fileType}</TableCell>
                <TableCell className={classes.tableCell}>{row.numberOfFiles}</TableCell>
                <TableCell className={classes.tableCell}>{row.amountOfData}</TableCell>
                <TableCell className={classes.tableCellRight}>remove</TableCell>
              </TableRow>
          ))}
          </TableBody>
        </Table>
      </TableContainer>
  );
};

export default FileTypeTable;
