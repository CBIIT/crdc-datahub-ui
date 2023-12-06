import React, { FC, useEffect, useMemo, useState } from "react";
import { useQuery } from '@apollo/client';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  MenuItem,
  Select,
  Table, TableBody, TableCell,
  TableContainer, TableHead, TablePagination, TableRow,
  TableSortLabel, Typography,
  styled,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { Controller, useForm } from 'react-hook-form';
import { useOrganizationListContext } from '../../components/Contexts/OrganizationListContext';
import PageBanner from "../../components/PageBanner";
import { Roles } from '../../config/AuthRoles';
import { LIST_USERS, ListUsersResp } from '../../graphql';
import { formatIDP } from '../../utils';
import { useAuthContext } from '../../components/Contexts/AuthContext';

type T = User;

type Column = {
  label: string;
  value: (a: T) => string | boolean | number | React.ReactNode;
  default?: true;
  comparator?: (a: T, b: T) => number;
};

type FilterForm = {
  organization: OrgInfo["orgID"] | "All";
  role: User["role"] | "All";
  status: User["userStatus"] | "All";
};

const StyledContainer = styled(Container)({
  marginTop: "-180px",
  paddingBottom: "90px",
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

const StyledSelect = styled(Select)({
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
    cursor: "not-allowed",
  },
  "& .MuiList-root": {
    padding: "0 !important",
  },
  "& .MuiMenuItem-root.Mui-selected": {
    background: "#3E7E6D !important",
    color: "#FFFFFF !important",
  },
  "& .MuiMenuItem-root:hover": {
    background: "#D5EDE5",
  },
});

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

const StyledTablePagination = styled(TablePagination)<{ component: React.ElementType }>({
  borderTop: "2px solid #083A50",
  background: "#F5F7F8",
});

const columns: Column[] = [
  {
    label: "Name",
    value: (a) => `${a.lastName ? `${a.lastName}, ` : ""}${a.firstName || ""}`,
    comparator: (a, b) => {
      const aName = `${a.lastName ? `${a.lastName}, ` : ""}${a.firstName || ""}`;
      const bName = `${b.lastName ? `${b.lastName}, ` : ""}${b.firstName || ""}`;

      return aName.localeCompare(bName);
    }
  },
  {
    label: "Account Type",
    value: (a) => formatIDP(a.IDP),
    comparator: (a, b) => a.IDP.localeCompare(b.IDP),
  },
  {
    label: "Email",
    value: (a) => a.email,
    comparator: (a, b) => a.email.localeCompare(b.email),
  },
  {
    label: "Organization",
    value: (a) => a.organization?.orgName || "",
    comparator: (a, b) => {
      const aOrg = a.organization?.orgName || "";
      const bOrg = b.organization?.orgName || "";

      return aOrg.localeCompare(bOrg);
    }
  },
  {
    label: "Status",
    value: (a) => a.userStatus,
    comparator: (a, b) => a.userStatus.localeCompare(b.userStatus),
  },
  {
    label: "Role",
    value: (a) => a.role,
    comparator: (a, b) => a.role.localeCompare(b.role),
  },
  {
    label: "Action",
    value: (a) => (
      <Link to={`/users/${a?.["_id"]}`}>
        <StyledActionButton bg="#C5EAF2" text="#156071" border="#84B4BE">
          Edit
        </StyledActionButton>
      </Link>
    ),
  },
];

/**
 * View for List of Users
 *
 * @returns {JSX.Element}
 */
const ListingView: FC = () => {
  const { user } = useAuthContext();
  const { state } = useLocation();
  const { data: orgData } = useOrganizationListContext();

  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<Column>(columns.find((c) => c.default) || columns.find((c) => !!c.comparator));
  const [page, setPage] = useState<number>(0);
  const [perPage, setPerPage] = useState<number>(20);
  const [dataset, setDataset] = useState<T[]>([]);
  const [count, setCount] = useState<number>(0);

  const { watch, setValue, control } = useForm<FilterForm>();
  const orgFilter = watch("organization");
  const roleFilter = watch("role");
  const statusFilter = watch("status");

  const { data, loading, error } = useQuery<ListUsersResp>(LIST_USERS, {
    context: { clientName: 'backend' },
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
    if (user.role !== "Organization Owner") {
      return;
    }

    const orgID = orgData?.find((org: Organization) => org._id === user.organization?.orgID)?._id;
    setValue("organization", orgID || "All");
  }, [user, orgData]);

  useEffect(() => {
    if (!data?.listUsers?.length) {
      setDataset([]);
      setCount(0);
      return;
    }

    const sorted = data.listUsers
      .filter((u: T) => (orgFilter && orgFilter !== "All" ? u.organization?.orgID === orgFilter : true))
      .filter((u: T) => (roleFilter && roleFilter !== "All" ? u.role === roleFilter : true))
      .filter((u: T) => (statusFilter && statusFilter !== "All" ? u.userStatus === statusFilter : true))
      .sort((a, b) => orderBy?.comparator(a, b) || 0);

    if (order === "desc") {
      sorted.reverse();
    }

    setCount(sorted.length);
    setDataset(sorted.slice(page * perPage, (page * perPage) + perPage));
  }, [data, perPage, page, orderBy, order, roleFilter, orgFilter, statusFilter]);

  useEffect(() => {
    setPage(0);
  }, [orgFilter, roleFilter, statusFilter]);

  return (
    <>
      <PageBanner title="Manage Users" subTitle="" padding="38px 0 0 25px" />

      <StyledContainer maxWidth="xl">
        {(state?.error || error) && (
          <Alert sx={{ mb: 3, p: 2 }} severity="error">
            {state?.error || "An error occurred while loading the data."}
          </Alert>
        )}

        <StyledFilterContainer>
          <StyledInlineLabel>Organization</StyledInlineLabel>
          <StyledFormControl>
            <Controller
              name="organization"
              control={control}
              render={({ field }) => (
                <StyledSelect
                  {...field}
                  disabled={user.role === "Organization Owner"}
                  defaultValue="All"
                  value={field.value || "All"}
                  MenuProps={{ disablePortal: true }}
                >
                  <MenuItem value="All">All</MenuItem>
                  {orgData?.map((org: Organization) => <MenuItem key={org._id} value={org._id}>{org.name}</MenuItem>)}
                </StyledSelect>
              )}
            />
          </StyledFormControl>
          <StyledInlineLabel>Role</StyledInlineLabel>
          <StyledFormControl>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <StyledSelect
                  {...field}
                  defaultValue="All"
                  value={field.value || "All"}
                  MenuProps={{ disablePortal: true }}
                >
                  <MenuItem value="All">All</MenuItem>
                  {Roles.map((role) => <MenuItem key={role} value={role}>{role}</MenuItem>)}
                </StyledSelect>
              )}
            />
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
                  MenuProps={{ disablePortal: true }}
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
          <StyledTablePagination
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
