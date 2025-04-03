import { memo } from "react";
import { DataGrid, DataGridProps, gridClasses } from "@mui/x-data-grid";
import { styled, Theme } from "@mui/material";

const customCheckbox = (theme: Theme) => ({
  "& .MuiCheckbox-root svg": {
    width: 24,
    height: 24,
    backgroundColor: "transparent",
    //   border: `1px solid ${theme.palette.mode === "light" ? "#d9d9d9" : "rgb(67, 67, 67)"}`,
    // borderRadius: 2,
  },
  "& .MuiDataGrid-columnHeader svg": {
    color: "#FFF",
  },
  //   "& .MuiCheckbox-root svg path": {
  //     display: "none",
  //   },
  //   "& .MuiCheckbox-root.Mui-checked:not(.MuiCheckbox-indeterminate) svg": {
  //     backgroundColor: "#1890ff",
  //     borderColor: "#1890ff",
  //   },
  //   "& .MuiCheckbox-root.Mui-checked .MuiIconButton-label:after": {
  //     position: "absolute",
  //     display: "table",
  //     border: "2px solid #fff",
  //     borderTop: 0,
  //     borderLeft: 0,
  //     transform: "rotate(45deg) translate(-50%,-50%)",
  //     opacity: 1,
  //     transition: "all .2s cubic-bezier(.12,.4,.29,1.46) .1s",
  //     content: '""',
  //     top: "50%",
  //     left: "39%",
  //     width: 5.71428571,
  //     height: 9.14285714,
  //   },
  //   "& .MuiCheckbox-root.MuiCheckbox-indeterminate .MuiIconButton-label:after": {
  //     width: 8,
  //     height: 8,
  //     backgroundColor: "#1890ff",
  //     transform: "none",
  //     top: "39%",
  //     border: 0,
  //   },
});

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  borderRadius: "8px",
  border: "1px solid #6CACDA",
  color: "rgba(0, 0, 0, 0.85)",
  WebkitFontSmoothing: "antialiased",
  letterSpacing: "normal",
  "& .MuiDataGrid-columnsContainer": {
    backgroundColor: "#fafafa",
  },
  "& .MuiDataGrid-iconSeparator": {
    display: "none",
  },
  "& .MuiDataGrid-sortIcon": {
    color: "#FFF",
  },
  "& .MuiDataGrid-container--top [role=row]": {
    background: "#4D7C8F",
  },
  "& .MuiDataGrid-columnHeaderTitle": {
    fontWeight: 700,
    fontSize: "14px",
    lineHeight: "16px",
    color: "#FFF",
  },
  "& .MuiDataGrid-columnHeader, .MuiDataGrid-cell": {
    borderBottom: "2px solid #083A50",
  },
  "& .MuiDataGrid-columnsContainer, .MuiDataGrid-cell": {
    borderBottom: "1px solid #f0f0f0",
  },
  "& .MuiDataGrid-cell": {
    fontSize: "14px",
    color: "#083A50",
    fontFamily: "'Nunito', 'Rubik', sans-serif",
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "19.6px",
    alignContent: "center",
  },
  "& .MuiPaginationItem-root": {
    borderRadius: 0,
  },
  [`& .${gridClasses.row}.even`]: {
    backgroundColor: "#FFF",
  },
  [`& .${gridClasses.row}.odd`]: {
    backgroundColor: "#E3EEF9",
  },
  ...customCheckbox(theme),
}));

type Props = DataGridProps;

const GenericTableRework = ({ ...rest }: Props) => (
  <StyledDataGrid
    {...rest}
    initialState={{
      pagination: {
        paginationModel: {
          pageSize: 20,
        },
      },
    }}
    getRowId={(row) => row._id}
    getRowClassName={(params) => (params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd")}
    pageSizeOptions={[5, 10, 20, 50]}
    checkboxSelection
    disableRowSelectionOnClick
    disableColumnMenu
    disableColumnFilter
  />
);

export default memo(GenericTableRework);
