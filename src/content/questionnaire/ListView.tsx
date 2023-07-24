import React, { FC, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Alert, Container, Button, Stack, styled,
  Table, TableBody, TableCell,
  TableContainer, TableHead,
  TablePagination, TableRow,
  TableSortLabel, Typography,
} from "@mui/material";
import { useQuery } from '@apollo/client';
import { query, Response } from '../../graphql/listApplications';
import bannerSvg from "../../assets/banner/list_banner.svg";
import SuspenseLoader from "../../components/SuspenseLoader";
import PageBanner from '../../components/PageBanner';
import { FormatDate } from '../../utils';
import { useAuthContext } from '../../components/Contexts/AuthContext';
import User from "../../lib/User";

type T = RecursivePartial<Application>;

type Column = {
  label: string;
  value: (a: T, user: User) => string | boolean | number | React.ReactNode;
  sortable?: true;
  default?: true;
};

const StyledButton = styled(Button)(({ theme }) => ({
  padding: "14px 11px",
  minWidth: "128px",
  fontWeight: 700,
  fontSize: "16px",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  letterSpacing: "2%",
  lineHeight: "20.14px",
  borderRadius: "8px",
  color: "#fff",
  textTransform: "none",
  borderColor: "#26B893 !important",
  background: "#22A584 !important",
  [theme.breakpoints.up("lg")]: {
    marginRight: "100px",
  },
}));

const StyledTableContainer = styled(TableContainer)({
  borderRadius: "8px",
  border: "1px solid #083A50",
  marginBottom: "25px",
});

const StyledTableHead = styled(TableHead)({
  background: "#083A50",
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

const StyledActionButton = styled(Button)(({ bg, text, border } : { bg: string, text: string, border: string }) => ({
  background: `${bg} !important`,
  borderRadius: "8px",
  border: `2px solid ${border}`,
  color: `${text} !important`,
  width: "100px",
  height: "30px",
  textTransform: "none",
  fontWeight: 700,
  fontSize: "16px",
}));

const columns: Column[] = [
  {
    label: "Submitter Name",
    value: (a) => a.applicant?.applicantName,
    sortable: true,
  },
  {
    label: "Organization",
    value: (a) => a?.organization,
    sortable: true,
  },
  {
    label: "Study",
    value: (a) => a.study?.abbreviation || "NA",
    sortable: true,
  },
  {
    label: "Program",
    value: (a) => a.program?.abbreviation || "NA",
    sortable: true,
  },
  {
    label: "Status",
    value: (a) => a.status,
    sortable: true,
  },
  {
    label: "Submitted Date",
    value: (a) => (a.submittedDate ? FormatDate(a.submittedDate, "M/D/YYYY h:mm A") : ""),
    sortable: true,
    default: true,
  },
  {
    label: "Action",
    value: (a: RecursivePartial<Application>, user) => {
      const role = user?.role;

      if (role === "User" && ["New", "In Progress", "Rejected"].includes(a.status)) {
        return (
          <Link to={`/submission/${a?.["_id"]}`}>
            <StyledActionButton bg="#99E3BB" text="#156071" border="#63BA90">Resume</StyledActionButton>
          </Link>
        );
      }
      if (role === "FederalLead" && ["Submitted", "In Review"].includes(a.status)) {
        return (
          <Link to={`/submission/${a?.["_id"]}`}>
            <StyledActionButton bg="#F1C6B3" text="#5F564D" border="#DB9C62">Review</StyledActionButton>
          </Link>
        );
      }

      return (
        <Link to={`/submission/${a?.["_id"]}`}>
          <StyledActionButton bg="#74D9E7" text="#156071" border="#84B4BE">View</StyledActionButton>
        </Link>
      );
    },
  },
];

/**
 * View for List of Questionnaire/Submissions
 *
 * @returns {JSX.Element}
 */
const ListingView: FC = () => {
  const { state } = useLocation();
  const { user } = useAuthContext();

  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState<Column>(
    columns.find((c) => c.default)
    || columns.find((c) => c.sortable)
  );
  const [page, setPage] = useState<number>(0);
  const [perPage, setPerPage] = useState<number>(5);

  const { data, loading, error } = useQuery<Response>(query, {
    variables: {
      first: perPage,
      offset: page * perPage,
      sortDirection: order.toUpperCase(),
      orderBy: orderBy.label,
    },
    context: { clientName: 'backend' },
  });

  // eslint-disable-next-line arrow-body-style
  const emptyRows = useMemo(() => {
    return page > 0
      ? Math.max(0, (1 + page) * perPage - (data?.listApplications?.total || 0))
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

  if (!data && loading) {
    return <SuspenseLoader />;
  }

  return (
    <>
      <PageBanner
        title="Submission Request List"
        pageTitle="Submission Request List"
        subTitle="Below is a list of applications that are associated with your account. Please click on any of the applications to review or continue work."
        body={(
          <Stack direction="row" alignItems="center" justifyContent="flex-end">
            {!["FederalLead"].includes(user?.role) && (
              <Link to="/submission/new">
                <StyledButton type="button">Start a Submission Request</StyledButton>
              </Link>
            )}
          </Stack>
        )}
        bannerSrc={bannerSvg}
      />

      <Container maxWidth="xl">
        {(state?.error || error) && (
          <Alert sx={{ mb: 3, p: 2 }} severity="error">
            {state?.error || "An error occurred while loading the data."}
          </Alert>
        )}

        <StyledTableContainer>
          <Table>
            <StyledTableHead>
              <TableRow>
                {columns.map((col: Column) => (
                  <StyledHeaderCell key={col.label}>
                    {col.sortable ? (
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
            </StyledTableHead>
            <TableBody>
              {data?.listApplications?.applications.map((d: T) => (
                <TableRow tabIndex={-1} hover key={d["_id"]}>
                  {columns.map((col: Column) => (
                    <StyledTableCell key={`${d["_id"]}_${col.label}`}>
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
              {(!data?.listApplications || data?.listApplications?.total === 0) && (
                <TableRow style={{ height: 53 * 5 }}>
                  <TableCell colSpan={columns.length}>
                    <Typography
                      variant="h6"
                      align="center"
                      fontSize={18}
                      color="#AAA"
                    >
                      There are no applications associated with your account
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={data?.listApplications?.total || 0}
            rowsPerPage={perPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={handleChangeRowsPerPage}
            nextIconButtonProps={{ disabled: !data?.listApplications || (data.listApplications.total < perPage) || loading }}
            backIconButtonProps={{ disabled: page === 0 || loading }}
          />
        </StyledTableContainer>
      </Container>
    </>
  );
};

export default ListingView;
