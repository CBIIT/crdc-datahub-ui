import { FC, memo, useCallback, useMemo, useRef, useState } from "react";
import { Box, Breadcrumbs, Typography } from "@mui/material";
import { Link, Navigate } from "react-router-dom";
import styled from "@emotion/styled";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import usePageTitle from "../../hooks/usePageTitle";
import PageBanner from "../../components/PageBanner";
import bannerPng from "../../assets/banner/submission_banner.png";
import GenericTable, { Column } from "../../components/GenericTable";
import { useColumnVisibility } from "../../hooks/useColumnVisibility";
import DataExplorerFilters, { FilterForm } from "../../components/DataExplorerFilters";
import { useSearchParamsContext } from "../../components/Contexts/SearchParamsContext";

const StyledBreadcrumbsBox = styled(Box)({
  height: "50px",
  display: "flex",
  alignItems: "center",
  paddingLeft: "54px",
  textUnderlineOffset: "3px",
  "& .MuiBreadcrumbs-separator": {
    color: "#71767A",
    marginLefT: "4px",
    marginRight: "4px",
  },
});

const StyledLink = styled(Link)({
  color: "inherit",
});

const StyledBreadcrumb = styled(Typography)({
  fontFamily: "Public Sans",
  fontWeight: 400,
  fontSize: "16px",
});

const StyledFilterTableWrapper = styled(Box)({
  borderRadius: "8px",
  background: "#FFF",
  border: "1px solid #6CACDA",
  marginBottom: "25px",
});

// TODO: real model from API response
type T = { columnName: string };

const columns: Column<T>[] = [
  {
    label: "columnName",
    renderValue: () => "column value",
    field: "columnName",
    hideable: true,
  },
];

type StudyViewProps = {
  studyId: string;
};

const StudyView: FC<StudyViewProps> = ({ studyId }) => {
  usePageTitle(`Data Explorer - ${studyId}`);

  const { searchParams } = useSearchParamsContext();

  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<T[]>([]);
  const [totalData, setTotalData] = useState<number>(0);

  const tableRef = useRef<TableMethods>(null);
  const filtersRef = useRef<FilterForm>();

  const dataCommons = searchParams.get("dataCommons");

  const columnVisibilityKey = useMemo<string>(
    () => `dataExplorerColumns:${studyId}:${dataCommons}:${filtersRef.current?.nodeType}`,
    [studyId, dataCommons, filtersRef.current?.nodeType]
  );

  const defaultValues = useMemo<FilterForm>(
    () => ({
      nodeType: "node-participant", // TODO: based on API response
    }),
    []
  );

  const { visibleColumns, columnVisibilityModel, setColumnVisibilityModel } = useColumnVisibility<
    Column<T>
  >({
    columns,
    getColumnKey: (c) => c.fieldKey ?? c.field,
    localStorageKey: columnVisibilityKey,
  });

  const handleFetchData = useCallback(
    async (fetchListing: FetchListing<T>, force: boolean) => {
      setLoading(false);
      setData([]);
      setTotalData(0);
    },
    // TODO: dependencies
    []
  );

  const handleFilterChange = useCallback(
    (data: FilterForm) => {
      filtersRef.current = data;
    },
    [filtersRef.current]
  );

  if (!studyId || !dataCommons) {
    // TODO: Use integrated data-explorer error display
    return <Navigate to="/data-explorer" replace />;
  }

  return (
    <Box>
      {/* Page Breadcrumbs */}
      <StyledBreadcrumbsBox>
        <Breadcrumbs separator={<NavigateNextIcon />} aria-label="navigation breadcrumb">
          <StyledBreadcrumb color="#005EA2">
            <StyledLink to="/data-explorer">Data Explorer</StyledLink>
          </StyledBreadcrumb>
          <StyledBreadcrumb color="#1B1B1B">todo: studyAbbr</StyledBreadcrumb>
        </Breadcrumbs>
      </StyledBreadcrumbsBox>

      {/* Header Banner */}
      <PageBanner
        // TODO: study abbreviation supposed to be different font
        title="Data Explorer for Study - studyAbbr"
        // TODO: approval for this text?
        subTitle="The list below shows studies associated with your account. Select a study to view metadata that has already been released and completed."
        bannerSrc={bannerPng}
      />

      {/* Page Filters & Table */}
      <StyledFilterTableWrapper>
        <DataExplorerFilters
          columns={columns}
          // TODO: this comes from the API
          nodeTypes={["node-participant", "node-sample", "node-assay"]}
          defaultValues={defaultValues}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={setColumnVisibilityModel}
          onChange={handleFilterChange}
        />

        <GenericTable
          ref={tableRef}
          columns={visibleColumns}
          data={data || []}
          total={totalData || 0}
          loading={loading}
          defaultRowsPerPage={20}
          defaultOrder="desc"
          disableUrlParams={false}
          position="bottom"
          onFetchData={handleFetchData}
          containerProps={{
            sx: {
              marginBottom: "8px",
              border: 0,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
            },
          }}
        />
      </StyledFilterTableWrapper>
    </Box>
  );
};

export default memo<StudyViewProps>(StudyView);
