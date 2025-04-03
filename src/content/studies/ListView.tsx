import { ElementType, useEffect, useRef, useState } from "react";
import { Alert, Box, Button, Container, Stack, styled } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { GridInitialStateCommunity } from "@mui/x-data-grid/models/gridStateCommunity";
import { Link, LinkProps, useLocation } from "react-router-dom";
import { useLazyQuery } from "@apollo/client";
import PageBanner from "../../components/PageBanner";
import usePageTitle from "../../hooks/usePageTitle";
import {
  LIST_APPROVED_STUDIES,
  ListApprovedStudiesInput,
  ListApprovedStudiesResp,
} from "../../graphql";
import { FormatDate } from "../../utils";
import StyledTooltip from "../../components/StyledFormComponents/StyledTooltip";
import GenericTableRework from "../../components/GenericTableRework";
import ApprovedStudyFilters from "../../components/AdminPortal/Studies/ApprovedStudyFilters";

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

const StyledLink = styled(Link)({
  textDecoration: "none",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100px",
});

const StyledActionButton = styled(Button)(
  ({ bg, text, border }: { bg: string; text: string; border: string }) => ({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
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

const StyledDateTooltip = styled(StyledTooltip)(() => ({
  cursor: "pointer",
}));

type FilterForm = {
  study: string;
  dbGaPID: string;
  accessType: AccessType;
};

const columns: GridColDef[] = [
  {
    headerName: "Name",
    field: "studyName",
    flex: 1,
  },
  {
    headerName: "Acronym",
    field: "studyAbbreviation",
    flex: 1,
  },
  {
    headerName: "dbGaPID",
    field: "dbGaPID",
    flex: 1,
  },
  {
    headerName: "Access Type",
    field: "accessType",
    sortable: false,
    flex: 1,
    minWidth: 0,
  },
  {
    headerName: "Principal Investigator",
    field: "PI",
    flex: 1,
  },
  {
    headerName: "ORCID",
    field: "ORCID",
    flex: 1,
  },
  {
    headerName: "Created Date",
    renderCell: (params) =>
      params.value.createdAt ? (
        <StyledDateTooltip
          title={FormatDate(params.value.createdAt, "M/D/YYYY h:mm A")}
          placement="top"
        >
          <span>{FormatDate(params.value.createdAt, "M/D/YYYY")}</span>
        </StyledDateTooltip>
      ) : (
        ""
      ),
    field: "createdAt",
    flex: 1,
  },
  {
    field: "action",
    headerName: "Action",
    headerAlign: "center",
    sortable: false,
    width: 120,
    renderCell: (params) => (
      <StyledLink to={`/studies/${params?.id}`}>
        <StyledActionButton bg="#C5EAF2" text="#156071" border="#84B4BE">
          Edit
        </StyledActionButton>
      </StyledLink>
    ),
  },
];

const initialState: GridInitialStateCommunity = {
  sorting: {
    sortModel: [{ field: "studyName", sort: "asc" }],
  },
  pagination: {
    paginationModel: { pageSize: 20, page: 0 },
  },
  filter: {
    filterModel: {
      items: [],
    },
  },
};

const ListView = () => {
  usePageTitle("Manage Studies");

  const { state } = useLocation();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState<number>(0);
  const [paginationModel, setPaginationModel] = useState(initialState.pagination.paginationModel);
  const [filterModel, setFilterModel] = useState(initialState.filter.filterModel);
  const [sortModel, setSortModel] = useState(initialState.sorting.sortModel);

  const filtersRef = useRef<FilterForm>({
    study: "",
    dbGaPID: "",
    accessType: "All",
  });

  const [listSubmissions] = useLazyQuery<ListApprovedStudiesResp, ListApprovedStudiesInput>(
    LIST_APPROVED_STUDIES,
    {
      context: { clientName: "backend" },
      fetchPolicy: "cache-and-network",
    }
  );

  const handleOnFiltersChange = (newFilters: FilterForm) => {
    filtersRef.current = newFilters;
    setFilterModel({
      items: [
        {
          field: "study",
          value: newFilters.study,
          operator: "",
        },
        {
          field: "dbGaPID",
          value: newFilters.dbGaPID,
          operator: "",
        },
        {
          field: "accessType",
          value: newFilters.accessType,
          operator: "",
        },
      ],
    });
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const offset = paginationModel.page * paginationModel.pageSize;
        const first = paginationModel.pageSize;

        let orderBy = null;
        let sortDirection = null;
        if (sortModel.length > 0) {
          orderBy = sortModel[0].field;
          sortDirection = sortModel[0].sort;
        }

        const { data: d, error } = await listSubmissions({
          variables: {
            first,
            offset,
            orderBy,
            sortDirection,
            dbGaPID: filtersRef.current.dbGaPID,
            controlledAccess: filtersRef.current.accessType,
            study: filtersRef.current.study,
          },
          context: { clientName: "backend" },
          fetchPolicy: "no-cache",
        });
        if (error || !d?.listApprovedStudies) {
          throw new Error("Unable to retrieve List Approved Studies results.");
        }

        setRows(d.listApprovedStudies.studies);
        setCount(d.listApprovedStudies.total);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [paginationModel, sortModel, filterModel, listSubmissions]);

  return (
    <Box data-testid="list-studies-container">
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
              Add Study
            </StyledButton>
          </StyledBannerBody>
        }
      />

      <StyledContainer maxWidth="xl">
        <ApprovedStudyFilters onChange={handleOnFiltersChange} />

        <GenericTableRework
          columns={columns}
          rows={rows}
          rowCount={count}
          initialState={initialState}
          loading={loading}
          pagination
          sortingMode="server"
          filterMode="server"
          paginationMode="server"
          onPaginationModelChange={setPaginationModel}
          onSortModelChange={setSortModel}
          onFilterModelChange={setFilterModel}
        />
      </StyledContainer>
    </Box>
  );
};

export default ListView;
