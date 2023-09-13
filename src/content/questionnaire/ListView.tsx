import React, { FC, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Alert, Container, Button, Stack, styled,
  Table, TableBody, TableCell,
  TableContainer, TableHead,
  TablePagination, TableRow,
  TableSortLabel, Typography, Box, CircularProgress,
} from "@mui/material";
import { LoadingButton } from '@mui/lab';
import { useMutation, useQuery } from '@apollo/client';
import { query, Response } from '../../graphql/listApplications';
import bannerSvg from "../../assets/banner/list_banner.svg";
import PageBanner from '../../components/PageBanner';
import { FormatDate } from '../../utils';
import { useAuthContext } from '../../components/Contexts/AuthContext';
import { mutation as SAVE_APP, Response as SaveAppResp } from '../../graphql/saveApplication';

type T = Omit<Application, "questionnaireData">;

type Column = {
  label: string;
  value: (a: T, user: User) => string | boolean | number | React.ReactNode;
  field?: string;
  default?: true;
};

const StyledButton = styled(LoadingButton)({
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
  background: "#22A584 !important",
  marginRight: "25px",
});

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
    field: "applicant.applicantName",
  },
  {
    label: "Organization",
    value: (a) => a?.organization?.name,
    field: "organization.name",
  },
  {
    label: "Study",
    value: (a) => a.studyAbbreviation || "NA",
    field: "studyAbbreviation",
  },
  {
    label: "Program",
    value: (a) => a.programName || "NA",
    field: "programName",
  },
  {
    label: "Status",
    value: (a) => a.status,
    field: "status",
  },
  {
    label: "Submitted Date",
    value: (a) => (a.submittedDate ? FormatDate(a.submittedDate, "M/D/YYYY h:mm A") : ""),
    field: "submittedDate",
    default: true,
  },
  {
    label: "Last Updated Date",
    value: (a) => (a.updatedAt ? FormatDate(a.updatedAt, "M/D/YYYY h:mm A") : ""),
    field: "updatedAt",
  },
  {
    label: "Action",
    value: (a, user) => {
      const role = user?.role;

      if (((role === "User" || role === "Submitter" || role === "Organization Owner") && a.applicant?.applicantID === user._id) && ["New", "In Progress", "Rejected"].includes(a.status)) {
        return (
          <Link to={`/submission/${a?.["_id"]}`}>
            <StyledActionButton bg="#99E3BB" text="#156071" border="#63BA90">Resume</StyledActionButton>
          </Link>
        );
      }
      if (role === "Federal Lead" && ["Submitted", "In Review"].includes(a.status)) {
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
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user } = useAuthContext();

  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState<Column>(
    columns.find((c) => c.default)
    || columns.find((c) => c.field)
  );
  const [page, setPage] = useState<number>(0);
  const [perPage, setPerPage] = useState<number>(10);
  const [creatingApplication, setCreatingApplication] = useState<boolean>(false);

  const { data, loading, error } = useQuery<Response>(query, {
    variables: {
      first: perPage,
      offset: page * perPage,
      sortDirection: order.toUpperCase(),
      orderBy: orderBy.field,
    },
    context: { clientName: 'backend' },
    fetchPolicy: "no-cache",
  });

  const [saveApp] = useMutation<SaveAppResp, { application: ApplicationInput }>(SAVE_APP, {
    context: { clientName: 'backend' },
    fetchPolicy: 'no-cache'
  });

  // eslint-disable-next-line arrow-body-style
  const emptyRows = useMemo(() => {
    return (page > 0 && data?.listApplications?.total)
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

  const createApp = async () => {
    setCreatingApplication(true);
    const { data: d, errors } = await saveApp({
      variables: {
        application: {
          _id: undefined,
          programName: "",
          studyAbbreviation: "",
          questionnaireData: "{}",
        }
      }
    });

    setCreatingApplication(false);

    if (errors) {
      navigate("", {
        state: {
          error: "Unable to create a submission request. Please try again later"
        }
      });
      return;
    }

    navigate(`/submission/${d?.saveApplication?.["_id"] || "new"}`);
  };

  return (
    <>
      <PageBanner
        title="Submission Request List"
        subTitle="Below is a list of applications that are associated with your account. Please click on any of the applications to review or continue work."
        padding="57px 0 0 25px"
        body={(
          <StyledBannerBody direction="row" alignItems="center" justifyContent="flex-end">
            {(user?.role === "User" || user?.role === "Submitter" || user?.role === "Organization Owner") && (
              <StyledButton
                type="button"
                onClick={createApp}
                loading={creatingApplication}
              >
                Start a Submission Request
              </StyledButton>
            )}
          </StyledBannerBody>
        )}
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
            <StyledTableHead>
              <TableRow>
                {columns.map((col: Column) => (
                  <StyledHeaderCell key={col.label}>
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
            </StyledTableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell>
                    <Box
                      sx={{
                        position: 'absolute',
                        background: '#fff',
                        left: 0,
                        top: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: "9999",
                      }}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <CircularProgress size={64} disableShrink thickness={3} />
                    </Box>
                  </TableCell>
                </TableRow>
              )}
              {data?.listApplications?.applications?.map((d: T) => (
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
              {(!data?.listApplications?.total || data?.listApplications?.total === 0) && (
                <TableRow style={{ height: 53 * 10 }}>
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
            rowsPerPageOptions={[5, 10, 20, 50]}
            component="div"
            count={data?.listApplications?.total || 0}
            rowsPerPage={perPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={handleChangeRowsPerPage}
            nextIconButtonProps={{
              disabled: perPage === -1
                || !data?.listApplications
                || data?.listApplications?.total === 0
                || data?.listApplications?.total <= (page + 1) * perPage
                || emptyRows > 0
                || loading
            }}
            backIconButtonProps={{ disabled: page === 0 || loading }}
          />
        </StyledTableContainer>
      </StyledContainer>
    </>
  );
};

export default ListingView;
