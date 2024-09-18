import { ElementType, useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  MenuItem,
  Stack,
  styled,
  TableCell,
  TableHead,
} from "@mui/material";
import { Link, LinkProps, useLocation } from "react-router-dom";
import { useLazyQuery } from "@apollo/client";
import { Controller, useForm } from "react-hook-form";
import PageBanner from "../../components/PageBanner";
import usePageTitle from "../../hooks/usePageTitle";
import StyledOutlinedInput from "../../components/StyledFormComponents/StyledOutlinedInput";
import StyledSelect from "../../components/StyledFormComponents/StyledSelect";
import { useSearchParamsContext } from "../../components/Contexts/SearchParamsContext";
import GenericTable, { Column } from "../../components/GenericTable";
import {
  LIST_APPROVED_STUDIES,
  ListApprovedStudiesInput,
  ListApprovedStudiesResp,
} from "../../graphql";

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

type FilterForm = {
  study: string;
  dbGaPID: string;
  accessType: AccessType;
};

type TouchedState = { [K in keyof FilterForm]: boolean };

const initialTouchedFields: TouchedState = {
  study: false,
  dbGaPID: false,
  accessType: false,
};

const columns: Column<ApprovedStudy>[] = [
  {
    label: "Name",
    renderValue: (a) => a.studyName,
    field: "studyName",
    default: true,
  },
  {
    label: "Acronym",
    renderValue: (a) => a.studyAbbreviation,
    field: "studyAbbreviation",
  },
  {
    label: "dbGaPID",
    renderValue: (a) => a.dbGaPID,
    field: "dbGaPID",
  },
  {
    label: "Access Type",
    renderValue: (a) => a.controlledAccess,
    field: "controlledAccess",
  },
  {
    label: "Principal Investigator",
    renderValue: (a) => a.PI,
    field: "PI",
  },
  {
    label: "ORCID",
    renderValue: (a) => a.ORCID,
    field: "ORCID",
  },
  {
    label: "Created Date",
    renderValue: (a) => a.createdAt,
    field: "createdAt",
  },
  {
    label: (
      <Stack direction="row" justifyContent="center" alignItems="center">
        Action
      </Stack>
    ),
    renderValue: (a) => (
      <Link to={`/studies/${a?.["_id"]}`}>
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

const ListView = () => {
  usePageTitle("Manage Studies");

  const { state } = useLocation();
  const { searchParams, setSearchParams } = useSearchParamsContext();
  const { watch, register, control, setValue } = useForm<FilterForm>({
    defaultValues: {
      study: "",
      dbGaPID: "",
      accessType: "All",
    },
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [data, setData] = useState<ApprovedStudy[]>([]);
  const [count, setCount] = useState<number>(0);
  const [touchedFilters, setTouchedFilters] = useState<TouchedState>(initialTouchedFields);

  const studyFilter = watch("study");
  const dbGaPIDFilter = watch("dbGaPID");
  const accessTypeFilter = watch("accessType");
  const tableRef = useRef<TableMethods>(null);

  const [listSubmissions] = useLazyQuery<ListApprovedStudiesResp, ListApprovedStudiesInput>(
    LIST_APPROVED_STUDIES,
    {
      context: { clientName: "backend" },
      fetchPolicy: "cache-and-network",
    }
  );

  const isAccessTypeFilterOption = (accessType: string): accessType is FilterForm["accessType"] =>
    ["All", "Controlled", "Open"].includes(accessType);

  const handleAccessTypeChange = (accessType: string) => {
    if (accessType === accessTypeFilter) {
      return;
    }

    if (isAccessTypeFilterOption(accessType)) {
      setValue("accessType", accessType);
    }
  };

  useEffect(() => {
    if (!data?.length) {
      return;
    }

    const dbGaPID = searchParams.get("dbGaPID");
    const study = searchParams.get("study");
    const accessType = searchParams.get("accessType");

    if (dbGaPID !== dbGaPIDFilter) {
      setValue("dbGaPID", dbGaPID);
    }
    if (study !== studyFilter) {
      setValue("study", study);
    }
    handleAccessTypeChange(accessType);
  }, [data, searchParams.get("organization"), searchParams.get("status")]);

  useEffect(() => {
    if (!touchedFilters.dbGaPID && !touchedFilters.study && !touchedFilters.accessType) {
      return;
    }

    if (dbGaPIDFilter && dbGaPIDFilter !== "All") {
      searchParams.set("dbGaPID", dbGaPIDFilter);
    } else if (dbGaPIDFilter === "All") {
      searchParams.delete("dbGaPID");
    }

    setTablePage(0);
    setSearchParams(searchParams);
  }, [dbGaPIDFilter, studyFilter, accessTypeFilter, touchedFilters]);

  const setTablePage = (page: number) => {
    tableRef.current?.setPage(page, true);
  };

  const handleFetchData = async (fetchListing: FetchListing<ApprovedStudy>, force: boolean) => {
    const { first, offset, sortDirection, orderBy } = fetchListing || {};
    try {
      setLoading(true);

      const { data: d, error } = await listSubmissions({
        variables: {
          first,
          offset,
          sortDirection,
          orderBy,
          dbGaPID: dbGaPIDFilter,
          controlledAccess: accessTypeFilter === "Controlled" || accessTypeFilter === "All",
          openAccess: accessTypeFilter === "Open" || accessTypeFilter === "All",
          study: studyFilter,
        },
        context: { clientName: "backend" },
        fetchPolicy: "no-cache",
      });
      if (error || !d?.listApprovedStudies) {
        throw new Error("Unable to retrieve List Approved Studies results.");
      }

      setData(d.listApprovedStudies.studies);
      setCount(d.listApprovedStudies.total);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: keyof FilterForm) => {
    setTouchedFilters((prev) => ({ ...prev, [field]: true }));
  };

  return (
    <>
      <Container maxWidth="xl">
        {(state?.error || error) && (
          <Alert sx={{ mt: 2, mx: "auto", p: 2 }} severity="error">
            {state?.error || "An error occurred while loading the data."}
          </Alert>
        )}
      </Container>

      <PageBanner
        title="Manage Studies"
        subTitle=""
        padding="38px 0 0 25px"
        body={
          <StyledBannerBody direction="row" alignItems="center" justifyContent="flex-end">
            <StyledButton component={Link} to="/studies/new">
              Add Approved Study
            </StyledButton>
          </StyledBannerBody>
        }
      />

      <StyledContainer maxWidth="xl">
        <StyledFilterContainer>
          <StyledInlineLabel htmlFor="study-filter">Study</StyledInlineLabel>
          <StyledFormControl>
            <StyledOutlinedInput
              {...register("study", {
                onChange: (e) => handleFilterChange("study"),
                setValueAs: (val) => val?.trim(),
              })}
              placeholder="Enter a Study"
              id="study-filter"
              required
            />
          </StyledFormControl>
          <StyledInlineLabel htmlFor="dbGaPID-filter">dbGaPID</StyledInlineLabel>
          <StyledFormControl>
            <StyledOutlinedInput
              {...register("dbGaPID", {
                onChange: (e) => handleFilterChange("dbGaPID"),
                setValueAs: (val) => val?.trim(),
              })}
              placeholder="Enter a dbGaPID"
              id="dbGaPID-filter"
              required
            />
          </StyledFormControl>
          <StyledInlineLabel htmlFor="status-filter">Access Type</StyledInlineLabel>
          <StyledFormControl>
            <Controller
              name="accessType"
              control={control}
              render={({ field }) => (
                <StyledSelect
                  {...field}
                  value={field.value}
                  MenuProps={{ disablePortal: true }}
                  inputProps={{ id: "accessType-filter" }}
                  onChange={(e) => {
                    field.onChange(e);
                    handleFilterChange("accessType");
                  }}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Controlled">Controlled</MenuItem>
                  <MenuItem value="Open">Open</MenuItem>
                </StyledSelect>
              )}
            />
          </StyledFormControl>
        </StyledFilterContainer>

        <GenericTable
          ref={tableRef}
          columns={columns}
          data={data || []}
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

export default ListView;
