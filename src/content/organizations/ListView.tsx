import React, { ElementType, FC, useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TableCell,
  TableHead,
  styled,
} from "@mui/material";
import { Link, LinkProps, useLocation } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import PageBanner from "../../components/PageBanner";
import {
  useOrganizationListContext,
  Status as OrgStatus,
} from "../../components/Contexts/OrganizationListContext";
import usePageTitle from "../../hooks/usePageTitle";
import StudyTooltip from "../../components/Organizations/StudyTooltip";
import GenericTable, { Column } from "../../components/GenericTable";
import { sortData } from "../../utils";
import { useSearchParamsContext } from "../../components/Contexts/SearchParamsContext";

type T = Partial<Organization>;

type FilterForm = {
  organization: string;
  study: string;
  status: Organization["status"] | "All";
};

const StyledContainer = styled(Container)({
  marginTop: "-180px",
  paddingBottom: "90px",
});

const StyledButton = styled(Button)<{ component: ElementType } & LinkProps>({
  padding: "14px 20px",
  fontWeight: 700,
  fontSize: "16px",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  letterSpacing: "2%",
  lineHeight: "20.14px",
  borderRadius: "8px",
  color: "#fff",
  textTransform: "none",
  borderColor: "#26B893 !important",
  background: "#1B8369 !important",
  marginRight: "25px",
});

const StyledBannerBody = styled(Stack)({
  marginTop: "-53px",
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

type TouchedState = { [K in keyof FilterForm]: boolean };

const initialTouchedFields: TouchedState = {
  organization: false,
  study: false,
  status: false,
};

const columns: Column<T>[] = [
  {
    label: "Name",
    renderValue: (a) => a.name,
    comparator: (a, b) => a.name.localeCompare(b.name),
    field: "name",
    default: true,
    sx: {
      width: "25%",
    },
  },
  {
    label: "Primary Contact",
    renderValue: (a) => a.conciergeName,
    comparator: (a, b) => (a?.conciergeName || "").localeCompare(b?.conciergeName || ""),
    field: "conciergeName",
    sx: {
      width: "20%",
    },
  },
  {
    label: "Studies",
    renderValue: ({ _id, studies }) => {
      if (!studies || studies?.length < 1) {
        return "";
      }

      return (
        <>
          {studies[0].studyAbbreviation || studies[0].studyName}
          {studies.length > 1 && " and "}
          {studies.length > 1 && <StudyTooltip _id={_id} studies={studies} />}
        </>
      );
    },
    field: "studies",
    sortDisabled: true,
  },
  {
    label: "Status",
    renderValue: (a) => a.status,
    comparator: (a, b) => (a?.status || "").localeCompare(b?.status || ""),
    field: "status",
    sx: {
      width: "10%",
    },
  },
  {
    label: (
      <Stack direction="row" justifyContent="center" alignItems="center">
        Action
      </Stack>
    ),
    renderValue: (a) => (
      <Link to={`/organizations/${a?.["_id"]}`}>
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
 * View for List of Organizations
 *
 * @returns {JSX.Element}
 */
const ListingView: FC = () => {
  usePageTitle("Manage Organizations");

  const { state } = useLocation();
  const { data, status: orgStatus } = useOrganizationListContext();
  const [searchParams, setSearchParams] = useSearchParamsContext();
  const { watch, register, control, setValue } = useForm<FilterForm>({
    defaultValues: {
      organization: searchParams.get("organization") || "",
      study: searchParams.get("study") || "",
      status: (searchParams.get("status") as FilterForm["status"]) || "All",
    },
  });

  const [dataset, setDataset] = useState<T[]>([]);
  const [count, setCount] = useState<number>(0);
  const [touchedFilters, setTouchedFilters] = useState<TouchedState>(initialTouchedFields);

  const orgFilter = watch("organization");
  const studyFilter = watch("study");
  const statusFilter = watch("status");
  const tableRef = useRef<TableMethods>(null);

  const handleFetchData = async (fetchListing: FetchListing<T>, force: boolean) => {
    const { first, offset, sortDirection, orderBy, comparator } = fetchListing || {};

    if (!data?.length) {
      setDataset([]);
      setCount(0);
      return;
    }

    const filters: FilterFunction<T>[] = [
      (u: T) =>
        orgFilter && orgFilter.length > 0
          ? u.name.toLowerCase().indexOf(orgFilter.toLowerCase()) !== -1
          : true,
      (u: T) => (statusFilter && statusFilter !== "All" ? u.status === statusFilter : true),
      (u: T) => {
        if (!studyFilter || studyFilter.trim().length < 1) {
          return true;
        }

        const nameMatch = u?.studies?.some(
          (s) => s.studyName.toLowerCase().indexOf(studyFilter.toLowerCase()) !== -1
        );
        const abbrMatch = u?.studies?.some(
          (s) => s.studyAbbreviation.toLowerCase().indexOf(studyFilter.toLowerCase()) !== -1
        );

        return nameMatch || abbrMatch;
      },
    ];

    const filteredData = data.filter((u) => filters.every((filter) => filter(u)));
    const sortedData = sortData(filteredData, orderBy, sortDirection, comparator);
    const paginatedData = sortedData.slice(offset, first + offset);

    setCount(sortedData?.length);
    setDataset(paginatedData);
  };

  const isStatusFilterOption = (status: string): status is FilterForm["status"] =>
    ["All", "Inactive", "Active"].includes(status);

  useEffect(() => {
    if (!data?.length) {
      return;
    }

    const organizationId = searchParams.get("organization") || "";
    const study = searchParams.get("study") || "";
    const status = searchParams.get("status");

    if (organizationId !== orgFilter) {
      setValue("organization", organizationId);
    }
    if (study !== studyFilter) {
      setValue("study", study);
    }
    if (isStatusFilterOption(status) && status !== statusFilter) {
      setValue("status", status);
    }
  }, [
    data,
    searchParams.get("organization"),
    searchParams.get("role"),
    searchParams.get("status"),
  ]);

  useEffect(() => {
    if (!touchedFilters.organization && !touchedFilters.study && !touchedFilters.status) {
      return;
    }

    if (orgFilter) {
      searchParams.set("organization", orgFilter);
    } else {
      searchParams.delete("organization");
    }
    if (studyFilter) {
      searchParams.set("study", studyFilter);
    } else {
      searchParams.delete("study");
    }
    if (statusFilter && statusFilter !== "All") {
      searchParams.set("status", statusFilter);
    } else if (statusFilter === "All") {
      searchParams.delete("status");
    }

    setTablePage(0);
    setSearchParams(searchParams);
  }, [orgFilter, studyFilter, statusFilter]);

  const setTablePage = (page: number) => {
    tableRef.current?.setPage(page, true);
  };

  const handleFilterChange = (field: keyof FilterForm) => {
    setTouchedFilters((prev) => ({ ...prev, [field]: true }));
  };

  return (
    <>
      <Container maxWidth="xl">
        {(state?.error || orgStatus === OrgStatus.ERROR) && (
          <Alert sx={{ mt: 2, mx: "auto", p: 2 }} severity="error">
            {state?.error || "An error occurred while loading the data."}
          </Alert>
        )}
      </Container>

      <PageBanner
        title="Manage Organizations"
        subTitle=""
        padding="38px 0 0 25px"
        body={
          <StyledBannerBody direction="row" alignItems="center" justifyContent="flex-end">
            <StyledButton component={Link} to="/organizations/new">
              Add Organization
            </StyledButton>
          </StyledBannerBody>
        }
      />

      <StyledContainer maxWidth="xl">
        <StyledFilterContainer>
          <StyledInlineLabel htmlFor="organization-filter">Organization</StyledInlineLabel>
          <StyledFormControl>
            <StyledTextField
              {...register("organization", {
                onChange: (e) => handleFilterChange("organization"),
                setValueAs: (val) => val?.trim(),
              })}
              placeholder="Enter a Organization"
              id="organization-filter"
              required
            />
          </StyledFormControl>
          <StyledInlineLabel htmlFor="study-filter">Study</StyledInlineLabel>
          <StyledFormControl>
            <StyledTextField
              {...register("study", {
                onChange: (e) => handleFilterChange("study"),
                setValueAs: (val) => val?.trim(),
              })}
              placeholder="Enter a Study"
              id="study-filter"
              required
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
          loading={orgStatus === OrgStatus.LOADING}
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
