import React, { FC, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Alert,
  Container,
  Stack,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useQuery } from "@apollo/client";
import { query, Response } from "../../graphql/listSubmissions";
import {
  query as listOrganizationsQuery,
  Response as listOrganizationsResponse,
} from "../../graphql/listOrganizations";
import bannerSvg from "../../assets/banner/submission_banner.png";
import PageBanner from "../../components/PageBanner";
import { FormatDate } from "../../utils";
import { useAuthContext } from "../../components/Contexts/AuthContext";
import SuspenseLoader from "../../components/SuspenseLoader";
import usePageTitle from "../../hooks/usePageTitle";
import CreateDataSubmissionDialog from "./CreateDataSubmissionDialog";

type T = Submission;

type Column = {
  label: string;
  value: (a: T, user: User) => React.ReactNode;
  field?: string;
  default?: true;
};

const StyledBannerBody = styled(Stack)({
  marginTop: "-20px",
});

const StyledContainer = styled(Container)({
  marginTop: "-62px",
});

const StyledTableContainer = styled(TableContainer)({
  borderRadius: "8px",
  border: "1px solid #083A50",
  marginBottom: "25px",
  position: "relative",
});

const OrganizationStatusContainer = styled("div")({
  height: "45px",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  paddingLeft: "6px",
});

const StyledHeaderCell = styled(TableCell)({
  fontWeight: 700,
  fontSize: "16px",
  color: "#fff !important",
  "&.MuiTableCell-root": {
    padding: "8px 8px",
    color: "#fff !important",
  },
  "& .MuiSvgIcon-root,  & .MuiButtonBase-root": {
    color: "#fff !important",
  },
  "&:last-of-type": {
    paddingRight: "4px",
  },
});

const StyledTableCell = styled(TableCell)({
  fontSize: "16px",
  color: "#083A50 !important",
  "&.MuiTableCell-root": {
    padding: "8px 8px",
    overflowWrap: "anywhere",
  },
  "&:last-of-type": {
    paddingRight: "4px",
  },
});

const StyledInlineLabel = styled("label")({
  paddingLeft: "10px",
  fontWeight: "700",
  fontSize: "16px",
});

const StyledFormControl = styled(FormControl)({
  margin: "10px 0",
  minWidth: "0",
});

const baseTextFieldStyles = {
  borderRadius: "8px",
  minWidth: "300px",
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
  "& .Mui-readOnly.MuiOutlinedInput-input:read-only": {
    backgroundColor: "#E5EEF4",
    color: "#083A50",
    cursor: "not-allowed",
    borderRadius: "8px",
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

const StyledSelect = styled(Select)(baseTextFieldStyles);

const columns: Column[] = [
  {
    label: "Submission Name",
    value: (a) =>
      a.status === "Deleted" ? (
        a.name
      ) : (
        <Link to={`/data-submission/${a._id}/data-activity`}>{a.name}</Link>
      ),
    field: "name",
  },
  {
    label: "Submitter",
    value: (a) => a.submitterName,
    field: "submitterName",
  },
  {
    label: "Data Commons",
    value: (a) => a.dataCommons,
    field: "dataCommons",
  },
  {
    label: "Type",
    value: (a) => a.intention,
    field: "intention",
  },
  {
    label: "DM Version",
    value: (a) => a.modelVersion,
    field: "modelVersion",
  },
  {
    label: "Organization",
    value: (a) => a.organization.name,
    field: "organization.name",
  },
  {
    label: "Study",
    value: (a) => a.studyAbbreviation,
    field: "studyAbbreviation",
  },
  {
    label: "dbGaP ID",
    value: (a) => a.dbGaPID,
    field: "dbGaPID",
  },
  {
    label: "Status",
    value: (a) => a.status,
    field: "status",
  },
  {
    label: "Primary Contact",
    value: (a) => a.conciergeName,
    field: "conciergeName",
  },
  {
    label: "Created Date",
    value: (a) => (a.createdAt ? FormatDate(a.createdAt, "M/D/YYYY h:mm A") : ""),
    field: "createdAt",
  },
  {
    label: "Last Updated",
    value: (a) => (a.updatedAt ? FormatDate(a.updatedAt, "M/D/YYYY h:mm A") : ""),
    field: "updatedAt",
    default: true,
  },
];

const statusValues: string[] = [
  "All",
  "New",
  "In Progress",
  "Submitted",
  "Released",
  "Withdrawn",
  "Rejected",
  "Completed",
  "Archived",
  "Canceled",
  "Deleted",
];
const statusOptionArray: SelectOption[] = statusValues.map((v) => ({
  label: v,
  value: v,
}));
/**
 * View for List of Questionnaire/Submissions
 *
 * @returns {JSX.Element}
 */
const ListingView: FC = () => {
  usePageTitle("Data Submission List");

  const { state } = useLocation();
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState<Column>(
    columns.find((c) => c.default) || columns.find((c) => c.field)
  );

  // Only org owners/submitters with organizations assigned can create data submissions
  const orgOwnerOrSubmitter = user?.role === "Organization Owner" || user?.role === "Submitter";
  const hasOrganizationAssigned = user?.organization !== null && user?.organization?.orgID !== null;
  const shouldHaveAllFilter =
    user?.role === "Admin" ||
    user?.role === "Federal Lead" ||
    user?.role === "Data Curator" ||
    user?.role === "Data Commons POC";
  const [page, setPage] = useState<number>(0);
  const [perPage, setPerPage] = useState<number>(10);
  const [organizationFilter, setOrganizationFilter] = useState<string>(
    // eslint-disable-next-line no-nested-ternary
    shouldHaveAllFilter ? "All" : hasOrganizationAssigned ? user.organization?.orgName : "All"
  );
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const { data: allOrganizations } = useQuery<listOrganizationsResponse>(listOrganizationsQuery, {
    variables: {},
    context: { clientName: "backend" },
    fetchPolicy: "no-cache",
  });

  const { data, loading, error, refetch } = useQuery<Response>(query, {
    variables: {
      first: perPage,
      offset: page * perPage,
      sortDirection: order.toUpperCase(),
      orderBy: orderBy.field,
      organization:
        organizationFilter !== "All"
          ? allOrganizations?.listOrganizations?.find((org) => org.name === organizationFilter)?._id
          : "All",
      status: statusFilter,
    },
    context: { clientName: "backend" },
    fetchPolicy: "no-cache",
  });

  // eslint-disable-next-line arrow-body-style
  const emptyRows = useMemo(() => {
    return page > 0 && data?.listSubmissions?.total
      ? Math.max(0, (1 + page) * perPage - (data?.listSubmissions?.total || 0))
      : 0;
  }, [data]);

  const handleRequestSort = (column: Column) => {
    setOrder(orderBy === column && order === "asc" ? "desc" : "asc");
    setOrderBy(column);
  };

  const handleChangeRowsPerPage = (event) => {
    setPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOnCreateSubmission = () => {
    refetch();
    enqueueSnackbar("Data Submission Created Successfully", {
      variant: "success",
    });
  };

  const organizationNames: SelectOption[] = allOrganizations?.listOrganizations?.map((org) => ({
    label: org.name,
    value: org.name,
  }));
  organizationNames?.unshift({ label: "All", value: "All" });

  return (
    <>
      <PageBanner
        title="Data Submission List"
        subTitle="Below is a list of data submissions that are associated with your account. Please click on any of the data submissions to review or continue work."
        padding="57px 0 0 25px"
        body={
          <StyledBannerBody direction="row" alignItems="center" justifyContent="flex-end">
            {/* NOTE For MVP-2: Organization Owners are just Users */}
            {/* Create a submission only available to org owners and submitters that have organizations assigned */}
            <CreateDataSubmissionDialog
              organizations={allOrganizations?.listOrganizations}
              onCreate={handleOnCreateSubmission}
            />
          </StyledBannerBody>
        }
        bannerSrc={bannerSvg}
      />
      <StyledContainer maxWidth="xl">
        {(state?.error || error) && (
          <Alert sx={{ mb: 3, p: 2 }} severity="error">
            {state?.error || "An error occurred while loading the data."}
          </Alert>
        )}

        <StyledTableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell colSpan={12}>
                  <OrganizationStatusContainer>
                    <StyledInlineLabel htmlFor="data-submissions-table-organization">
                      Organization
                    </StyledInlineLabel>
                    <StyledFormControl>
                      <StyledSelect
                        sx={{
                          minWidth: "300px",
                          marginLeft: "24px",
                          marginRight: "64px",
                        }}
                        value={organizationFilter}
                        MenuProps={{ disablePortal: true }}
                        inputProps={{
                          id: "data-submissions-table-organization",
                        }}
                        readOnly={orgOwnerOrSubmitter || user?.role === "User"}
                        onChange={(e) => setOrganizationFilter(e.target.value as unknown as string)}
                      >
                        {organizationNames?.map(({ value, label }) => (
                          <MenuItem key={value} value={value}>
                            {label}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    </StyledFormControl>
                    <StyledInlineLabel htmlFor="data-submissions-table-status">
                      Status
                    </StyledInlineLabel>
                    <StyledFormControl>
                      <StyledSelect
                        sx={{
                          minWidth: "300px",
                          marginLeft: "24px",
                          marginRight: "64px",
                        }}
                        value={statusFilter}
                        MenuProps={{ disablePortal: true }}
                        inputProps={{ id: "data-submissions-table-status" }}
                        onChange={(e) => setStatusFilter(e.target.value as unknown as string)}
                      >
                        {statusOptionArray.map(({ value, label }) => (
                          <MenuItem key={value} value={value}>
                            {label}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    </StyledFormControl>
                  </OrganizationStatusContainer>
                </TableCell>
              </TableRow>
              <TableRow sx={{ background: "#083A50" }}>
                {columns.map((col: Column, index) => (
                  <StyledHeaderCell
                    sx={{ paddingLeft: index === 0 ? "32px !important" : "" }}
                    key={col.label}
                  >
                    {col.field ? (
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
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell>
                    <SuspenseLoader fullscreen={false} />
                  </TableCell>
                </TableRow>
              )}
              {data?.listSubmissions?.submissions?.map((d: T, index) => (
                <TableRow
                  sx={{ background: index % 2 === 0 ? "#fff" : "#E3EEF9" }}
                  tabIndex={-1}
                  hover
                  key={d["_id"]}
                >
                  {columns.map((col: Column, index) => (
                    <StyledTableCell
                      sx={{ paddingLeft: index === 0 ? "32px !important" : "" }}
                      key={`${d["_id"]}_${col.label}`}
                    >
                      {col.value(d, user)}
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
              {(!data?.listSubmissions?.total || data?.listSubmissions?.total === 0) && (
                <TableRow style={{ height: 53 * 10 }}>
                  <TableCell colSpan={columns.length}>
                    <Typography variant="h6" align="center" fontSize={18} color="#757575">
                      There are no data submissions associated with your account
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 20, 50]}
            component="div"
            count={data?.listSubmissions?.total || 0}
            rowsPerPage={perPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={handleChangeRowsPerPage}
            nextIconButtonProps={{
              disabled:
                perPage === -1 ||
                !data?.listSubmissions ||
                data?.listSubmissions?.total === 0 ||
                data?.listSubmissions?.total <= (page + 1) * perPage ||
                emptyRows > 0 ||
                loading,
            }}
            SelectProps={{
              inputProps: { "aria-label": "rows per page" },
              native: true,
            }}
            backIconButtonProps={{ disabled: page === 0 || loading }}
          />
        </StyledTableContainer>
      </StyledContainer>
    </>
  );
};

export default ListingView;
