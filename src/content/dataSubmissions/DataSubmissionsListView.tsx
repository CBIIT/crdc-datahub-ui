import React, { FC, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Alert,
  Container,
  Stack,
  styled,
  TableCell,
  TableHead,
  FormControl,
  MenuItem,
  Box,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useLazyQuery } from "@apollo/client";
import { Controller, useForm } from "react-hook-form";
import bannerSvg from "../../assets/banner/submission_banner.png";
import PageBanner from "../../components/PageBanner";
import { FormatDate } from "../../utils";
import { useAuthContext, Status as AuthStatus } from "../../components/Contexts/AuthContext";
import usePageTitle from "../../hooks/usePageTitle";
import CreateDataSubmissionDialog from "./CreateDataSubmissionDialog";
import {
  Status as OrgStatus,
  useOrganizationListContext,
} from "../../components/Contexts/OrganizationListContext";
import GenericTable, { Column } from "../../components/GenericTable";
import { LIST_SUBMISSIONS, ListSubmissionsResp } from "../../graphql";
import StyledSelectFormComponent from "../../components/StyledFormComponents/StyledSelect";
import { useSearchParamsContext } from "../../components/Contexts/SearchParamsContext";

type T = ListSubmissionsResp["listSubmissions"]["submissions"][0];

type FilterForm = {
  organization: string;
  status: Submission["status"] | "All";
};

type TouchedState = { [K in keyof FilterForm]: boolean };

const StyledBannerBody = styled(Stack)({
  marginTop: "-20px",
});

const StyledContainer = styled(Container)({
  marginTop: "-62px",
});

const StyledTableHead = styled(TableHead)({
  background: "#083A50",
});

const StyledHeaderCell = styled(TableCell)({
  fontWeight: 700,
  fontSize: "16px",
  lineHeight: "16px",
  color: "#fff !important",
  "&.MuiTableCell-root": {
    padding: "15px 8px 17px",
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

const StyledSelect = styled(StyledSelectFormComponent)({
  width: "310px",
});

const StyledFilterTableWrapper = styled(Box)({
  borderRadius: "8px",
  background: "#FFF",
  border: "1px solid #6CACDA",
  marginBottom: "25px",
});

const StyledFilterContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: "52px",
  paddingTop: "18px",
  paddingBottom: "18px",
  paddingLeft: "29px",
});

const StyledFormControl = styled(FormControl)({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "15px",
  minWidth: "250px",
});

const StyledInlineLabel = styled("label")({
  padding: 0,
  fontWeight: "700",
});

const StyledDeletedText = styled(Box)(({ theme }) => ({
  color: theme.palette.text.disabled,
}));

const initialTouchedFields: TouchedState = {
  organization: false,
  status: false,
};

const columns: Column<T>[] = [
  {
    label: "Submission Name",
    renderValue: (a) =>
      a.status === "Deleted" ? (
        <StyledDeletedText>{a.name}</StyledDeletedText>
      ) : (
        <Link to={`/data-submission/${a._id}/data-activity`}>{a.name}</Link>
      ),
    field: "name",
  },
  {
    label: "Submitter",
    renderValue: (a) => a.submitterName,
    field: "submitterName",
  },
  {
    label: "Data Commons",
    renderValue: (a) => a.dataCommons,
    field: "dataCommons",
  },
  {
    label: "Type",
    renderValue: (a) => a.intention,
    field: "intention",
  },
  {
    label: "DM Version",
    renderValue: (a) => a.modelVersion,
    field: "modelVersion",
  },
  {
    label: "Organization",
    renderValue: (a) => a.organization.name,
    fieldKey: "organization.name",
  },
  {
    label: "Study",
    renderValue: (a) => a.studyAbbreviation,
    field: "studyAbbreviation",
  },
  {
    label: "dbGaP ID",
    renderValue: (a) => a.dbGaPID,
    field: "dbGaPID",
  },
  {
    label: "Status",
    renderValue: (a) => a.status,
    field: "status",
  },
  {
    label: "Primary Contact",
    renderValue: (a) => a.conciergeName,
    field: "conciergeName",
  },
  {
    label: "Created Date",
    renderValue: (a) => (a.createdAt ? FormatDate(a.createdAt, "M/D/YYYY h:mm A") : ""),
    field: "createdAt",
  },
  {
    label: "Last Updated",
    renderValue: (a) => (a.updatedAt ? FormatDate(a.updatedAt, "M/D/YYYY h:mm A") : ""),
    field: "updatedAt",
    default: true,
  },
];

const blockOrgChangeRoles: User["role"][] = ["Organization Owner", "Submitter", "User"];

const statusValues: SubmissionStatus[] = [
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

/**
 * View for List of Questionnaire/Submissions
 *
 * @returns {JSX.Element}
 */
const ListingView: FC = () => {
  usePageTitle("Data Submission List");

  const { state } = useLocation();
  const { user, status: authStatus } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const { status: orgStatus, activeOrganizations } = useOrganizationListContext();
  const { searchParams, setSearchParams } = useSearchParamsContext();
  // Only org owners/submitters with organizations assigned can create data submissions
  const { watch, control, setValue } = useForm<FilterForm>({
    defaultValues: {
      organization: "All",
      status: "All",
    },
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [data, setData] = useState<T[]>([]);
  const [totalData, setTotalData] = useState<number>(0);
  const [touchedFilters, setTouchedFilters] = useState<TouchedState>(initialTouchedFields);
  const canChangeOrgs = !blockOrgChangeRoles.includes(user?.role);
  const orgFilter = watch("organization");
  const statusFilter = watch("status");
  const tableRef = useRef<TableMethods>(null);

  const [listSubmissions, { refetch }] = useLazyQuery<ListSubmissionsResp>(LIST_SUBMISSIONS, {
    variables: { status: statusFilter },
    context: { clientName: "backend" },
    fetchPolicy: "cache-and-network",
  });

  const handleFetchData = async (fetchListing: FetchListing<T>, force: boolean) => {
    const { first, offset, sortDirection, orderBy } = fetchListing || {};
    try {
      setLoading(true);

      if (!activeOrganizations?.length) {
        return;
      }

      const organization = activeOrganizations?.find((org) => org._id === orgFilter);
      const { data: d, error } = await listSubmissions({
        variables: {
          first,
          offset,
          sortDirection,
          orderBy,
          organization: organization?._id ?? "All",
          status: statusFilter,
        },
        context: { clientName: "backend" },
        fetchPolicy: "no-cache",
      });
      if (error || !d?.listSubmissions) {
        throw new Error("Unable to retrieve submission quality control results.");
      }
      setData(d.listSubmissions.submissions);
      setTotalData(d.listSubmissions.total);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const isValidOrg = (orgId: string) =>
    orgId && !!activeOrganizations?.find((org) => org._id === orgId);
  const isStatusFilterOption = (status: string): status is FilterForm["status"] =>
    ["All", ...statusValues].includes(status);

  const handleOrganizationChange = (organizationId: string) => {
    const isValidUserOrg = isValidOrg(user?.organization?.orgID);
    const isValidOrgFilter = isValidOrg(organizationId);

    if ((!canChangeOrgs || !isValidOrgFilter) && organizationId) {
      searchParams.delete("organization");
      setSearchParams(searchParams);
    } else if (!canChangeOrgs && isValidUserOrg && organizationId !== orgFilter) {
      setValue("organization", user.organization.orgID);
    } else if (canChangeOrgs && isValidOrgFilter && organizationId !== orgFilter) {
      setValue("organization", organizationId);
    }
  };

  const handleStatusChange = (status: string) => {
    const isValidStatusFilter = isStatusFilterOption(status);

    if (isValidStatusFilter && status !== statusFilter) {
      setValue("status", status);
    } else if (!isValidStatusFilter && status) {
      searchParams.delete("status");
      setSearchParams(searchParams);
    }
  };

  useEffect(() => {
    if (!activeOrganizations?.length) {
      return;
    }

    const organizationId = searchParams.get("organization");
    const status = searchParams.get("status");

    handleStatusChange(status);
    handleOrganizationChange(organizationId);
  }, [
    activeOrganizations,
    canChangeOrgs,
    searchParams.get("organization"),
    searchParams.get("status"),
  ]);

  useEffect(() => {
    if (!touchedFilters.organization && !touchedFilters.status) {
      return;
    }

    if (orgFilter && orgFilter !== "All") {
      searchParams.set("organization", orgFilter);
    } else if (orgFilter === "All") {
      searchParams.delete("organization");
    }
    if (statusFilter && statusFilter !== "All") {
      searchParams.set("status", statusFilter);
    } else if (statusFilter === "All") {
      searchParams.delete("status");
    }

    setTablePage(0);
    setSearchParams(searchParams);
  }, [orgFilter, statusFilter, touchedFilters]);

  const setTablePage = (page: number) => {
    tableRef.current?.setPage(page, true);
  };

  const handleOnCreateSubmission = async () => {
    if (!activeOrganizations?.length) {
      return;
    }

    try {
      setLoading(true);

      const { data: d } = await refetch();
      if (error || !d?.listSubmissions) {
        throw new Error("Unable to retrieve submission quality control results.");
      }
      setData(d.listSubmissions.submissions);
      setTotalData(d.listSubmissions.total);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }

    enqueueSnackbar("Data Submission Created Successfully", {
      variant: "success",
    });
  };

  const handleFilterChange = (field: keyof FilterForm) => {
    setTouchedFilters((prev) => ({ ...prev, [field]: true }));
  };

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
              organizations={activeOrganizations}
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
        <StyledFilterTableWrapper>
          <StyledFilterContainer>
            <StyledFormControl>
              <StyledInlineLabel htmlFor="organization-filter">Organization</StyledInlineLabel>
              <Controller
                name="organization"
                control={control}
                render={({ field }) => (
                  <StyledSelect
                    {...field}
                    value={field.value}
                    MenuProps={{ disablePortal: true }}
                    inputProps={{ id: "organization-filter" }}
                    readOnly={!canChangeOrgs}
                    onChange={(e) => {
                      field.onChange(e);
                      handleFilterChange("organization");
                    }}
                  >
                    <MenuItem value="All">All</MenuItem>
                    {activeOrganizations?.map((org) => (
                      <MenuItem key={org._id} value={org._id}>
                        {org.name}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                )}
              />
            </StyledFormControl>
            <StyledFormControl>
              <StyledInlineLabel htmlFor="status-filter">Status</StyledInlineLabel>
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
                    {statusValues.map((value) => (
                      <MenuItem key={`submission_status_${value}`} value={value}>
                        {value}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                )}
              />
            </StyledFormControl>
          </StyledFilterContainer>

          <GenericTable
            ref={tableRef}
            columns={columns}
            data={data || []}
            total={totalData || 0}
            loading={
              loading || orgStatus === OrgStatus.LOADING || authStatus === AuthStatus.LOADING
            }
            defaultRowsPerPage={10}
            defaultOrder="desc"
            disableUrlParams={false}
            position="bottom"
            noContentText="There are no data submissions associated with your account"
            onFetchData={handleFetchData}
            containerProps={{
              sx: {
                marginBottom: "8px",
                border: 0,
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
              },
            }}
            CustomTableHead={StyledTableHead}
            CustomTableHeaderCell={StyledHeaderCell}
            CustomTableBodyCell={StyledTableCell}
          />
        </StyledFilterTableWrapper>
      </StyledContainer>
    </>
  );
};

export default ListingView;
