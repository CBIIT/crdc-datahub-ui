import React from "react";
import styled from "styled-components";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { addSpace } from "../../utils";

const StyledTableContainer = styled(TableContainer)(() => ({
  borderRadius: "8px !important",
  border: "1px solid #6B7294",
  overflow: "hidden",
}));

const StyledTableHeaderRow = styled(TableRow)(() => ({
  "&.MuiTableRow-root": {
    height: "40px",
    padding: 0,
    justifyContent: "space-between",
    alignItems: "center",
    background: "#FFF",
    borderBottom: "1px solid #6B7294",
  },
}));

const StyledTableRow = styled(TableRow)(() => ({
  "&.MuiTableRow-root": {
    height: "40px",
    padding: 0,
    justifyContent: "space-between",
    alignItems: "center",
    background: "#FFF",
    borderBottom: "1px solid #6B7294",
    "&:last-child": {
      borderBottom: "none",
    },
  },
}));

const StyledTableHeaderCell = styled(TableCell)(() => ({
  "&.MuiTableCell-root": {
    height: "100%",
    color: "#083A50",
    fontFamily: "'Nunito', 'Rubik', sans-serif",
    fontSize: '16px',
    fontStyle: "normal",
    fontWeight: 700,
    lineHeight: "19.6px",
    padding: "10px 20px",
    borderBottom: "0 !important",
    borderRight: "1px solid #6B7294",
    "&:last-child": {
      borderRight: "none",
    },
  },
}));

const StyledTableCell = styled(TableCell)(() => ({
  "&.MuiTableCell-root": {
    height: "100%",
    color: "#083A50",
    fontFamily: "'Nunito', 'Rubik', sans-serif",
    fontSize: "16px",
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "19.6px",
    padding: "10px 20px",
    borderBottom: "0 !important",
    borderRight: "1px solid #6B7294",
    "&:last-child": {
      borderRight: "none",
    },
  },
}));

const StyledTableCellNumber = styled(TableCell)(() => ({
  "&.MuiTableCell-root": {
    height: "100%",
    color: "#346798",
    fontFamily: "'Inter'",
    fontSize: "15px",
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "normal",
    padding: "11px 15px",
    borderBottom: "0 !important",
    borderRight: "1px solid #6B7294",
    "&:last-child": {
      borderRight: "none",
    },
  },
}));

type ReviewFileTypeTableProps = {
  files: FileInfo[];
};

const ReviewFileTypeTable: React.FC<ReviewFileTypeTableProps> = ({ files }) => (
  <StyledTableContainer>
    <Table>
      <TableHead>
        <StyledTableHeaderRow>
          <StyledTableHeaderCell width="auto">File Type</StyledTableHeaderCell>
          <StyledTableHeaderCell width="25%">File Extension</StyledTableHeaderCell>
          <StyledTableHeaderCell width="17%">Number of files</StyledTableHeaderCell>
          <StyledTableHeaderCell width="25%">Estimated data size</StyledTableHeaderCell>
        </StyledTableHeaderRow>
      </TableHead>
      <TableBody>
        {files.map((file: FileInfo) => (
          <StyledTableRow key={`${file.type}-${file.count}-${file.amount}`}>
            <StyledTableCell width="auto">{file.type}</StyledTableCell>
            <StyledTableCell width="25%">{file.extension}</StyledTableCell>
            <StyledTableCellNumber width="17%">
              {file.count}
            </StyledTableCellNumber>
            <StyledTableCellNumber width="25%">
              {addSpace(file.amount)}
            </StyledTableCellNumber>
          </StyledTableRow>
        ))}
      </TableBody>
    </Table>
  </StyledTableContainer>
);

export default ReviewFileTypeTable;
