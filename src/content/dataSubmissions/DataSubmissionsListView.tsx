import React, { FC, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Alert, Container, Stack, styled, TableCell, TableHead, Box } from "@mui/material";
import { isEqual } from "lodash";
import { useSnackbar } from "notistack";
import { useLazyQuery } from "@apollo/client";
import bannerSvg from "../../assets/banner/submission_banner.png";
import PageBanner from "../../components/PageBanner";
import { FormatDate } from "../../utils";
import { useAuthContext, Status as AuthStatus } from "../../components/Contexts/AuthContext";
import usePageTitle from "../../hooks/usePageTitle";
import CreateDataSubmissionDialog from "../../components/DataSubmissions/CreateDataSubmissionDialog";
import {
  Status as OrgStatus,
  useOrganizationListContext,
} from "../../components/Contexts/OrganizationListContext";
import GenericTable, { Column } from "../../components/GenericTable";
import { LIST_SUBMISSIONS, ListSubmissionsInput, ListSubmissionsResp } from "../../graphql";
import TruncatedText from "../../components/TruncatedText";
import StyledTooltip from "../../components/StyledFormComponents/StyledTooltip";
import { useColumnVisibility } from "../../hooks/useColumnVisibility";
import DataSubmissionListFilters, {
  FilterForm,
} from "../../components/DataSubmissions/DataSubmissionListFilters";

type T = ListSubmissionsResp["listSubmissions"]["submissions"][0];

const StyledBannerBody = styled(Stack)({
  marginTop: "-20px",
});

const StyledContainer = styled(Container)({
  marginTop: "-62px",
});

const StyledTableHead = styled(TableHead)({
  background: "#083A50",
  borderTop: "1px solid #6B7294",
  borderBottom: "1px solid #6B7294",
});

const StyledHeaderCell = styled(TableCell)({
  fontWeight: 700,
  fontSize: "14px",
  lineHeight: "16px",
  color: "#fff !important",
  "&.MuiTableCell-root": {
    padding: "15px 4px 17px",
    color: "#fff !important",
    // whiteSpace: "nowrap",
  },
  "& .MuiSvgIcon-root, & .MuiButtonBase-root": {
    color: "#fff !important",
  },
  "& .MuiSvgIcon-root": {
    marginRight: 0,
  },
  "&:last-of-type": {
    paddingRight: "4px",
  },
});

const StyledTableCell = styled(TableCell)({
  fontSize: "14px",
  color: "#083A50 !important",
  "&.MuiTableCell-root": {
    padding: "14px 4px 12px",
    overflowWrap: "anywhere",
    whiteSpace: "nowrap",
  },
  "&:last-of-type": {
    paddingRight: "4px",
  },
});

const StyledFilterTableWrapper = styled(Box)({
  borderRadius: "8px",
  background: "#FFF",
  border: "1px solid #6CACDA",
  marginBottom: "25px",
});

const StyledDisabledText = styled(Box)(({ theme }) => ({
  color: theme.palette.text.disabled,
}));

const StyledDateTooltip = styled(StyledTooltip)(() => ({
  cursor: "pointer",
}));

const columns: Column<T>[] = [
  {
    label: "Submission Name",
    renderValue: (a) =>
      a.status === "Deleted" || a.archived === true ? (
        <StyledDisabledText>
          <TruncatedText text={a.name} />
        </StyledDisabledText>
      ) : (
        <Link to={`/data-submission/${a._id}/upload-activity`}>
          <TruncatedText text={a.name} underline={false} />
        </Link>
      ),
    field: "name",
    hideable: false,
    sx: {
      width: "139px",
    },
  },
  {
    label: "Submitter",
    renderValue: (a) => <TruncatedText text={a.submitterName} />,
    field: "submitterName",
    hideable: true,
    sx: {
      width: "102px",
    },
  },
  {
    label: "Data Commons",
    renderValue: (a) => a.dataCommons,
    field: "dataCommons",
    hideable: true,
    sx: {
      width: "94px",
    },
  },
  {
    label: "Type",
    renderValue: (a) => a.intention,
    field: "intention",
    hideable: true,
    sx: {
      width: "96px",
    },
  },
  {
    label: "DM Version",
    renderValue: (a) => a.modelVersion,
    field: "modelVersion",
    hideable: true,
    sx: {
      width: "79px",
    },
  },
  {
    label: "Organization",
    renderValue: (a) => <TruncatedText text={a.organization.name} />,
    fieldKey: "organization.name",
  },
  {
    label: "Study",
    renderValue: (a) => <TruncatedText text={a.studyAbbreviation} />,
    field: "studyAbbreviation",
    hideable: false,
  },

  {
    label: "dbGaP ID",
    renderValue: (a) => <TruncatedText text={a.dbGaPID} />,
    field: "dbGaPID",
    hideable: true,
  },

  {
    label: "Status",
    renderValue: (a) => a.status,
    field: "status",
    hideable: false,
    sx: {
      width: "87px",
    },
  },
  {
    label: "Primary Contact",
    renderValue: (a) => <TruncatedText text={a.conciergeName} />,
    field: "conciergeName",
    hideable: true,
  },

  {
    label: "Node Count",
    renderValue: (a) =>
      Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(a.nodeCount || 0),
    field: "nodeCount",
  },
  {
    label: "Created Date",
    renderValue: (a) =>
      a.createdAt ? (
        <StyledDateTooltip title={FormatDate(a.createdAt, "M/D/YYYY h:mm A")} placement="top">
          <span>{FormatDate(a.createdAt, "M/D/YYYY")}</span>
        </StyledDateTooltip>
      ) : (
        ""
      ),
    field: "createdAt",
    hideable: true,
    sx: {
      width: "92px",
    },
  },
  {
    label: "Last Updated",
    renderValue: (a) =>
      a.updatedAt ? (
        <StyledDateTooltip title={FormatDate(a.updatedAt, "M/D/YYYY h:mm A")} placement="top">
          <span>{FormatDate(a.updatedAt, "M/D/YYYY")}</span>
        </StyledDateTooltip>
      ) : (
        ""
      ),
    field: "updatedAt",
    hideable: true,
    default: true,
    sx: {
      width: "108px",
    },
  },
];

/**
 * View for List of Questionnaire/Submissions
 *
 * @returns {JSX.Element}
 */
const ListingView: FC = () => {
  usePageTitle("Data Submission List");

  const { state } = useLocation();
  const { status: authStatus } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const { status: orgStatus, activeOrganizations } = useOrganizationListContext();
  // Only org owners/submitters with organizations assigned can create data submissions

  const { columnVisibilityModel, setColumnVisibilityModel, visibleColumns } = useColumnVisibility<
    Column<T>
  >({
    columns,
    getColumnKey: (c) => c.fieldKey ?? c.field,
    localStorageKey: "dataSubmissionListColumns",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [data, setData] = useState<T[]>([]);
  const [submitterNames, setSubmitterNames] = useState<string[]>([]);
  const [dataCommons, setDataCommons] = useState<string[]>([]);
  const [totalData, setTotalData] = useState<number>(0);
  const tableRef = useRef<TableMethods>(null);
  const filtersRef = useRef<FilterForm>({
    organization: "All",
    status: "All",
    dataCommons: "All",
    name: "",
    dbGaPID: "",
    submitterName: "All",
  });

  const [listSubmissions, { refetch }] = useLazyQuery<ListSubmissionsResp, ListSubmissionsInput>(
    LIST_SUBMISSIONS,
    {
      context: { clientName: "backend" },
      fetchPolicy: "cache-and-network",
    }
  );

  const handleFetchData = async (fetchListing: FetchListing<T>, force: boolean) => {
    const { first, offset, sortDirection, orderBy } = fetchListing || {};
    try {
      setLoading(true);

      if (!activeOrganizations?.length || !filtersRef.current) {
        return;
      }

      const {
        organization,
        status,
        submitterName,
        name,
        dbGaPID,
        dataCommons: dc,
      } = filtersRef.current;

      const { data: d, error } = await listSubmissions({
        variables: {
          organization: organization ?? "All",
          status: status ?? "All",
          dataCommons: dc ?? "All",
          submitterName: submitterName ?? "All",
          ...(name && { name }),
          ...(dbGaPID && { dbGaPID }),
          first,
          offset,
          sortDirection,
          orderBy,
        },
        context: { clientName: "backend" },
        fetchPolicy: "no-cache",
      });
      if (error || !d?.listSubmissions) {
        throw new Error("Unable to retrieve Data Submission List results.");
      }

      setData(d.listSubmissions.submissions);
      setSubmitterNames(d.listSubmissions.submitterNames?.filter((sn) => !!sn.trim()));
      setDataCommons(d.listSubmissions.dataCommons?.filter((dc) => !!dc.trim()));
      setTotalData(d.listSubmissions.total);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

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
        throw new Error("Unable to retrieve Data Submission List results.");
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

  const handleOnFiltersChange = (data: FilterForm) => {
    if (isEqual(data, filtersRef.current)) {
      return;
    }

    filtersRef.current = { ...data };
    setTablePage(0);
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
            <CreateDataSubmissionDialog onCreate={handleOnCreateSubmission} />
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
          <DataSubmissionListFilters
            columns={columns}
            submitterNames={submitterNames}
            dataCommons={dataCommons}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={setColumnVisibilityModel}
            onChange={handleOnFiltersChange}
          />

          <GenericTable
            ref={tableRef}
            columns={visibleColumns}
            data={data || []}
            total={totalData || 0}
            loading={
              loading || orgStatus === OrgStatus.LOADING || authStatus === AuthStatus.LOADING
            }
            defaultRowsPerPage={20}
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
