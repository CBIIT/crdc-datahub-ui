import { FC, memo, useCallback, useMemo, useRef, useState } from "react";
import { Box, Breadcrumbs, Typography, styled } from "@mui/material";
import { Link, Navigate, useNavigate } from "react-router-dom";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useQuery } from "@apollo/client";
import usePageTitle from "../../hooks/usePageTitle";
import bannerPng from "../../assets/banner/submission_banner.png";
import GenericTable, { Column } from "../../components/GenericTable";
import { useColumnVisibility } from "../../hooks/useColumnVisibility";
import DataExplorerFilters, { FilterForm } from "../../components/DataExplorerFilters";
import { useSearchParamsContext } from "../../components/Contexts/SearchParamsContext";
import { GET_APPROVED_STUDY, GetApprovedStudyInput, GetApprovedStudyResp } from "../../graphql";
import { Logger } from "../../utils";
import SuspenseLoader from "../../components/SuspenseLoader";
import TruncatedText from "../../components/TruncatedText";
import PageContainer from "../../components/PageContainer";

const StyledBreadcrumbsBox = styled(Box)({
  height: "50px",
  display: "flex",
  alignItems: "center",
  paddingLeft: "54px",
  textUnderlineOffset: "3px",
  "& .MuiBreadcrumbs-separator": {
    color: "#71767A",
    marginLeft: "4px",
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

type StudyViewProps = {
  _id: string;
};

const StudyView: FC<StudyViewProps> = ({ _id: studyId }) => {
  usePageTitle(`Data Explorer - ${studyId}`);

  const { searchParams } = useSearchParamsContext();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<T[]>([]);
  const [totalData, setTotalData] = useState<number>(0);

  const tableRef = useRef<TableMethods>(null);
  const filtersRef = useRef<FilterForm>();

  const dataCommons = searchParams.get("dataCommons");

  const { data: studyData, loading: studyLoading } = useQuery<
    GetApprovedStudyResp<true>,
    GetApprovedStudyInput
  >(GET_APPROVED_STUDY, {
    variables: { _id: studyId, partial: true },
    skip: !studyId,
    fetchPolicy: "cache-first",
    onError: (error) => {
      Logger.error("Error fetching study data:", error);
      navigate("/data-explorer", {
        state: { error: "Oops! An error occurred while fetching the study data." },
      });
    },
  });

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

  const columns = useMemo<Column<T>[]>(
    () =>
      new Array(10).fill(null).map((_, index) => ({
        label: `columnName${index + 1}`,
        // TODO: TruncatedText
        renderValue: () => `column value ${index + 1}`,
        field: `columnName`,
        hideable: true,
      })),
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
      // TODO: Implement API call
      setLoading(false);
      setData([{ columnName: "Sample Data" }, { columnName: "More Sample Data" }]);
      setTotalData(2);
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

  if (studyLoading) {
    return <SuspenseLoader fullscreen data-testid="study-view-loader" />;
  }

  if (!studyId || !studyData?.getApprovedStudy?._id || !dataCommons) {
    return (
      <Navigate
        to="/data-explorer"
        state={{ error: "Oops! An invalid study or data commons was provided." }}
      />
    );
  }

  return (
    <Box>
      {/* Page Breadcrumbs */}
      <StyledBreadcrumbsBox>
        <Breadcrumbs separator={<NavigateNextIcon />} aria-label="navigation breadcrumb">
          <StyledBreadcrumb color="#005EA2">
            <StyledLink to="/data-explorer">Data Explorer</StyledLink>
          </StyledBreadcrumb>
          <StyledBreadcrumb color="#1B1B1B">
            <TruncatedText
              text={studyData?.getApprovedStudy?.studyAbbreviation}
              underline={false}
              maxCharacters={100}
            />
          </StyledBreadcrumb>
        </Breadcrumbs>
      </StyledBreadcrumbsBox>

      {/* Page Header, Filters, & Table */}
      <PageContainer
        background={bannerPng}
        title="Data Explorer for Study - "
        titleSuffix={studyData?.getApprovedStudy?.studyAbbreviation}
        // TODO: need real text here
        description="lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
      >
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
      </PageContainer>
    </Box>
  );
};

export default memo<StudyViewProps>(StudyView);
