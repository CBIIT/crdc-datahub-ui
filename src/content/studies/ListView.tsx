/* eslint-disable @typescript-eslint/no-unused-vars */
import { ElementType, useRef, useState } from "react";
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
import { Controller, useForm } from "react-hook-form";
import PageBanner from "../../components/PageBanner";
import usePageTitle from "../../hooks/usePageTitle";
import {
  Status as ApprovedStudiesStatus,
  useApprovedStudiesListContext,
} from "../../components/Contexts/ApprovedStudiesListContext";
import StyledOutlinedInput from "../../components/StyledFormComponents/StyledOutlinedInput";
import StyledSelect from "../../components/StyledFormComponents/StyledSelect";
import { useSearchParamsContext } from "../../components/Contexts/SearchParamsContext";
import GenericTable, { Column } from "../../components/GenericTable";

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
  controlledAccess: ControlledAccess;
};

type TouchedState = { [K in keyof FilterForm]: boolean };

const initialTouchedFields: TouchedState = {
  study: false,
  dbGaPID: false,
  controlledAccess: false,
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
  const { data, status: approvedStudiesStatus } = useApprovedStudiesListContext();
  const { searchParams, setSearchParams } = useSearchParamsContext();
  const { watch, register, control, setValue } = useForm<FilterForm>({
    defaultValues: {
      study: "",
      dbGaPID: "",
      controlledAccess: "All",
    },
  });

  const [dataset, setDataset] = useState<ApprovedStudy[]>([]);
  const [count, setCount] = useState<number>(0);
  const [touchedFilters, setTouchedFilters] = useState<TouchedState>(initialTouchedFields);

  const studyFilter = watch("study");
  const dbGaPIDFilter = watch("dbGaPID");
  const controlledAccessFilter = watch("controlledAccess");
  const tableRef = useRef<TableMethods>(null);

  const handleFilterChange = (field: keyof FilterForm) => {
    setTouchedFilters((prev) => ({ ...prev, [field]: true }));
  };

  return (
    <>
      <Container maxWidth="xl">
        {(state?.error || approvedStudiesStatus === ApprovedStudiesStatus.ERROR) && (
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
              name="controlledAccess"
              control={control}
              render={({ field }) => (
                <StyledSelect
                  {...field}
                  value={field.value}
                  MenuProps={{ disablePortal: true }}
                  inputProps={{ id: "controlledAccess-filter" }}
                  onChange={(e) => {
                    field.onChange(e);
                    handleFilterChange("controlledAccess");
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
          data={dataset || []}
          total={count || 0}
          loading={approvedStudiesStatus === ApprovedStudiesStatus.LOADING}
          disableUrlParams={false}
          defaultRowsPerPage={20}
          defaultOrder="asc"
          setItemKey={(item, idx) => `${idx}_${item._id}`}
          onFetchData={() => {}}
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
