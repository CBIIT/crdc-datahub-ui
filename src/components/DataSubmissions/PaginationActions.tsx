import {
  Pagination,
  PaginationItem,
  PaginationRenderItemParams,
  TablePaginationProps,
  styled,
} from "@mui/material";

const StyledPagination = styled(Pagination)(() => ({
  marginLeft: "23px",
  marginRight: "30.59px",
  "& .MuiPagination-ul": {
    flexWrap: "nowrap",
  },
  "& .MuiPaginationItem-root": {
    margin: 0,
    textAlign: "center",
    fontVariantNumeric: "lining-nums tabular-nums",
    fontFamily: "Lato, sans-serif",
    fontSize: "14px",
    fontStyle: "normal",
    lineHeight: "14.913px",
    letterSpacing: "0.14px",
    borderWidth: "1px 0 1px 1px",
    borderStyle: "solid",
    borderColor: "#415B88",
    background: "#FFF",
    borderRadius: 0,
    height: "27px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  "& .MuiPagination-ul li:last-of-type .MuiPaginationItem-root": {
    borderRightWidth: "1px",
  },
}));
const StyledPaginationItem = styled(PaginationItem)(({ selected }) => ({
  color: selected ? "#004187" : "#415B88",
  fontWeight: selected ? 700 : 400,
  "&.MuiPaginationItem-root.Mui-selected": {
    background: "#FFFFFF",
  },
}));

const PaginationActions = ({
  count,
  page,
  // onChange,
  rowsPerPage,
  onPageChange,
}: TablePaginationProps) => (
  <StyledPagination
    count={Math.ceil(count / rowsPerPage)}
    page={page}
    onChange={onPageChange}
    variant="outlined"
    shape="rounded"
    renderItem={(params: PaginationRenderItemParams) => (
      <StyledPaginationItem {...params} />
    )}
  />
);

export default PaginationActions;
