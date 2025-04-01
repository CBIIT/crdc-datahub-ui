import React, { FC, useEffect, useRef, useState } from "react";
import { useQuery } from "@apollo/client";
import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  MenuItem,
  Select,
  Stack,
  TableCell,
  TableHead,
  styled,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import PageBanner from "../../components/PageBanner";
import { Roles } from "../../config/AuthRoles";
import { LIST_USERS, ListUsersResp } from "../../graphql";
import { compareStrings, formatIDP, sortData } from "../../utils";
import usePageTitle from "../../hooks/usePageTitle";
import GenericTable, { Column } from "../../components/GenericTable";
import { useSearchParamsContext } from "../../components/Contexts/SearchParamsContext";

type T = ListUsersResp["listUsers"][number];

type FilterForm = {
  role: User["role"] | "All";
  status: User["userStatus"] | "All";
};

const StyledContainer = styled(Container)({
  marginTop: "-180px",
  paddingBottom: "90px",
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

const StyledInlineLabel = styled("label")({
  padding: "0 10px",
  fontWeight: "700",
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
    boxShadow:
      "2px 2px 4px 0px rgba(38, 184, 147, 0.10), -1px -1px 6px 0px rgba(38, 184, 147, 0.20)",
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
  fontSize: "14px",
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
  fontSize: "14px",
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

type TouchedState = { [K in keyof FilterForm]: boolean };

const initialTouchedFields: TouchedState = {
  role: false,
  status: false,
};

const columns: Column<T>[] = [
  {
    label: "Name",
    renderValue: (a) => `${a.lastName ? `${a.lastName}, ` : ""}${a.firstName || ""}`,
    comparator: (a, b) => {
      const aName = `${a.lastName ? `${a.lastName}, ` : ""}${a.firstName || ""}`;
      const bName = `${b.lastName ? `${b.lastName}, ` : ""}${b.firstName || ""}`;

      return compareStrings(aName, bName);
    },
    default: true,
    sx: {
      width: "18%",
    },
    fieldKey: "name",
  },
  {
    label: "Account Type",
    renderValue: (a) => formatIDP(a.IDP),
    comparator: (a, b) => a.IDP.localeCompare(b.IDP),
    field: "IDP",
    sx: {
      width: "13%",
    },
  },
  {
    label: "Email",
    renderValue: (a) => a.email,
    comparator: (a, b) => a.email.localeCompare(b.email),
    field: "email",
  },
  {
    label: "Status",
    renderValue: (a) => a.userStatus,
    comparator: (a, b) => a.userStatus.localeCompare(b.userStatus),
    field: "userStatus",
    sx: {
      width: "7%",
    },
  },
  {
    label: "Role",
    renderValue: (a) => a.role,
    comparator: (a, b) => a.role.localeCompare(b.role),
    field: "role",
    sx: {
      width: "13%",
    },
  },
  {
    label: (
      <Stack direction="row" justifyContent="center" alignItems="center">
        Action
      </Stack>
    ),
    renderValue: (a) => (
      <Link to={`/users/${a?.["_id"]}`}>
        <StyledActionButton bg="#C5EAF2" text="#156071" border="#84B4BE">
          Edit
        </StyledActionButton>
      </Link>
    ),
    sortDisabled: true,
    sx: {
      width: "100px",
    },
  },
];

/**
 * View for List of Users
 *
 * @returns {JSX.Element}
 */
const ListingView: FC = () => {
  usePageTitle("Manage Users");

  const { state } = useLocation();
  const { searchParams, setSearchParams } = useSearchParamsContext();
  const [dataset, setDataset] = useState<T[]>([]);
  const [count, setCount] = useState<number>(0);
  const [touchedFilters, setTouchedFilters] = useState<TouchedState>(initialTouchedFields);

  const { watch, setValue, control } = useForm<FilterForm>({
    defaultValues: {
      role: "All",
      status: "All",
    },
  });

  const roleFilter = watch("role");
  const statusFilter = watch("status");
  const tableRef = useRef<TableMethods>(null);

  const { data, loading, error } = useQuery<ListUsersResp>(LIST_USERS, {
    context: { clientName: "backend" },
    fetchPolicy: "no-cache",
  });

  const handleFetchData = async (fetchListing: FetchListing<T>, force: boolean) => {
    const { first, offset, sortDirection, orderBy, comparator } = fetchListing || {};

    const users = data?.listUsers;
    if (!users?.length) {
      setDataset([]);
      setCount(0);
      return;
    }

    const filters: FilterFunction<T>[] = [
      (u: T) => (roleFilter && roleFilter !== "All" ? u.role === roleFilter : true),
      (u: T) => (statusFilter && statusFilter !== "All" ? u.userStatus === statusFilter : true),
    ];

    const filteredData = users.filter((u) => filters.every((filter) => filter(u)));
    const sortedData = sortData(filteredData, orderBy, sortDirection, comparator);
    const paginatedData = sortedData.slice(offset, first + offset);

    setCount(sortedData?.length);
    setDataset(paginatedData);
  };

  const isRoleFilterOption = (role: string): role is FilterForm["role"] =>
    ["All", ...Roles].includes(role);
  const isStatusFilterOption = (status: string): status is FilterForm["status"] =>
    ["All", "Inactive", "Active"].includes(status);

  useEffect(() => {
    const role = searchParams.get("role");
    const status = searchParams.get("status");

    if (isRoleFilterOption(role) && role !== roleFilter) {
      setValue("role", role);
    }
    if (isStatusFilterOption(status) && status !== statusFilter) {
      setValue("status", status);
    }

    setTablePage(0);
  }, [searchParams.get("role"), searchParams.get("status")]);

  useEffect(() => {
    if (!touchedFilters.role && !touchedFilters.status) {
      return;
    }

    const newSearchParams = new URLSearchParams(searchParams);

    if (roleFilter && roleFilter !== "All") {
      newSearchParams.set("role", roleFilter);
    } else if (roleFilter === "All") {
      newSearchParams.delete("role");
    }
    if (statusFilter && statusFilter !== "All") {
      newSearchParams.set("status", statusFilter);
    } else if (statusFilter === "All") {
      newSearchParams.delete("status");
    }

    if (newSearchParams?.toString() !== searchParams?.toString()) {
      setSearchParams(newSearchParams);
    }
  }, [roleFilter, statusFilter, touchedFilters]);

  const setTablePage = (page: number) => {
    tableRef.current?.setPage(page, true);
  };

  const handleFilterChange = (field: keyof FilterForm) => {
    setTouchedFilters((prev) => ({ ...prev, [field]: true }));
  };

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
          <StyledInlineLabel htmlFor="role-filter">Role</StyledInlineLabel>
          <StyledFormControl>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <StyledSelect
                  {...field}
                  value={field.value}
                  MenuProps={{ disablePortal: true }}
                  inputProps={{ id: "role-filter" }}
                  onChange={(e) => {
                    field.onChange(e);
                    handleFilterChange("role");
                  }}
                >
                  <MenuItem value="All">All</MenuItem>
                  {Roles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </StyledSelect>
              )}
            />
          </StyledFormControl>
          <StyledInlineLabel htmlFor="status-filter">Status</StyledInlineLabel>
          <StyledFormControl>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <StyledSelect
                  {...field}
                  value={field.value}
                  MenuProps={{ disablePortal: true }}
                  inputProps={{ id: "status-filter" }}
                  onChange={(e) => {
                    field.onChange(e);
                    handleFilterChange("status");
                  }}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </StyledSelect>
              )}
            />
          </StyledFormControl>
        </StyledFilterContainer>
        <GenericTable
          ref={tableRef}
          columns={columns}
          data={dataset || []}
          total={count || 0}
          loading={loading}
          disableUrlParams={false}
          defaultRowsPerPage={20}
          defaultOrder="asc"
          setItemKey={(item, idx) => `${idx}_${item._id}`}
          onFetchData={handleFetchData}
          containerProps={{ sx: { marginBottom: "8px", borderColor: "#083A50" } }}
          CustomTableHead={StyledTableHead}
          CustomTableHeaderCell={StyledHeaderCell}
          CustomTableBodyCell={StyledTableCell}
        />
      </StyledContainer>
    </>
  );
};

export default ListingView;
