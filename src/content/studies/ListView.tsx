import { ElementType, useRef, useState } from "react";
import { Alert, Box, Button, Container, Stack, styled, TableCell, TableHead } from "@mui/material";
import { Link, LinkProps, useLocation } from "react-router-dom";
import { useLazyQuery } from "@apollo/client";
import PageBanner from "../../components/PageBanner";
import usePageTitle from "../../hooks/usePageTitle";
import GenericTable, { Column } from "../../components/GenericTable";
import {
  LIST_APPROVED_STUDIES,
  ListApprovedStudiesInput,
  ListApprovedStudiesResp,
} from "../../graphql";
import { FormatDate } from "../../utils";
import { formatAccessTypes } from "../../utils/studyUtils";
import ApprovedStudyFilters from "../../components/AdminPortal/Studies/ApprovedStudyFilters";
import TruncatedText from "../../components/TruncatedText";
import StyledTooltip from "../../components/StyledFormComponents/StyledTooltip";

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
const StyledTableHead = styled(TableHead)({
  background: "#083A50",
});

const StyledHeaderCell = styled(TableCell)({
  fontWeight: 700,
  fontSize: "14px",
  color: "#fff !important",
  "&.MuiTableCell-root": {
    padding: "8px 16px",
    color: "#fff !important",
  },
  "& .MuiSvgIcon-root,  & .MuiButtonBase-root": {
    color: "#fff !important",
  },
});

const StyledTableCell = styled(TableCell)({
  fontSize: "14px",
  color: "#083A50 !important",
  textAlign: "left",
  "&.MuiTableCell-root": {
    padding: "8px 16px",
  },
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

const columns: Column<ApprovedStudy>[] = [
  {
    label: "Name",
    renderValue: (a) => <TruncatedText text={a.studyName} />,
    field: "studyName",
    default: true,
  },
  {
    label: "Acronym",
    renderValue: (a) => <TruncatedText text={a.studyAbbreviation} />,
    field: "studyAbbreviation",
    sx: {
      width: "208px",
    },
  },
  {
    label: "dbGaPID",
    renderValue: (a) => <TruncatedText text={a.dbGaPID} maxCharacters={15} />,
    field: "dbGaPID",
  },
  {
    label: "Access Type",
    renderValue: (a) => formatAccessTypes(a.controlledAccess, a.openAccess),
    fieldKey: "accessType",
    sortDisabled: true,
    sx: {
      width: "140px",
    },
  },
  {
    label: "Principal Investigator",
    renderValue: (a) => <TruncatedText text={a.PI} />,
    field: "PI",
  },
  {
    label: "ORCID",
    renderValue: (a) => a.ORCID,
    field: "ORCID",
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
  },
  {
    label: (
      <Stack direction="row" justifyContent="center" alignItems="center">
        Action
      </Stack>
    ),
    renderValue: (a) => (
      <StyledLink to={`/studies/${a?.["_id"]}`}>
        <StyledActionButton bg="#C5EAF2" text="#156071" border="#84B4BE">
          Edit
        </StyledActionButton>
      </StyledLink>
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

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [data, setData] = useState<ApprovedStudy[]>([]);
  const [count, setCount] = useState<number>(0);
  const filtersRef = useRef<FilterForm>({
    study: "",
    dbGaPID: "",
    accessType: "All",
  });

  const tableRef = useRef<TableMethods>(null);

  const [listSubmissions] = useLazyQuery<ListApprovedStudiesResp, ListApprovedStudiesInput>(
    LIST_APPROVED_STUDIES,
    {
      context: { clientName: "backend" },
      fetchPolicy: "cache-and-network",
    }
  );

  const handleFetchData = async (fetchListing: FetchListing<ApprovedStudy>, force: boolean) => {
    const { first, offset, sortDirection, orderBy } = fetchListing || {};

    if (!filtersRef.current) {
      return;
    }

    try {
      setLoading(true);

      const { data: d, error } = await listSubmissions({
        variables: {
          first,
          offset,
          sortDirection,
          orderBy,
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

      setData(d.listApprovedStudies.studies);
      setCount(d.listApprovedStudies.total);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const setTablePage = (page: number) => {
    tableRef.current?.setPage(page, true);
  };

  const handleOnFiltersChange = (data: FilterForm) => {
    filtersRef.current = data;
    setTablePage(0);
  };

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
    </Box>
  );
};

export default ListView;
