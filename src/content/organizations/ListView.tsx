import React, { FC, useEffect, useMemo, useState } from "react";
import { useQuery } from '@apollo/client';
import {
  Alert, Box, Button, CircularProgress,
  Container, FormControl, MenuItem,
  OutlinedInput,
  Select, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TablePagination, TableRow,
  TableSortLabel, Typography, styled,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { Controller, useForm } from 'react-hook-form';
import PageBanner from "../../components/PageBanner";
import { LIST_ORGS, ListOrgsResp } from '../../graphql';
import Tooltip from '../../components/Tooltip';

type T = Partial<Organization>;

type Column = {
  label: string;
  value: (a: T) => string | boolean | number | React.ReactNode;
  default?: true;
  comparator?: (a: T, b: T) => number;
};

type FilterForm = {
  organization: string;
  study: string;
  status: Organization["status"] | "All";
};

const StyledContainer = styled(Container)({
  marginTop: "-210px",
});

const StyledTableContainer = styled(TableContainer)({
  borderRadius: "8px",
  border: "1px solid #083A50",
  marginBottom: "25px",
  position: "relative",
});

const StyledFilterContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  paddingBottom: "10px",
});

const StyledTableHead = styled(TableHead)({
  background: "#083A50",
});

const StyledFormControl = styled(FormControl)({
  margin: "10px",
  marginRight: "15px",
  minWidth: "250px",
});

const StyledInlineLabel = styled('label')({
  padding: "0 10px",
  fontWeight: "700"
});

const baseTextFieldStyles = {
  borderRadius: "8px",
  "& .MuiInputBase-input": {
    fontWeight: 400,
    fontSize: "16px",
    fontFamily: "'Nunito', 'Rubik', sans-serif",
    padding: "10px",
    height: "20px",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#6B7294",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    border: "1px solid #209D7D",
    boxShadow: "2px 2px 4px 0px rgba(38, 184, 147, 0.10), -1px -1px 6px 0px rgba(38, 184, 147, 0.20)",
  },
  "& .Mui-disabled": {
    WebkitTextFillColor: "#fff !important",
    cursor: "not-allowed",
  },
};

const StyledTextField = styled(OutlinedInput)(baseTextFieldStyles);
const StyledSelect = styled(Select)(baseTextFieldStyles);

const StyledHeaderCell = styled(TableCell)({
  fontWeight: 700,
  fontSize: "16px",
  color: "#fff !important",
  "&.MuiTableCell-root": {
    padding: "8px 16px",
    color: "#fff !important",
  },
  "& .MuiSvgIcon-root,  & .MuiButtonBase-root": {
    color: "#fff !important",
  },
  "&:last-of-type": {
    textAlign: "center",
  },
});

const StyledTableCell = styled(TableCell)({
  fontSize: "16px",
  color: "#083A50 !important",
  "&.MuiTableCell-root": {
    padding: "8px 16px",
  },
  "&:last-of-type": {
    textAlign: "center",
  },
});

const StyledActionButton = styled(Button)(
  ({ bg, text, border }: { bg: string; text: string; border: string }) => ({
    background: `${bg} !important`,
    borderRadius: "8px",
    border: `2px solid ${border}`,
    color: `${text} !important`,
    width: "100px",
    height: "30px",
    textTransform: "none",
    fontWeight: 700,
    fontSize: "16px",
  })
);

const columns: Column[] = [
  {
    label: "Name",
    value: (a) => a.name,
    comparator: (a, b) => a.name.localeCompare(b.name),
  },
  {
    label: "Primary Contact",
    value: (a) => a.conciergeName,
    comparator: (a, b) => a?.conciergeName?.localeCompare(b?.conciergeName),
  },
  {
    label: "Studies",
    value: ({ _id, studies }) => (
      <Stack direction="row">
        <Typography variant="body1">
          {studies?.slice(0, 2).map((s) => s.studyAbbreviation).join(", ")}
          {studies?.length > 2 && ", ..."}
        </Typography>
        {studies?.length > 0 && (
          <Tooltip
            title={(
              <Typography variant="body1">
                {studies.map(({ studyName, studyAbbreviation }) => (
                  <React.Fragment key={`${_id}_study_${studyName}`}>
                    {studyName}
                    {" ("}
                    {studyAbbreviation}
                    {") "}
                    <br />
                  </React.Fragment>
                ))}
              </Typography>
            )}
            placement="top"
            arrow
          />
        )}
      </Stack>
    ),
  },
  {
    label: "Status",
    value: (a) => a.status,
    comparator: (a, b) => a.status.localeCompare(b.status),
  },
  {
    label: "Action",
    value: (a) => (
      <Link to={`/organizations/${a?.["_id"]}`}>
        <StyledActionButton bg="#74D9E7" text="#156071" border="#84B4BE">
          Edit
        </StyledActionButton>
      </Link>
    ),
  },
];

/**
 * View for List of Organizations
 *
 * @returns {JSX.Element}
 */
const ListingView: FC = () => {
  const { state } = useLocation();

  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState<Column>(columns.find((c) => c.default) || columns.find((c) => !!c.comparator));
  const [page, setPage] = useState<number>(0);
  const [perPage, setPerPage] = useState<number>(20);
  const [dataset, setDataset] = useState<T[]>([]);
  const [count, setCount] = useState<number>(0);

  const { watch, register, control } = useForm<FilterForm>();
  const orgFilter = watch("organization");
  const studyFilter = watch("study");
  const statusFilter = watch("status");

  const { data, loading, error } = useQuery<ListOrgsResp>(LIST_ORGS, {
    context: { clientName: 'userService' },
    fetchPolicy: "no-cache",
  });

  // eslint-disable-next-line arrow-body-style
  const emptyRows = useMemo(() => {
    return page > 0 && count
      ? Math.max(0, page * perPage - count)
      : 0;
  }, [count, perPage, page]);

  const handleRequestSort = (column: Column) => {
    setOrder(orderBy === column && order === "asc" ? "desc" : "asc");
    setOrderBy(column);
    setPage(0);
  };

  const handleChangeRowsPerPage = (event) => {
    setPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    if (!data?.listOrganizations?.length) {
      setDataset([]);
      setCount(0);
      return;
    }

    const sorted = data.listOrganizations
      .filter((u: T) => (orgFilter && orgFilter.length > 0 ? u.name.toLowerCase().indexOf(orgFilter.toLowerCase()) !== -1 : true))
      .filter((u: T) => (statusFilter && statusFilter !== "All" ? u.status === statusFilter : true))
      .filter((u: T) => {
          if (!studyFilter || studyFilter.trim().length < 1) {
            return true;
          }

          const nameMatch = u?.studies?.some((s) => s.studyName.toLowerCase().indexOf(studyFilter.toLowerCase()) !== -1);
          const abbrMatch = u?.studies?.some((s) => s.studyAbbreviation.toLowerCase().indexOf(studyFilter.toLowerCase()) !== -1);

          return nameMatch || abbrMatch;
      })
      .sort((a, b) => orderBy?.comparator(a, b) || 0);

    if (order === "desc") {
      sorted.reverse();
    }

    setCount(sorted.length);
    setDataset(sorted.slice(page * perPage, (page * perPage) + perPage));
  }, [data, perPage, page, orderBy, order, studyFilter, orgFilter, statusFilter]);

  useEffect(() => {
    setPage(0);
  }, [orgFilter, studyFilter, statusFilter]);

  return (
    <>
      <PageBanner title="Manage Organizations" subTitle="" padding="15px 0 0 25px" />

      <StyledContainer maxWidth="xl">
        {(state?.error || error) && (
          <Alert sx={{ mb: 3, p: 2 }} severity="error">
            {state?.error || "An error occurred while loading the data."}
          </Alert>
        )}

        <StyledFilterContainer>
          <StyledInlineLabel>Organization</StyledInlineLabel>
          <StyledFormControl>
            <StyledTextField {...register("organization")} placeholder="Enter a Organization" required />
          </StyledFormControl>
          <StyledInlineLabel>Study</StyledInlineLabel>
          <StyledFormControl>
            <StyledTextField {...register("study")} placeholder="Enter a Study" required />
          </StyledFormControl>
          <StyledInlineLabel>Status</StyledInlineLabel>
          <StyledFormControl>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <StyledSelect
                  {...field}
                  defaultValue="All"
                  value={field.value || "All"}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </StyledSelect>
              )}
            />
          </StyledFormControl>
        </StyledFilterContainer>
        <StyledTableContainer>
          <Table>
            <StyledTableHead>
              <TableRow>
                {columns.map((col: Column) => (
                  <StyledHeaderCell key={col.label}>
                    {col.comparator ? (
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
              {loading && (
                <TableRow>
                  <TableCell>
                    <Box
                      sx={{
                        position: "absolute",
                        background: "#fff",
                        left: 0,
                        top: 0,
                        width: "100%",
                        height: "100%",
                        zIndex: "9999",
                      }}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <CircularProgress size={64} disableShrink thickness={3} />
                    </Box>
                  </TableCell>
                </TableRow>
              )}
              {dataset.map((d: T) => (
                <TableRow tabIndex={-1} hover key={`${d["_id"]}`}>
                  {columns.map((col: Column) => (
                    <StyledTableCell key={`${d["_id"]}_${col.label}`}>
                      {col.value(d)}
                    </StyledTableCell>
                  ))}
                </TableRow>
              ))}

              {/* Fill the difference between perPage and count to prevent height changes */}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={columns.length} />
                </TableRow>
              )}

              {/* No content message */}
              {(!dataset.length || dataset.length === 0) && (
                <TableRow style={{ height: 53 * 10 }}>
                  <TableCell colSpan={columns.length}>
                    <Typography
                      variant="h6"
                      align="center"
                      fontSize={18}
                      color="#AAA"
                    >
                      No users found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 20, 50]}
            component="div"
            count={count}
            rowsPerPage={perPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={handleChangeRowsPerPage}
            nextIconButtonProps={{
              disabled:
                perPage === -1
                || !dataset
                || dataset.length === 0
                || count <= (page + 1) * perPage
                || emptyRows > 0
                || loading,
            }}
            backIconButtonProps={{ disabled: page === 0 || loading }}
          />
        </StyledTableContainer>
      </StyledContainer>
    </>
  );
};

export default ListingView;
