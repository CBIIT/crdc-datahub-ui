import React, { FC, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Alert, Container, Stack, styled,
  Table, TableBody, TableCell,
  TableContainer, TableHead,
  TablePagination, TableRow,
  TableSortLabel, Typography, Box, CircularProgress,
  Dialog, DialogTitle
} from "@mui/material";
import { LoadingButton } from '@mui/lab';
import { useMutation, useQuery } from '@apollo/client';
import { query, Response } from '../../graphql/listDataSubmissions';
import bannerSvg from "../../assets/banner/data_submissions_banner.png";
import PageBanner from '../../components/PageBanner';
import { FormatDate } from '../../utils';
import { useAuthContext } from '../../components/Contexts/AuthContext';
import { mutation as CREATE_DATA_SUBMISSION, Response as CreateDataSubmissionResp } from '../../graphql/createDataSubmission';
import SelectInput from "../../components/Questionnaire/SelectInput";
import TextInput from "../../components/Questionnaire/TextInput";

type T = DataSubmission;

type Column = {
  label: string;
  value: (a: T, user: User) => string | boolean | number | React.ReactNode;
  field?: string;
  default?: true;
};

const StyledButton = styled(LoadingButton)({
  height: "51px",
  width: "261px",
  padding: "14px 20px",
  fontWeight: 700,
  fontSize: "16px",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  letterSpacing: "2%",
  lineHeight: "20.14px",
  borderRadius: "8px",
  color: "#fff",
  textTransform: "none",
  borderColor: "#005EA2 !important",
  background: "#005EA2 !important",
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

const OrganizationStatusContainer = styled('div')({
  height: "45px",
  fontFamily: "Nunito",
  fontSize: "16px",
  fontWeight: "700",
  lineHeight: "20px",
  letterSpacing: "0em",
  textAlign: "left",
  display: "flex",
  alignItems: "center",
  paddingLeft: "16px",
});

const StyledHeaderCell = styled(TableCell)({
  fontWeight: 700,
  fontSize: "16px",
  color: "#fff !important",
  "&.MuiTableCell-root": {
    padding: "8px 8px",
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
  },
  "&:last-of-type": {
    paddingRight: "4px",
  },
});

const columns: Column[] = [
  {
    label: "Submission ID",
    value: (a) => a._id,
    field: "applicant.applicantName",
  },
  {
    label: "Submitter Name",
    value: (a) => a.submitterName,
    field: "applicant.applicantName",
  },
  {
    label: "Data Commons",
    value: (a) => a.dataCommons,
    field: "applicant.applicantName",
  },
  {
    label: "Organization",
    value: (a) => a.organization,
    field: "organization.name",
  },
  {
    label: "Study",
    value: (a) => a.studyAbbreviation,
    field: "studyAbbreviation",
  },
  {
    label: "dbGap ID",
    value: (a) => a.dbGapID,
    field: "studyAbbreviation",
  },
  {
    label: "Status",
    value: (a) => a.status,
    field: "status",
  },
  {
    label: "Data Hub Concierge",
    value: (a) => a.concierge,
    field: "applicant.applicantName",
  },
  {
    label: "Last Updated Date",
    value: (a) => (a.updatedAt ? FormatDate(a.updatedAt, "M/D/YYYY h:mm A") : ""),
    field: "updatedAt",
  },
];

const CreateSubmissionDialog = styled(Dialog)`
  .MuiDialog-paper {
    width: 803px;
    height: 740px;
    border-radius: 8px;
    border: 2px solid #5AB8FF;
    background: #F2F6FA;
    max-width: none;
    max-height: none;
  }
  .closeIcon {
    cursor: pointer;
    text-align: end;
    width: fit-content;
    float: right;
  }
  .create-a-submission-header-container {
    left: 75px;
    display: flex;
    flex-direction: column;
    position: relative;
  }
  #create-a-submission-title {
    font-family: Nunito Sans;
    font-size: 45px;
    font-weight: 800;
    line-height: 40px;
    letter-spacing: -1.5px;
    text-align: left;
    color: #1873BD;
    position: relative;
  }
  .optional-helper-text {
    padding-top: 20px;
    font-family: Inter;
    font-size: 16px;
    font-weight: 400;
    line-height: 22px;
    letter-spacing: 0em;
    text-align: left;
    width: 445px;
  }
  .inputs-container{
    align-self: center;
    width: 485px;
    height: 365px;
    margin-top: 50px;
    font-family: Nunito;
    font-size: 16px;
    font-weight: 700;
    line-height: 20px;
    letter-spacing: 0em;
    text-align: left;
    display: flex;
    flex-direction: column;
  }
  .dialogButton{
    display: flex;
    width: 128px;
    height: 50.59000015258789px;
    padding: 12px 36.5px 14.59000015258789px 36.5px;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    border: 1px solid #000;
    margin-top: 50px;
    text-decoration: none;
    color: rgba(0, 0, 0, 0.87);
    margin-left: 7px;
    margin-right: 7px;
    align-self: center;
    cursor: pointer;
  }
`;
const statusValues: DataSubmissionStatus[] = ["New", "In Progress", "Submitted", "Released", "Completed", "Archived"];
const statusOptionArray: SelectOption[] = statusValues.map((v) => ({ label: v, value: v }));
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
  const [creatingSubmission, setCreatingSubmission] = useState<boolean>(false);
  const [dataCommons, setDataCommons] = useState<string>("CDS");
  const [study, setStudy] = useState<string>("COAS1");
  const [submissionName, setSubmissionName] = useState<string>("");

  const tempDataSubmissions: Array<T> = [
   {
   _id: "00001", // aka. submissionID
   name: "random name 1",
   submitterID: "123123123",
   submitterName: "john doe", // <first name> <last name>
   organization: "random org",
   dataCommons: "CDS",
   modelVersion: "0.0.1", // # for future use
   studyAbbreviation: "studyAbrv",
   dbGapID: "2742-26", // # aka. phs number
   bucketName: "todo: what is this", // # populated from organization
   rootPath: "todo: no clue waht this is", // # a submission folder will be created under this path, default is / or "" meaning root folder
   status: "New", // [New, In Progress, Submitted, Released, Canceled, Transferred, Completed, Archived]
   history: [{
    status: "New", // # [New, In Progress, Submitted, In Review, Approved, Rejected]
    reviewComment: "todo: ", // # if applicable
    dateTime: "todo: date", // # YYYY-MM-DDTHH:MM:SS format
    userID: "todo: ",
  }],
   concierge: "filler concierge", // # Concierge name
   createdAt: "dunno", // # ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
   updatedAt: "2023-05-01T09:23:30Z", // # ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
  },
  {
    _id: "00002", // aka. submissionID
    name: "random name 1",
    submitterID: "123123123",
    submitterName: "john doe", // <first name> <last name>
    organization: "random org",
    dataCommons: "CDS",
    modelVersion: "0.0.1", // # for future use
    studyAbbreviation: "studyAbrv",
    dbGapID: "2742-26", // # aka. phs number
    bucketName: "todo: what is this", // # populated from organization
    rootPath: "todo: no clue waht this is", // # a submission folder will be created under this path, default is / or "" meaning root folder
    status: "New", // [New, In Progress, Submitted, Released, Canceled, Transferred, Completed, Archived]
    history: [{
     status: "New", // # [New, In Progress, Submitted, In Review, Approved, Rejected]
     reviewComment: "todo: ", // # if applicable
     dateTime: "todo: date", // # YYYY-MM-DDTHH:MM:SS format
     userID: "todo: ",
   }],
    concierge: "filler concierge", // # Concierge name
    createdAt: "dunno", // # ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
    updatedAt: "2023-05-01T09:23:30Z", // # ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
   },
      {
    _id: "00003", // aka. submissionID
    name: "random name 1",
    submitterID: "123123123",
    submitterName: "john doe", // <first name> <last name>
    organization: "random org",
    dataCommons: "CDS",
    modelVersion: "0.0.1", // # for future use
    studyAbbreviation: "studyAbrv",
    dbGapID: "2742-26", // # aka. phs number
    bucketName: "todo: what is this", // # populated from organization
    rootPath: "todo: no clue waht this is", // # a submission folder will be created under this path, default is / or "" meaning root folder
    status: "New", // [New, In Progress, Submitted, Released, Canceled, Transferred, Completed, Archived]
    history: [{
     status: "New", // # [New, In Progress, Submitted, In Review, Approved, Rejected]
     reviewComment: "todo: ", // # if applicable
     dateTime: "todo: date", // # YYYY-MM-DDTHH:MM:SS format
     userID: "todo: ",
   }],
    concierge: "filler concierge", // # Concierge name
    createdAt: "dunno", // # ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
    updatedAt: "2023-05-01T09:23:30Z", // # ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
   }
  ];

  const tempData = { listDataSubmissions: { total: tempDataSubmissions.length, dataSubmissions: tempDataSubmissions } };

  const { data, loading, error } = { data: tempData, loading: false, error: "" };

  // const { data, loading, error } = useQuery<Response>(query, {
  //   variables: {
  //     first: perPage,
  //     offset: page * perPage,
  //     sortDirection: order.toUpperCase(),
  //     orderBy: orderBy.field,
  //   },
  //   context: { clientName: 'backend' },
  //   fetchPolicy: "no-cache",
  // });

  const [createDataSubmission] = useMutation<CreateDataSubmissionResp, { studyAbbreviation: string, dataCommons: string, name: string }>(CREATE_DATA_SUBMISSION, {
    context: { clientName: 'backend' },
    fetchPolicy: 'no-cache'
  });

  // eslint-disable-next-line arrow-body-style
  const emptyRows = useMemo(() => {
    return (page > 0 && data?.listDataSubmissions?.total)
      ? Math.max(0, (1 + page) * perPage - (data?.listDataSubmissions?.total || 0))
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
  const onCreateSubmissionButtonClick = async () => {
    setCreatingSubmission(true);
    setDataCommons("");
    setStudy("");
    setSubmissionName("");
  };
  const createSubmission = async () => {
    const { data: d, errors } = await createDataSubmission({
      variables: {
        studyAbbreviation: study,
        dataCommons,
        name: submissionName,
      }
    });

    setCreatingSubmission(false);
    if (errors) {
      navigate("", {
        state: {
          error: "Unable to create a submission request. Please try again later"
        }
      });
      // return;
    }

    // navigate(`/submission/${d?.saveApplication?.["_id"] || "new"}`);
  };
  return (
    <>
      <PageBanner
        title="Data Submission List"
        subTitle="Below is a list of data submissions that are associated with your account. Please click on any of the data submissions to review or continue work."
        padding="57px 0 0 25px"
        body={(
          <StyledBannerBody direction="row" alignItems="center" justifyContent="flex-end">
            {/* NOTE For MVP-2: Organization Owners are just Users */}
            {user?.role === "User" && (
              <StyledButton
                type="button"
                onClick={onCreateSubmissionButtonClick}
                loading={creatingSubmission}
                sx={{ bottom: "30px", right: "50px" }}
              >
                Start a Data Submission
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
            <TableHead>
              <TableRow>
                <TableCell colSpan={12}>
                  <OrganizationStatusContainer>
                    Organization
                    <SelectInput
                      sx={{ minWidth: "300px", marginLeft: "24px", marginRight: "64px" }}
                      id="data-submissions-table-organization"
                      label=""
                      options={[{ label: "CBIIT", value: "CBIIT" }, { label: "NIH", value: "NIH" }]}
                      value=""
                      placeholder="Select an organization"
                      readOnly={false}
                    />
                    Status
                    <SelectInput
                      sx={{ minWidth: "300px", marginLeft: "24px", marginRight: "64px" }}
                      id="data-submissions-table-status"
                      label=""
                      options={statusOptionArray}
                      value=""
                      placeholder="Select a status"
                      readOnly={false}
                    />
                  </OrganizationStatusContainer>
                </TableCell>
              </TableRow>
              <TableRow sx={{ background: "#083A50" }}>
                {columns.map((col: Column, index) => (
                  <StyledHeaderCell sx={{ paddingLeft: (index === 0 ? "32px !important" : "") }} key={col.label}>
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
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell>
                    <Box
                      sx={{
                        position: 'absolute',
                        background: "#fff",
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
              {data?.listDataSubmissions?.dataSubmissions?.map((d: T, index) => (
                <TableRow sx={{ background: (index % 2 === 0 ? "#fff" : "#E3EEF9") }} tabIndex={-1} hover key={d["_id"]}>
                  {columns.map((col: Column, index) => (
                    <StyledTableCell sx={{ paddingLeft: (index === 0 ? "32px !important" : "") }} key={`${d["_id"]}_${col.label}`}>
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
              {(!data?.listDataSubmissions?.total || data?.listDataSubmissions?.total === 0) && (
                <TableRow style={{ height: 53 * 10 }}>
                  <TableCell colSpan={columns.length}>
                    <Typography
                      variant="h6"
                      align="center"
                      fontSize={18}
                      color="#AAA"
                    >
                      There are no data submissions associated with your account
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 20, 50]}
            component="div"
            count={data?.listDataSubmissions?.total || 0}
            rowsPerPage={perPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={handleChangeRowsPerPage}
            nextIconButtonProps={{
              disabled: perPage === -1
                || !data?.listDataSubmissions
                || data?.listDataSubmissions?.total === 0
                || data?.listDataSubmissions?.total <= (page + 1) * perPage
                || emptyRows > 0
                || loading
            }}
            backIconButtonProps={{ disabled: page === 0 || loading }}
          />
        </StyledTableContainer>
      </StyledContainer>
      <CreateSubmissionDialog open={creatingSubmission}>
        <DialogTitle>
          <div
            role="button"
            className="closeIcon"
            onClick={() => setCreatingSubmission(false)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setCreatingSubmission(false);
              }
            }}
          >
            <img style={{ height: 10, marginBottom: 2 }} src="https://raw.githubusercontent.com/CBIIT/datacommons-assets/main/bento/images/icons/svgs/LocalFindCaseDeleteIcon.svg" alt="close icon" />
          </div>
        </DialogTitle>
        <div className="create-a-submission-header-container">
          <div id="create-a-submission-title"> Create a Submission</div>
          <div className="optional-helper-text">
            Do we need any intro/explanatory text to lay expectations for the user here?
          </div>
        </div>
        <div className="inputs-container">
          <TextInput value="Fill with organization" label="Organization" readOnly />
          <SelectInput
            options={[{ label: "CDS", value: "CDS" }]}
            label="Data Commons"
            required
            value={dataCommons}
            onChange={(value) => setDataCommons(value)}
          />
          <SelectInput
            options={[{ label: "COAS1", value: "COAS1" }, { label: "test1", value: "test1" }, { label: "2", value: "2" }, { label: "3", value: "3" }, { label: "4", value: "4" }]}
            label="Study"
            required
            value={study}
            onChange={(value) => setStudy(value)}
          />
          <TextInput value={submissionName} onChange={(event) => setSubmissionName(event.target.value)} maxLength={25} multiline rows={2} required label="Submission Name" placeholder="25 characters allowed" />
        </div>
        <div
          role="button"
          tabIndex={0}
          id="createSubmissionDialogSubmitButton"
          className="dialogButton"
          onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      createSubmission();
                    }
                }}
          onClick={() => createSubmission()}
        >
          <strong>Submit</strong>
        </div>
      </CreateSubmissionDialog>
    </>
  );
};

export default ListingView;
