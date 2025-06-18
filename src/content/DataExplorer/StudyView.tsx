import { FC, memo, useCallback, useMemo, useRef, useState } from "react";
import { Box, styled } from "@mui/material";
import { Navigate, useNavigate } from "react-router-dom";
import { useLazyQuery, useQuery } from "@apollo/client";
import { cloneDeep, isEqual, sortBy } from "lodash";
import usePageTitle from "../../hooks/usePageTitle";
import bannerPng from "../../assets/banner/submission_banner.png";
import GenericTable, { Column } from "../../components/GenericTable";
import { useColumnVisibility } from "../../hooks/useColumnVisibility";
import DataExplorerFilters, { FilterForm } from "../../components/DataExplorerFilters";
import { useSearchParamsContext } from "../../components/Contexts/SearchParamsContext";
import {
  GET_APPROVED_STUDY,
  GET_RELEASED_NODE_TYPES,
  GetApprovedStudyInput,
  GetApprovedStudyResp,
  GetReleasedNodeTypesInput,
  GetReleasedNodeTypesResp,
  LIST_RELEASED_DATA_RECORDS,
  ListReleasedDataRecordsInput,
  ListReleasedDataRecordsResponse,
} from "../../graphql";
import { coerceToString, Logger } from "../../utils";
import SuspenseLoader from "../../components/SuspenseLoader";
import PageContainer from "../../components/PageContainer";
import NavigationBreadcrumbs, { BreadcrumbEntry } from "../../components/NavigationBreadcrumbs";
import TruncatedText from "../../components/TruncatedText";

const StyledBreadcrumbsBox = styled(Box)({
  height: "50px",
  display: "flex",
  alignItems: "center",
  padding: "0 54px",
});

const StyledFilterTableWrapper = styled(Box)({
  borderRadius: "8px",
  background: "#FFF",
  border: "1px solid #6CACDA",
  marginBottom: "25px",
});

type T = ListReleasedDataRecordsResponse["listReleasedDataRecords"]["nodes"][number];

type StudyViewProps = {
  _id: string;
};

const StudyView: FC<StudyViewProps> = ({ _id: studyId }) => {
  usePageTitle(`Data Explorer - ${studyId}`);

  const { searchParams } = useSearchParamsContext();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<T[]>([]);
  const [columnNames, setColumnNames] = useState<string[]>([]);
  const [totalData, setTotalData] = useState<number>(0);

  const tableRef = useRef<TableMethods>(null);
  const filtersRef = useRef<FilterForm>();

  // TODO: technically this is dataCommonsDisplayName, we should rename it
  const dataCommons = searchParams.get("dataCommons");

  const { data: studyData, loading: studyLoading } = useQuery<
    GetApprovedStudyResp<true>,
    GetApprovedStudyInput
  >(GET_APPROVED_STUDY, {
    variables: { _id: studyId, partial: true },
    skip: !studyId,
    fetchPolicy: "cache-first",
    context: { clientName: "backend" },
    onError: (error) => {
      Logger.error("Error fetching study data:", error);
      navigate("/data-explorer", {
        state: { alert: true, error: "Oops! An error occurred while fetching the study data." },
      });
    },
  });

  const { data: nodesData, loading: nodesLoading } = useQuery<
    GetReleasedNodeTypesResp,
    GetReleasedNodeTypesInput
  >(GET_RELEASED_NODE_TYPES, {
    // TODO: Why no dataCommons param?
    variables: { studyId },
    skip: !studyId,
    fetchPolicy: "cache-first",
    context: { clientName: "backend" },
    onError: (error) => {
      Logger.error("Error fetching node list:", error);
      navigate("/data-explorer", {
        state: {
          alert: true,
          error: "Oops! An error occurred while fetching the list of released nodes.",
        },
      });
    },
  });

  const [listReleasedDataRecords] = useLazyQuery<
    ListReleasedDataRecordsResponse,
    ListReleasedDataRecordsInput
  >(LIST_RELEASED_DATA_RECORDS, {
    context: { clientName: "backend" },
    fetchPolicy: "cache-and-network",
  });

  const columnVisibilityKey = useMemo<string>(
    () => `dataExplorerColumns:${studyId}:${dataCommons}:${filtersRef.current?.nodeType}`,
    [studyId, dataCommons, filtersRef.current?.nodeType]
  );

  const nodeTypeOptions = useMemo<string[]>(() => {
    if (!nodesData || !nodesData?.getReleaseNodeTypes?.nodes.length) {
      return [];
    }

    const clonedData = cloneDeep(nodesData.getReleaseNodeTypes.nodes).sort(
      (a, b) => a.count - b.count
    );

    return clonedData.map((node) => node.name);
  }, [nodesData]);

  const defaultValues = useMemo<FilterForm>(
    () => ({
      nodeType: nodeTypeOptions?.[0] || "",
    }),
    [nodeTypeOptions]
  );

  const studyDisplayName = useMemo<string>(
    () =>
      studyData?.getApprovedStudy?.studyAbbreviation ||
      studyData?.getApprovedStudy?.studyName ||
      "",
    [studyData]
  );

  const breadcrumbs = useMemo<BreadcrumbEntry[]>(
    () => [
      {
        label: "Data Explorer",
        to: "/data-explorer",
      },
      {
        label: studyDisplayName,
      },
    ],
    [studyDisplayName]
  );

  const columns = useMemo<Column<T>[]>(
    () =>
      columnNames?.map((prop, idx) => ({
        label: prop,
        renderValue: (d: T) => (
          <TruncatedText
            text={coerceToString(d[prop])}
            maxCharacters={20}
            disableInteractiveTooltip={false}
            arrow
            ellipsis
            underline
          />
        ),
        field: prop,
        default: idx === 0 ? true : undefined, // TODO: Boolean based on ID Key
        hideable: true, // TODO: Boolean based on ID Key
      })) || [],
    [columnNames]
  );

  const { visibleColumns, columnVisibilityModel, setColumnVisibilityModel } = useColumnVisibility<
    Column<T>
  >({
    columns,
    getColumnKey: (c) => c.fieldKey ?? c.field,
    localStorageKey: columnVisibilityKey,
  });

  const handleFetchData = useCallback(
    async (params: FetchListing<T>, force: boolean) => {
      const { offset, orderBy, first, sortDirection } = params;

      setLoading(true);
      const { data, error } = await listReleasedDataRecords({
        variables: {
          studyId,
          // TODO: why no dataCommons param?
          nodeType: filtersRef.current?.nodeType,
          offset,
          orderBy,
          first,
          sortDirection,
        },
      });

      if (error) {
        Logger.error(
          "Error occurred while fetching released records for node",
          filtersRef?.current?.nodeType,
          error
        );
        setLoading(false);
        return;
      }

      setData(data?.listReleasedDataRecords?.nodes || []);
      setTotalData(data?.listReleasedDataRecords?.total || 0);

      const sortedNewCols = sortBy(data?.listReleasedDataRecords?.properties || []);
      if (!isEqual(sortBy(columnNames), sortedNewCols)) {
        setColumnNames(sortedNewCols);
      }

      setLoading(false);
    },
    [studyId, columnNames, filtersRef.current, listReleasedDataRecords]
  );

  const handleFilterChange = useCallback(
    (data: FilterForm) => {
      filtersRef.current = data;
      tableRef.current?.setPage(0, true);
    },
    [filtersRef.current, tableRef.current]
  );

  if (studyLoading || nodesLoading) {
    return <SuspenseLoader fullscreen data-testid="study-view-loader" />;
  }

  if (!studyData?.getApprovedStudy?._id || !dataCommons || !nodeTypeOptions?.length) {
    return (
      <Navigate
        to="/data-explorer"
        state={{ alert: true, error: "Oops! An invalid study or data commons was provided." }}
      />
    );
  }

  return (
    <Box data-testid="study-view-container">
      {/* Page Breadcrumbs */}
      <StyledBreadcrumbsBox>
        <NavigationBreadcrumbs entries={breadcrumbs} />
      </StyledBreadcrumbsBox>

      {/* Page Header, Filters, & Table */}
      <PageContainer
        background={bannerPng}
        title="Data Explorer for Study - "
        titleSuffix={studyDisplayName}
        // TODO: need real text here
        description="lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
      >
        <StyledFilterTableWrapper>
          <DataExplorerFilters
            columns={columns}
            nodeTypes={nodeTypeOptions}
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
            // TODO: use IDPropName from data instead of index
            setItemKey={(_, index) => `data-${index}`}
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
      </PageContainer>
    </Box>
  );
};

export default memo<StudyViewProps>(StudyView);
