import { useRef, useState } from "react";
import { Alert, Box, Container, styled, TableCell, TableHead } from "@mui/material";
import { isEqual } from "lodash";
import { useLocation } from "react-router-dom";
import { useLazyQuery } from "@apollo/client";
import PageBanner from "../../components/PageBanner";
import usePageTitle from "../../hooks/usePageTitle";
import bannerSvg from "../../assets/banner/submission_banner.png";
import GenericTable, { Column } from "../../components/GenericTable";
import { useColumnVisibility } from "../../hooks/useColumnVisibility";
import {
  LIST_RELEASED_STUDIES,
  ListReleasedStudiesInput,
  ListReleasedStudiesResp,
} from "../../graphql";
import { Status as AuthStatus, useAuthContext } from "../../components/Contexts/AuthContext";
import { Logger } from "../../utils";
import ListFilters, { defaultValues, FilterForm } from "./ListFilters";

const StyledContainer = styled(Container)({
  marginTop: "-62px",
});

const StyledAlert = styled(Alert)({
  marginBottom: "24px",
  padding: "16px",
});

const StyledFilterTableWrapper = styled(Box)({
  borderRadius: "8px",
  background: "#FFF",
  border: "1px solid #6CACDA",
  marginBottom: "25px",
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

const columns: Column<T>[] = [
  {
    label: "Study Abbreviation",
    renderValue: (a) => a.studyAbbreviation,
    field: "studyAbbreviation",
  },
  {
    label: "Study Name",
    renderValue: (a) => a.studyName,
    field: "studyName",
  },
  {
    label: "Data Commons",
    renderValue: (a) => a.dataCommonsDisplayNames,
    field: "dataCommonsDisplayNames",
  },
  {
    label: "dbGaP ID",
    renderValue: (a) => a.dbGaPID,
    field: "dbGaPID",
  },
];

type T = ListReleasedStudiesResp["listReleasedStudies"]["studies"][number];

const ListView = () => {
  usePageTitle("Data Explorer");
  const { state } = useLocation();
  const { status: authStatus } = useAuthContext();
  const { columnVisibilityModel, setColumnVisibilityModel, visibleColumns } = useColumnVisibility<
    Column<T>
  >({
    columns,
    getColumnKey: (c) => c.fieldKey ?? c.field,
    localStorageKey: "dataSubmissionListColumns",
  });

  const [data, setData] = useState<ListReleasedStudiesResp["listReleasedStudies"] | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const tableRef = useRef<TableMethods>(null);
  const filtersRef = useRef<FilterForm>({ ...defaultValues });

  const [listReleasedStudies] = useLazyQuery<ListReleasedStudiesResp, ListReleasedStudiesInput>(
    LIST_RELEASED_STUDIES,
    {
      context: { clientName: "backend" },
      fetchPolicy: "cache-and-network",
    }
  );

  const handleFetchData = async (fetchListing: FetchListing<T>, force: boolean) => {
    const { first, offset, sortDirection, orderBy } = fetchListing || {};
    try {
      setLoading(true);

      if (!filtersRef.current) {
        return;
      }

      const { name, dbGaPID, dataCommonsDisplayNames: dc } = filtersRef.current || {};

      const { data: d, error } = await listReleasedStudies({
        variables: {
          name: name || undefined,
          dbGaPID: dbGaPID || undefined,
          dataCommonsDisplayNames: dc ?? ["All"],
          first,
          offset,
          sortDirection,
          orderBy,
        },
        context: { clientName: "backend" },
        fetchPolicy: "no-cache",
      });
      if (error || !d?.listReleasedStudies) {
        throw new Error("Unable to retrieve Data Explorer results.");
      }

      setData(d.listReleasedStudies);
    } catch (err) {
      Logger.error("Error while fetching Data Explorer data", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOnFiltersChange = (data: FilterForm) => {
    if (isEqual(data, filtersRef.current)) {
      return;
    }

    filtersRef.current = { ...data };
    setTablePage(0);
  };

  const setTablePage = (page: number) => {
    tableRef.current?.setPage(page, true);
  };

  return (
    <>
      <PageBanner
        title="Data Explorer"
        subTitle="The list below shows studies associated with your account. Select a study to view metadata that has already been released and completed."
        padding="57px 0 0 25px"
        bannerSrc={bannerSvg}
      />

      <StyledContainer maxWidth="xl">
        {(state?.error || error) && (
          <StyledAlert severity="error">
            {state?.error || "An error occurred while loading the data."}
          </StyledAlert>
        )}

        <StyledFilterTableWrapper>
          <ListFilters
            data={data}
            columns={columns}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={setColumnVisibilityModel}
            onChange={handleOnFiltersChange}
          />

          <GenericTable
            ref={tableRef}
            columns={visibleColumns}
            data={data?.studies || []}
            total={data?.total || 0}
            loading={loading || authStatus === AuthStatus.LOADING}
            defaultRowsPerPage={20}
            defaultOrder="desc"
            disableUrlParams={false}
            position="bottom"
            noContentText="You either do not have the appropriate permissions to view data submissions, or there are no data submissions associated with your account."
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

export default ListView;
