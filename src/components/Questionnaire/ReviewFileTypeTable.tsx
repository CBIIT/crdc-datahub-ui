import React from "react";
import styled from "styled-components";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";
import { addSpace } from "../../utils";

const StyledTableContainer = styled(TableContainer)(() => ({
  borderRadius: "8px !important",
  border: "1px solid #6B7294",
  overflow: "hidden",
}));

const StyledTableRow = styled(TableRow)(() => ({
  "&.MuiTableRow-root": {
    display: "flex",
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
      <TableBody>
        {files.map((file: FileInfo) => (
          <StyledTableRow key={`${file.type}-${file.count}-${file.amount}`}>
            <StyledTableCell style={{ flex: 1 }}>{file.type}</StyledTableCell>
            <StyledTableCellNumber style={{ flex: "0 0 17%" }}>
              {file.count}
            </StyledTableCellNumber>
            <StyledTableCellNumber style={{ flex: "0 0 23%" }}>
              {addSpace(file.amount)}
            </StyledTableCellNumber>
          </StyledTableRow>
        ))}
      </TableBody>
    </Table>
  </StyledTableContainer>
);

export default ReviewFileTypeTable;
